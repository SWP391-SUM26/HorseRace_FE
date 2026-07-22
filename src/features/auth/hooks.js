import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";

export function useLogin() {
  return useMutation({ mutationFn: authApi.login });
}
export function useRegisterSpectator() {
  // Self-renders errors via applyApiErrorToForm (toast + setError) → opt out of
  // the global toast.
  return useMutation({
    mutationFn: authApi.registerSpectator,
    meta: { skipGlobalErrorToast: true },
  });
}
export function useRegisterOwner() {
  return useMutation({
    mutationFn: authApi.registerOwner,
    meta: { skipGlobalErrorToast: true },
  });
}
export function useRegisterJockey() {
  return useMutation({
    mutationFn: authApi.registerJockey,
    meta: { skipGlobalErrorToast: true },
  });
}
export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}
export function useResendCode() {
  return useMutation({ mutationFn: authApi.resendCode });
}
export function useVerifyCode() {
  return useMutation({ mutationFn: authApi.verifyCode });
}
export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}
export function useRequestEmailVerification() {
  // Fire-and-forget after register (the page already toasts "code sent" +
  // navigates). Stay silent on error so the global handler doesn't pop a
  // contradictory error toast right after the success one.
  return useMutation({
    mutationFn: authApi.requestEmailVerification,
    meta: { skipGlobalErrorToast: true },
  });
}
export function useVerifyEmail() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}
