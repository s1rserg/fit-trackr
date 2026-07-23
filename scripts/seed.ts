import "dotenv/config";
import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";

import { db } from "../db";
import { exercises, performedExercises, workouts } from "../db/schema";
import { workoutTemplates, type WorkoutType } from "../features/workouts/config";

// Mapping from old_data/exercises.json names to our current split exercise names
const OLD_EXERCISE_NAME_MAP: Record<string, string> = {
  "Lying Leg Curl": "Lying Leg Curl",
  "Leg Press": "Leg Press",
  "Hack Calf Raises": "Leg Press Calf Raise",
  "Seated Row": "Seated Row",
  "Incline Chest Press": "Incline Chest Press",
  "Pec Deck": "Pec Deck",
  "Lat Pulldown": "Lat Pulldown",
  "Reverse Pec Deck": "Reverse Pec Deck",
  "Machine Lateral Raises": "Machine Lateral Raise",
  "Overhead Triceps Extension": "Overhead Triceps Extension",
  "Crossbody Hammer Curl": "Hammer Curl",
  "Seated Biceps Curl": "Preacher Curl",
  "Back Hyperextension": "Back Extension",
  "Captain's Chair Leg Raises": "Captain's Chair Knee Raises",
  "Leg Extensions": "Leg Extension",
};

