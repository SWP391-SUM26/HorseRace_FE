/**
 * Module-level bridge so non-React code (e.g. the react-query `MutationCache` handlers) can
 * raise toasts through the same queue that backs `useToast()`. `ToastProvider` registers its
 * emitters once mounted; before that (or after unmount) the helpers optional-chain to a no-op.
 */
let emitters = null;

/** Wire the live toast emitters. Idempotent — last registration wins. */
export function registerToastEmitters(next) {
  emitters = next;
}

export const toastError = (message) => emitters?.error(message);
export const toastSuccess = (message) => emitters?.success(message);
export const toastInfo = (message) => emitters?.info(message);
