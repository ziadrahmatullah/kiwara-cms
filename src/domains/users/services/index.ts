import type {
  ApiEnvelope,
  Paginated,
  ResetPasswordPayload,
  User,
  UserCreatePayload,
  UserListParams,
  UserUpdatePayload,
} from "@/types/api";
import { apiClient, cleanParams, toPaginated } from "@/shared/lib/apiClient";

const BASE = "/api/admin/users";

export const userService = {
  async getAll(params: UserListParams = {}): Promise<Paginated<User>> {
    const res = await apiClient.get<ApiEnvelope<User[]>>(BASE, cleanParams(params));
    return toPaginated(res);
  },
  async getById(id: number | string): Promise<User> {
    const res = await apiClient.get<ApiEnvelope<User>>(`${BASE}/${id}`);
    return res.data;
  },
  async create(payload: UserCreatePayload): Promise<User> {
    const res = await apiClient.post<ApiEnvelope<User>>(BASE, payload);
    return res.data;
  },
  async update(id: number | string, payload: UserUpdatePayload): Promise<User> {
    const res = await apiClient.put<ApiEnvelope<User>>(`${BASE}/${id}`, payload);
    return res.data;
  },
  async remove(id: number | string): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
  },
  async resetPassword(id: number | string, payload: ResetPasswordPayload): Promise<void> {
    await apiClient.put(`${BASE}/${id}/reset-password`, payload);
  },
};
