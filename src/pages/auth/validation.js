import { z } from "zod";

/** Reusable email field. */
export const emailField = z.string().email("Invalid email");

/** BE password complexity: 8+ chars, lower, upper, digit, special. */
const PASSWORD_COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const passwordField = z
  .string()
  .min(
    8,
    "Password must be at least 8 characters, with upper, lower, number, and special character"
  )
  .regex(
    PASSWORD_COMPLEXITY,
    "Password must be at least 8 characters, with upper, lower, number, and special character"
  );

/** Optional phone */
export const phoneFieldOptional = z.string().trim().optional();

/**
 * Score a password 0–4 by counting satisfied rules:
 * length>=8, has lower&upper, has digit, has special.
 */
export function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}
