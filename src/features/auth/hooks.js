import { useMutation } from "@tanstack/react-query";
import {
  forgotPassword,
  loginWithCredentials,
  registerJockey,
  registerOwner,
  registerSpectator,
  requestEmailVerification,
  resendAuthCode,
  resetPassword,
  verifyCode,
  verifyEmail,
} from "@/services/auth";

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password, rememberMe = false }) =>
      loginWithCredentials(email, password, rememberMe),
  });
}

export function useRegisterOwner() {
  return useMutation({ mutationFn: registerOwner, meta: { skipGlobalErrorToast: true } });
}

export function useRegisterJockey() {
  return useMutation({ mutationFn: registerJockey, meta: { skipGlobalErrorToast: true } });
}

export function useRegisterSpectator() {
  return useMutation({ mutationFn: registerSpectator, meta: { skipGlobalErrorToast: true } });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: ({ email }) => forgotPassword(email) });
}

export function useResendCode() {
  return useMutation({ mutationFn: ({ email }) => resendAuthCode(email) });
}

export function useVerifyCode() {
  return useMutation({ mutationFn: verifyCode });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, code, newPassword, confirmPassword }) =>
      resetPassword(email, code, newPassword, confirmPassword),
  });
}

export function useRequestEmailVerification() {
  return useMutation({
    mutationFn: ({ email }) => requestEmailVerification(email),
    meta: { skipGlobalErrorToast: true },
  });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: ({ email, code }) => verifyEmail(email, code) });
}
