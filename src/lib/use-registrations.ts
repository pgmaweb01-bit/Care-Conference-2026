import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllRegistrations } from "./registration";
import type { AttendeeRecord } from "./registration";

const QUERY_KEY = ["registrations"] as const;

export function useRegistrations(): AttendeeRecord[] {
  const { data, error, isError, isPending } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getAllRegistrations(),
    retry: false,
  });
  console.log("[useRegistrations] state:", { isPending, isError, dataType: typeof data, isArray: Array.isArray(data), length: Array.isArray(data) ? data.length : 0 });
  if (error) console.error("[useRegistrations] error:", error);
  if (data != null && !Array.isArray(data)) {
    console.error("[useRegistrations] data is not an array:", typeof data, JSON.stringify(data).slice(0, 500));
  }
  return Array.isArray(data) ? data : [];
}

export function useInvalidateRegistrations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
}