async function setupSchema() {
  const statements = [
    `DO $$ BEGIN CREATE TYPE workout_type AS ENUM ('A', 'B', 'C'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE progress_metric AS ENUM ('weight', 'reps'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE exercise_scope AS ENUM ('A', 'B', 'C', 'both', 'all'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `ALTER TYPE workout_type ADD VALUE IF NOT EXISTS 'C';`,
    `ALTER TYPE exercise_scope ADD VALUE IF NOT EXISTS 'C';`,
    `ALTER TYPE exercise_scope ADD VALUE IF NOT EXISTS 'all';`,
    `CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      workout_scope exercise_scope NOT NULL DEFAULT 'both',
      note TEXT,
      progress_metric progress_metric NOT NULL DEFAULT 'weight',
      target_reps TEXT NOT NULL DEFAULT '10-12',
      order_index INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      type workout_type NOT NULL,
      date_completed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS performed_exercises (
      id SERIAL PRIMARY KEY,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
      note TEXT,
      weight REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL
    );`,
    `ALTER TABLE performed_exercises ALTER COLUMN weight TYPE REAL USING weight::real;`,
  ];

  for (const stmt of statements) {
    try {
      await db.execute(sql.raw(stmt));
    } catch {
      // Ignore if exists
    }
  }
}

async function main() {
  console.log("Ensuring database schema exists...");
  await setupSchema();

  console.log("Clearing old records...");
  await db.delete(performedExercises);
  await db.delete(workouts);
  await db.delete(exercises);

  // 1. Build and insert all exercises (including old exercises mapped to new names)
  console.log("Building complete exercise catalog...");
  const exerciseCatalog = new Map<
    string,
    {
      name: string;
      description: string;
      progressMetric: "weight" | "reps";
      targetReps: string;
      orderIndex: number;
      scopes: Set<WorkoutType>;
    }
  >();

  // Add new split exercises
  for (const type of ["A", "B", "C"] as const) {
    for (const exercise of workoutTemplates[type]) {
      const existing = exerciseCatalog.get(exercise.name);
      if (!existing) {
        exerciseCatalog.set(exercise.name, {
          name: exercise.name,
          description: exercise.description,
          progressMetric: exercise.progressMetric,
          targetReps: exercise.reps,
          orderIndex: exercise.orderIndex,
          scopes: new Set([type]),
        });
      } else {
        existing.scopes.add(type);
      }
    }
  }

  // Also include Back Extension if old logs referenced it
  if (!exerciseCatalog.has("Back Extension")) {
    exerciseCatalog.set("Back Extension", {
      name: "Back Extension",
      description: "Lower back and posterior chain focus.",
      progressMetric: "reps",
      targetReps: "12–15",
      orderIndex: 8,
      scopes: new Set(["A", "B"]),
    });
  }

  const insertedExercises = await db
    .insert(exercises)
    .values(
      Array.from(exerciseCatalog.values()).map((ex) => {
        let scope: "A" | "B" | "C" | "both" | "all" = "A";
        if (ex.scopes.size === 3) scope = "all";
        else if (ex.scopes.size === 2) scope = "both";
        else scope = Array.from(ex.scopes)[0];

        return {
          name: ex.name,
          description: ex.description,
          progressMetric: ex.progressMetric,
          targetReps: ex.targetReps,
          orderIndex: ex.orderIndex,
          workoutScope: scope,
        };
      }),
    )
    .returning();

  const dbExerciseByName = new Map<string, number>(
    insertedExercises.map((e: { name: string; id: number }) => [e.name, e.id]),
  );

  // 2. Read old data files
  const oldDataDir = path.join(process.cwd(), "old_data");
  const oldExercisesRaw = JSON.parse(fs.readFileSync(path.join(oldDataDir, "exercises.json"), "utf8"));
  const oldWorkoutsRaw = JSON.parse(fs.readFileSync(path.join(oldDataDir, "workouts.json"), "utf8"));
  const oldPerformedRaw = JSON.parse(fs.readFileSync(path.join(oldDataDir, "performed_exercises.json"), "utf8"));

  // Map old exercise ID -> new exercise ID
  const oldExerciseIdToNewId = new Map<number, number>();
  for (const oldEx of oldExercisesRaw as { id: number; name: string }[]) {
    const targetName = OLD_EXERCISE_NAME_MAP[oldEx.name] || oldEx.name;
    const newId = dbExerciseByName.get(targetName);
    if (newId !== undefined) {
      oldExerciseIdToNewId.set(oldEx.id, newId);
    }
  }

  console.log(`Migrating ${oldWorkoutsRaw.length} historical workout sessions from old_data...`);

  // Map old workout ID -> inserted workout ID
  const oldWorkoutIdToNewId = new Map<number, number>();

  for (const oldW of oldWorkoutsRaw as { id: number; type: string; date_completed: string }[]) {
    const [insertedW] = await db
      .insert(workouts)
      .values({
        type: oldW.type as WorkoutType,
        dateCompleted: new Date(oldW.date_completed),
      })
      .returning();

    oldWorkoutIdToNewId.set(oldW.id, insertedW.id);
  }

  console.log(`Migrating ${oldPerformedRaw.length} historical performed exercise logs...`);
  const performedBatch = [];

  for (const oldP of oldPerformedRaw as { workout_id: number; exercise_id: number; note: string | null; weight: number; reps: number; order_index: number }[]) {
    const newWId = oldWorkoutIdToNewId.get(oldP.workout_id);
    const newEId = oldExerciseIdToNewId.get(oldP.exercise_id);

    if (newWId !== undefined && newEId !== undefined) {
      performedBatch.push({
        workoutId: newWId,
        exerciseId: newEId,
        note: oldP.note,
        weight: oldP.weight,
        reps: oldP.reps,
        orderIndex: oldP.order_index,
      });
    }
  }

  // Insert performed exercises in chunks of 100
  for (let i = 0; i < performedBatch.length; i += 100) {
    const chunk = performedBatch.slice(i, i + 100);
    await db.insert(performedExercises).values(chunk);
  }

  console.log("Inserting new Workout A entry (July 22, 2026)...");
  const seededDate = new Date();
  const [workoutA] = await db
    .insert(workouts)
    .values({
      type: "A",
      dateCompleted: seededDate,
    })
    .returning();

  const workoutAEntries = [
    {
      name: "Incline Chest Press",
      weight: 50,
      reps: 12,
      note: "50x2x12. 50x10.",
      orderIndex: 1,
    },
    {
      name: "Lat Pulldown",
      weight: 55,
      reps: 10,
      note: "55x10. 50x10. 55x7.",
      orderIndex: 2,
    },
    {
      name: "Leg Press",
      weight: 80,
      reps: 12,
      note: "80x12.x3",
      orderIndex: 3,
    },
    {
      name: "Machine Lateral Raise",
      weight: 7.5,
      reps: 15,
      note: "15.x7.5x3 last set 12.",
      orderIndex: 4,
    },
    {
      name: "Preacher Curl",
      weight: 20,
      reps: 12,
      note: "20x12. 20x7. 15x7.",
      orderIndex: 5,
    },
    {
      name: "Overhead Triceps Extension",
      weight: 35,
      reps: 12,
      note: "35x12.x3 last set x7. + 4.x30",
      orderIndex: 6,
    },
    {
      name: "Leg Press Calf Raise",
      weight: 60,
      reps: 15,
      note: "60x15.x3",
      orderIndex: 7,
    },
  ];

  await db.insert(performedExercises).values(
    workoutAEntries.map((item) => {
      const exerciseId = dbExerciseByName.get(item.name);
      if (exerciseId === undefined) {
        throw new Error(`Exercise ID not found for ${item.name}`);
      }
      return {
        workoutId: workoutA.id,
        exerciseId,
        weight: item.weight,
        reps: item.reps,
        note: item.note,
        orderIndex: item.orderIndex,
      };
    }),
  );

  console.log(`Successfully migrated ${oldWorkoutsRaw.length} historical workouts + 1 new Workout A session! Date: ${seededDate.toISOString()}`);
}

main().catch((error) => {
  console.error("Seeding & migration failed:", error);
  process.exit(1);
});
