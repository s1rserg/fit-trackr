export type WorkoutType = "A" | "B";
export type ProgressMetric = "weight" | "reps";

export type WorkoutTemplateExercise = {
  name: string;
  description: string;
  progressMetric: ProgressMetric;
  sets: number;
  reps: string;
  orderIndex: number;
};

export const workoutTemplates: Record<WorkoutType, WorkoutTemplateExercise[]> = {
  A: [
    {
      name: "Leg Press",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "15",
      orderIndex: 1,
    },
    {
      name: "Calf Raises",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "15-20",
      orderIndex: 2,
    },
    {
      name: "Incline Dumbbell Press (30°)",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 3,
    },
    {
      name: "Lat Pulldown",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 4,
    },
    {
      name: "Dumbbell Flyes",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "12-15",
      orderIndex: 5,
    },
    {
      name: "Seated Biceps Curl",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 6,
    },
    {
      name: "Back Extension",
      description: "",
      progressMetric: "reps",
      sets: 3,
      reps: "12-15",
      orderIndex: 7,
    },
    {
      name: "Captain's Chair Leg Raises",
      description: "",
      progressMetric: "reps",
      sets: 3,
      reps: "15",
      orderIndex: 8,
    },
  ],
  B: [
    {
      name: "Leg Curl",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 1,
    },
    {
      name: "Seated Row",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 2,
    },
    {
      name: "Pec Deck",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 3,
    },
    {
      name: "Reverse Pec Deck",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 4,
    },
    {
      name: "Triceps Pushdown",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "12-15",
      orderIndex: 5,
    },
    {
      name: "Crossbody Hammer Curl",
      description: "",
      progressMetric: "weight",
      sets: 3,
      reps: "10-12",
      orderIndex: 6,
    },
    {
      name: "Back Extension",
      description: "",
      progressMetric: "reps",
      sets: 3,
      reps: "12-15",
      orderIndex: 7,
    },
    {
      name: "Captain's Chair Leg Raises",
      description: "",
      progressMetric: "reps",
      sets: 3,
      reps: "15",
      orderIndex: 8,
    },
  ],
};
