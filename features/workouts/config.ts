export type WorkoutType = "A" | "B" | "C";
export type ProgressMetric = "weight" | "reps";

export type WorkoutTemplateExercise = {
  name: string;
  description: string;
  progressMetric: ProgressMetric;
  sets: number;
  reps: string;
  orderIndex: number;
};

export const workoutMeta: Record<WorkoutType, { title: string; subtitle: string; icon: string }> = {
  A: {
    title: "Full Body A",
    subtitle: "Push + Vertical Pull",
    icon: "🅰️",
  },
  B: {
    title: "Full Body B",
    subtitle: "Back + Chest",
    icon: "🅱️",
  },
  C: {
    title: "Full Body C",
    subtitle: "Shoulders",
    icon: "🅲",
  },
};

export const workoutTemplates: Record<WorkoutType, WorkoutTemplateExercise[]> = {
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
      name: "Reverse Pec Deck",
      description: "Focus on rear delts. Smooth movement without momentum.",
      progressMetric: "weight",
      sets: 3,
      reps: "12–20",
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
      name: "Machine Shoulder Press",
      description: "Press straight up, control eccentric phase.",
      progressMetric: "weight",
      sets: 3,
      reps: "8–12",
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
      name: "Preacher Curl / Overhead Triceps Extension",
      description: "Alternate weekly between Preacher Curl and Overhead Triceps Extension.",
      progressMetric: "weight",
      sets: 3,
      reps: "10–15",
      orderIndex: 7,
    },
  ],
};
