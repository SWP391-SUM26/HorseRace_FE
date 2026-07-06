import { useMutation } from "@tanstack/react-query";
import api from "../../services/api";

export function useRegisterSpectator() {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/v1/auth/register/spectator", data);
      return response.data;
    },
  });
}

export function useRegisterOwner() {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/v1/auth/register/owner", data);
      return response.data;
    },
  });
}

export function useRegisterJockey() {
  return useMutation({
    mutationFn: async (input) => {
      const { license, fitnessCertificate, ...fields } = input;
      const fd = new FormData();
      // Thêm từng trường text vào FormData (bỏ qua giá trị undefined/null/rỗng)
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
      });
      // Đính kèm 2 file tài liệu
      if (license) fd.append("license", license);
      if (fitnessCertificate) fd.append("fitnessCertificate", fitnessCertificate);
      // Để Content-Type là undefined -> Axios tự gán multipart/form-data + boundary đúng chuẩn
      const response = await api.post("/api/v1/auth/register/jockey", fd, {
        headers: { "Content-Type": undefined },
      });
      return response.data;
    },
  });
}

export function useRequestEmailVerification() {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/v1/auth/verify-email/request", data);
      return response.data;
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/v1/auth/verify-email", data);
      return response.data;
    },
  });
}
