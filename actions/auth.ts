"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
} from "@/features/auth/config";
import { pinSchema } from "@/features/auth/schemas";
import { createAuthToken } from "@/features/auth/utils";

export type AuthActionState = {
  error: string | null;
};

export async function authenticateWithPin(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedPin = pinSchema.safeParse(formData.get("pin"));

  if (!parsedPin.success) {
    return {
      error: parsedPin.error.issues[0]?.message ?? "Enter your PIN.",
    };
  }

  const appPin = process.env.APP_PIN;

  if (!appPin) {
    return {
      error: "APP_PIN is not configured.",
    };
  }

  if (parsedPin.data !== appPin) {
    return {
      error: "Incorrect PIN.",
    };
  }

  const cookieStore = await cookies();
  const token = await createAuthToken(appPin);

  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  redirect("/");
}
