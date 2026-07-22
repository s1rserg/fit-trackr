import "dotenv/config";
import { sql } from "drizzle-orm";

import { db } from "../db";
import { exercises, performedExercises, workouts } from "../db/schema";
import { workoutTemplates, type WorkoutType } from "../features/workouts/config";

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
      // Ignore if already altered or enum exists
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

  console.log("Inserting updated exercise catalog...");
  const exerciseMap = new Map<
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

  for (const type of ["A", "B", "C"] as const) {
    for (const exercise of workoutTemplates[type]) {
      const existing = exerciseMap.get(exercise.name);
      if (!existing) {
        exerciseMap.set(exercise.name, {
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

  const insertedExercises = await db
    .insert(exercises)
    .values(
      Array.from(exerciseMap.values()).map((ex) => {
        let scope: "A" | "B" | "C" | "both" | "all" = "A";
        if (ex.scopes.size === 3) {
          scope = "all";
        } else if (ex.scopes.size === 2) {
          scope = "both";
        } else {
          scope = Array.from(ex.scopes)[0];
        }

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

  const definitionIds = new Map(insertedExercises.map((e: { name: string; id: number }) => [e.name, e.id]));

  console.log("Creating initial Workout A entry...");
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
      const exerciseId = definitionIds.get(item.name);
      if (!exerciseId) {
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

  console.log(`Successfully seeded Neon database with Full Body A/B/C catalog and initial Workout A session! Date: ${seededDate.toISOString()}`);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
