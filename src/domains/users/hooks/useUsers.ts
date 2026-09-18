import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ResetPasswordPayload, UserCreatePayload, UserListParams, UserUpdatePayload } from "@/types/api";
import { userService } from "../services";

export const USERS_KEY = "users";

export function useUsers(params: UserListParams = {}) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => userService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id?: string) {
  return useQuery({
    queryKey: [USERS_KEY, "detail", id],
    queryFn: () => userService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UserUpdatePayload }) =>
      userService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useResetUserPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: ResetPasswordPayload }) =>
      userService.resetPassword(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}
