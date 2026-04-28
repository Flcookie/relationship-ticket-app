export type ToastKind = "success" | "error" | "info";

export interface ToastPayload {
  message: string;
  kind?: ToastKind;
}

const TOAST_EVENT = "app:toast";

export function showToast(payload: ToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function getToastEventName() {
  return TOAST_EVENT;
}
