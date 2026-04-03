import { z } from "zod";

export const pinSchema = z
  .string()
  .trim()
  .min(1, "Enter your PIN.")
  .max(32, "PIN is too long.");
