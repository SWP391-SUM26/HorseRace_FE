import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/common/hooks/useAuth";
import { updateProfile, uploadAvatar } from "./api";

export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (v) => updateProfile(v),
    onSuccess: (user) => setUser(user),
  });
}

export function useUploadAvatar() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (file) => uploadAvatar(file),
    onSuccess: (user) => setUser(user),
  });
}
