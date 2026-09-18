import type { ApiEnvelope, AuthUser, ChangePasswordPayload } from "@/types/api";
import { apiClient } from "@/shared/lib/apiClient";

export const authService = {
  async me(): Promise<AuthUser> {
    const res = await apiClient.get<ApiEnvelope<AuthUser>>("/api/me");
    return res.data;
  },
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.put("/api/change-password", payload);
  },
};
