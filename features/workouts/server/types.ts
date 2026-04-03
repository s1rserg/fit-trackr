export type SaveWorkoutSessionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };
