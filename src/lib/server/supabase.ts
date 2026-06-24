import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables. " +
        "For local dev, copy .env.example to .env and fill in your Supabase project details.",
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export type DbAttendee = {
  id: string;
  type: "attendee" | "speaker";
  data: Record<string, unknown>;
  checked_in_at: string | null;
  created_at: string;
};

export async function getAllRegistrations(): Promise<DbAttendee[]> {
  const { data, error } = await getClient()
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function findRegistration(
  id: string,
): Promise<DbAttendee | undefined> {
  const { data, error } = await getClient()
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data ?? undefined;
}

export async function saveRegistration(
  type: DbAttendee["type"],
  data: Record<string, unknown>,
): Promise<DbAttendee> {
  // Get next ID from the sequence function
  const { data: idResult, error: idError } = await getClient().rpc(
    "next_registration_id",
  );
  if (idError) throw idError;

  const record = {
    id: idResult as string,
    type,
    data,
  };

  const { data: inserted, error } = await getClient()
    .from("registrations")
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return inserted;
}

export async function setCheckIn(
  id: string,
  checkedIn: boolean,
): Promise<DbAttendee | undefined> {
  const { data, error } = await getClient()
    .from("registrations")
    .update({ checked_in_at: checkedIn ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data ?? undefined;
}

export async function deleteRegistration(id: string): Promise<void> {
  const { error } = await getClient()
    .from("registrations")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
