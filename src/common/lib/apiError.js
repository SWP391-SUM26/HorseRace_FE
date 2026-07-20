import { isAxiosError } from "axios";

function getApiErrorMessage(err, fallback = "Đã có lỗi xảy ra") {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string" && message.length > 0) return message;

    const status = err.response?.status;
    if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
    if (status === 404) return "Chức năng này chưa khả dụng.";
    if (status === 409) return "Mục này đã được xử lý hoặc trùng với dữ liệu hiện có.";
    if (status === 400) return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.";
    if (!err.response) return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }

  return fallback;
}

function getApiFieldErrors(err) {
  if (isAxiosError(err)) {
    const data = err.response?.data?.data;
    if (Array.isArray(data)) {
      return data.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          typeof item.field === "string" &&
          typeof item.message === "string"
      );
    }
  }

  return [];
}

function applyApiErrorToForm(err, opts) {
  const { toast, setError, fallback } = opts;
  toast.error(getApiErrorMessage(err, fallback));

  for (const fieldError of getApiFieldErrors(err)) {
    try {
      setError(fieldError.field, { message: fieldError.message });
    } catch {
      // Backend field names can differ from frontend form field names.
    }
  }
}

export { applyApiErrorToForm, getApiErrorMessage, getApiFieldErrors };
