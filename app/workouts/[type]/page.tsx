import { notFound } from "next/navigation";

import { workoutTypeSchema } from "@/features/workouts/schemas";
import { getActiveWorkoutData } from "@/features/workouts/server/queries";

import { ActiveWorkoutForm } from "./components/active-workout-form";

export const dynamic = "force-dynamic";

type WorkoutPageProps = {
  params: Promise<{ type: string }>;
};

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const resolvedParams = await params;
  const parsedType = workoutTypeSchema.safeParse(resolvedParams.type);

  if (!parsedType.success) {
    notFound();
  }

  const workout = await getActiveWorkoutData(parsedType.data);

  return <ActiveWorkoutForm workout={workout} />;
}
