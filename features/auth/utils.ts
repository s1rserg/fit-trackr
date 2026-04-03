import { AUTH_COOKIE_NAME } from "./config";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAuthToken(pin: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${AUTH_COOKIE_NAME}:${pin}`),
  );

  return bytesToHex(new Uint8Array(digest));
}

export async function getExpectedAuthToken() {
  const appPin = process.env.APP_PIN;

  if (!appPin) {
    throw new Error("APP_PIN is not set.");
  }

  return createAuthToken(appPin);
}
