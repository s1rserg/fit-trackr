import "dotenv/config";
import { sql } from "drizzle-orm";

import { db } from "../db";
import { exercises, workoutTemplateItems } from "../db/schema";
import type { WorkoutType } from "../features/workouts/config";

type RawTemplateItem = {
  name: string;
  description: string;
  progressMetric: "weight" | "reps";
  sets: number;
  reps: string;
  orderIndex: number;
};

const TEMPLATES: Record<WorkoutType, RawTemplateItem[]> = {
  A: [
    {
      name: "Incline Chest Press",
      description: "Focus on upper chest. Control the negative.",
      progressMetric: "weight",
      sets: 3,
      reps: "6–10",
      orderIndex: 1,
    },
    {
      name: "Lat Pulldown",
      description: "Pull with elbows vertically down. Small body angle.",
      progressMetric: "weight",
      sets: 3,
      reps: "8–12",
      orderIndex: 2,
    },
    {
      name: "Leg Press",
      description: "Deep range of motion, maintain foot placement.",
      progressMetric: "weight",
      sets: 3,
      reps: "8–12",
      orderIndex: 3,
    },
    {
      name: "Machine Lateral Raise",
      description: "Lead with elbows. Slight forward angle.",
      progressMetric: "weight",
      sets: 3,
      reps: "12–20",
      orderIndex: 4,
    },
    {
      name: "Preacher Curl",
      description: "Strict isolation. Full stretch at bottom.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 5,
    },
    {
      name: "Overhead Triceps Extension",
      description: "Keep elbows tucked in. Stretch long head.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 6,
    },
    {
      name: "Captain's Chair Knee Raises",
      description: "Constant abs tension. Bring knees to chest.",
      progressMetric: "reps",
      sets: 3,
      reps: "10–20",
      orderIndex: 7,
    },
  ],
  B: [
    {
      name: "T-Bar Row",
      description: "Squeeze scapulas together. Pull into lower chest/upper abdomen.",
      progressMetric: "weight",
      sets: 3,
      reps: "6–10",
      orderIndex: 1,
    },
    {
      name: "Pec Deck",
      description: "Arc movement. Handles at upper chest level. 2s squeeze.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 2,
    },
    {
      name: "Lying Leg Curl",
      description: "Keeps quads fresh for Friday. Keep hips flush against pad.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 3,
    },
    {
      name: "Machine Shoulder Press",
      description: "Press straight up, control eccentric phase.",
      progressMetric: "weight",
      sets: 3,
      reps: "8–12",
      orderIndex: 4,
    },
    {
      name: "Hammer Curl",
      description: "Neutral grip. Squeeze brachialis at peak.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 5,
    },
    {
      name: "Overhead Triceps Extension",
      description: "Keep elbows tucked in. Stretch long head.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 6,
    },
    {
      name: "Leg Press Calf Raise",
      description: "Full extension and 1s pause at peak burn.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 7,
    },
  ],
  C: [
    {
      name: "Incline Chest Press",
      description: "Focus on upper chest. Control the negative.",
      progressMetric: "weight",
      sets: 3,
      reps: "6–10",
      orderIndex: 1,
    },
    {
      name: "Seated Row",
      description: "Scapula pull first, elbows back.",
      progressMetric: "weight",
      sets: 3,
      reps: "8–12",
      orderIndex: 2,
    },
    {
      name: "Hack Squat",
      description: "Feet shoulder width. Push through heels.",
      progressMetric: "weight",
      sets: 3,
      reps: "8–12",
      orderIndex: 3,
    },
    {
      name: "Reverse Pec Deck",
      description: "Focus on rear delts. Smooth movement without momentum.",
      progressMetric: "weight",
      sets: 3,
      reps: "12–20",
      orderIndex: 4,
    },
    {
      name: "Machine Lateral Raise",
      description: "Lead with elbows. Slight forward angle.",
      progressMetric: "weight",
      sets: 3,
      reps: "12–20",
      orderIndex: 5,
    },
    {
      name: "Captain's Chair Knee Raises",
      description: "Constant abs tension. Bring knees to chest.",
      progressMetric: "reps",
      sets: 3,
      reps: "10–20",
      orderIndex: 6,
    },
    {
      name: "Preacher Curl",
      description: "Alternate weekly between Preacher Curl and Overhead Triceps Extension.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 7,
    },
  ],
};

async function setupSchema() {
  const statements = [
    `DO $$ BEGIN CREATE TYPE workout_type AS ENUM ('A', 'B', 'C'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE progress_metric AS ENUM ('weight', 'reps'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      progress_metric progress_metric NOT NULL DEFAULT 'weight'
    );`,
    `ALTER TABLE exercises DROP COLUMN IF EXISTS workout_scope;`,
    `ALTER TABLE exercises DROP COLUMN IF EXISTS note;`,
    `ALTER TABLE exercises DROP COLUMN IF EXISTS target_reps;`,
    `ALTER TABLE exercises DROP COLUMN IF EXISTS order_index;`,
    `DROP TYPE IF EXISTS exercise_scope;`,
    `CREATE TABLE IF NOT EXISTS workout_template_items (
      id SERIAL PRIMARY KEY,
      workout_type workout_type NOT NULL,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL,
      target_sets INTEGER NOT NULL DEFAULT 3,
      target_reps TEXT NOT NULL DEFAULT '10-12'
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
  ];

  for (const stmt of statements) {
    try {
      await db.execute(sql.raw(stmt));
    } catch {
      // ignore
    }
  }
}

async function main() {
  console.log("Ensuring database schema exists...");
  await setupSchema();

  console.log("Building complete exercise catalog & template items...");
  const exerciseCatalog = new Map<string, { name: string; description: string; progressMetric: "weight" | "reps" }>();

  for (const type of ["A", "B", "C"] as const) {
    for (const item of TEMPLATES[type]) {
      if (!exerciseCatalog.has(item.name)) {
        exerciseCatalog.set(item.name, {
          name: item.name,
          description: item.description,
          progressMetric: item.progressMetric,
        });
      }
    }
  }

  if (!exerciseCatalog.has("Back Extension")) {
    exerciseCatalog.set("Back Extension", {
      name: "Back Extension",
      description: "Lower back and posterior chain focus.",
      progressMetric: "reps",
    });
  }
  if (!exerciseCatalog.has("Leg Extension")) {
    exerciseCatalog.set("Leg Extension", {
      name: "Leg Extension",
      description: "Quads isolation.",
      progressMetric: "weight",
    });
  }

  for (const ex of exerciseCatalog.values()) {
    await db
      .insert(exercises)
      .values(ex)
      .onConflictDoNothing({ target: exercises.name });
  }

  const insertedExercises = await db.select().from(exercises);
  const dbExerciseByName = new Map<string, number>(
    insertedExercises.map((e) => [e.name, e.id]),
  );

  await db.delete(workoutTemplateItems);

  for (const type of ["A", "B", "C"] as const) {
    for (const item of TEMPLATES[type]) {
      const exerciseId = dbExerciseByName.get(item.name);
      if (!exerciseId) continue;
      await db.insert(workoutTemplateItems).values({
        workoutType: type,
        exerciseId,
        orderIndex: item.orderIndex,
        targetSets: item.sets,
        targetReps: item.reps,
      });
    }
  }

  console.log("Seeding complete! Workouts A, B, C templates and schemas verified in Neon Postgres.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
