import { useMutation } from "@tanstack/react-query";
import type { ChangePasswordPayload } from "@/types/api";
import { authService } from "@/domains/auth/services";

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
  });
}
