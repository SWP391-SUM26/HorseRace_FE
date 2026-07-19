import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile, uploadAvatar } from "@/services/user";

function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    }
  });
}

function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    }
  });
}

export {
  useUpdateProfile,
  useUploadAvatar
};
