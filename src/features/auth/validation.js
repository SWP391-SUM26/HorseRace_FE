import { z } from "zod";

/** Reusable email field. */
export const emailField = z.string().email("Email không hợp lệ");

/** BE password complexity: 8+ chars, lower, upper, digit, special. */
const PASSWORD_COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const passwordField = z
  .string()
  .min(
    8,
    "Mật khẩu cần 8+ ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
  )
  .regex(
    PASSWORD_COMPLEXITY,
    "Mật khẩu cần 8+ ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
  );

/** Optional VN phone: empty, or 0/+84/84 prefix + valid mobile number. */
const VN_PHONE = /^(0|\+84|84)[35789][0-9]{8}$/;
export const phoneFieldOptional = z
  .string()
  .trim()
  .refine((v) => v === "" || VN_PHONE.test(v), "Số điện thoại không hợp lệ")
  .optional();

/** Required VN phone: non-empty and a valid 0/+84/84-prefixed mobile number. */
export const phoneFieldRequired = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại")
  .regex(VN_PHONE, "Số điện thoại không hợp lệ");

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
