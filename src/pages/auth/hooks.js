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
    mutationFn: async (data) => {
      const response = await api.post("/api/v1/auth/register/jockey", data);
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
