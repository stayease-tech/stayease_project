import axios from "axios";
import { toast } from "react-toastify";

const ALERT_ERROR_PATTERN = /(error|failed|invalid|not found|unable|denied|exception|must|required|please enter|please select|incorrect|wrong|mismatch)/i;

function normalizeMessage(value) {
  if (value === undefined || value === null) return "Something went wrong.";
  return String(value);
}

function showByIntent(message) {
  const text = normalizeMessage(message);
  if (ALERT_ERROR_PATTERN.test(text)) {
    toast.error(text);
    return;
  }
  toast.success(text);
}

export function configureGlobalToasts() {
  if (window.__STAYEASE_TOAST_CONFIGURED__) {
    return;
  }

  window.__STAYEASE_TOAST_CONFIGURED__ = true;

  const nativeAlert = window.alert.bind(window);
  window.__NATIVE_ALERT__ = nativeAlert;

  window.alert = (message) => {
    showByIntent(message);
  };

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const skipGlobalErrorToast = error?.config?.skipGlobalErrorToast;
      if (!skipGlobalErrorToast) {
        const apiMessage = error?.response?.data?.message;
        const fallbackMessage = "Request failed. Please try again.";
        toast.error(normalizeMessage(apiMessage || fallbackMessage));
      }
      return Promise.reject(error);
    }
  );
}
