"use client";

import { useActionState } from "react";
import { LockKeyhole, Shield } from "lucide-react";

import { authenticateWithPin, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {
  error: null,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    authenticateWithPin,
    initialState,
  );

  return (
    <main className="flex min-h-full flex-1 items-center">
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/20 via-card to-card">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl">Unlock FitTrackr</CardTitle>
          <CardDescription>
            Enter your PIN to open the workout dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter PIN"
                className="text-center text-xl tracking-[0.35em]"
              />
            </div>

            {state.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                This is a simple personal lock screen using a secure HTTP-only cookie.
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              <LockKeyhole className="mr-2 h-5 w-5" />
              {isPending ? "Unlocking..." : "Unlock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
