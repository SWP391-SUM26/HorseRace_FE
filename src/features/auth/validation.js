import { z } from "zod";

export const emailField = z.string().email("Email khong hop le");

const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const passwordField = z
  .string()
  .min(8, "Mat khau can it nhat 8 ky tu")
  .regex(PASSWORD_COMPLEXITY, "Mat khau can co chu hoa, chu thuong, so va ky tu dac biet");

const VN_PHONE = /^(0|\+84|84)[35789][0-9]{8}$/;

export const phoneFieldOptional = z
  .string()
  .trim()
  .refine((value) => value === "" || VN_PHONE.test(value), "So dien thoai khong hop le")
  .optional();

export const phoneFieldRequired = z
  .string()
  .trim()
  .min(1, "Vui long nhap so dien thoai")
  .regex(VN_PHONE, "So dien thoai khong hop le");

export function passwordStrength(password = "") {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}
