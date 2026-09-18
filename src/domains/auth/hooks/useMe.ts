import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services";

/** Sinkronkan profil (role/event) dari server setiap kali panel dibuka. */
export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const query = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
    enabled: Boolean(token),
    staleTime: Infinity,
  });
  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);
  return query;
}
