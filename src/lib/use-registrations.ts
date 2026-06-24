import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllRegistrations } from "./registration";
import type { AttendeeRecord } from "./registration";

const QUERY_KEY = ["registrations"] as const;

export function useRegistrations(): AttendeeRecord[] {
  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getAllRegistrations(),
  });
  return data ?? [];
}

export function useInvalidateRegistrations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
}
