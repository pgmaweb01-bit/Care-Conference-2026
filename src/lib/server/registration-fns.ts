import * as supabaseDb from "./supabase";
import { sendConfirmationEmail } from "./confirmation-email";

export type { AttendeeRecord } from "./db";

if (!process.env.SUPABASE_URL) {
  console.error("[registrations] SUPABASE_URL is NOT SET — registrations will fail");
}

function mapRow(r: supabaseDb.DbAttendee) {
  return {
    id: r.id,
    type: r.type,
    checkedInAt: r.checked_in_at,
    createdAt: r.created_at,
    data: r.data,
  };
}

export function getAllRegistrations() {
  return supabaseDb.getAllRegistrations().then((rows) => rows.map(mapRow));
}

export async function saveRegistration(
  type: "attendee" | "speaker",
  data: Record<string, unknown>,
) {
  const result = await supabaseDb.saveRegistration(type, data).then(mapRow);
  const email = String((result.data as Record<string, unknown>).email ?? "");
  console.log(`[email] Sending confirmation to ${email}, id=${result.id}`);
  await sendConfirmationEmail(result).catch((err) =>
    console.error(`[email] Failed:`, err),
  );
  return result;
}

export function findRegistration(id: string) {
  return supabaseDb.findRegistration(id).then((r) => (r ? mapRow(r) : undefined));
}

export function setCheckIn(id: string, checkedIn: boolean) {
  return supabaseDb.setCheckIn(id, checkedIn).then((r) => (r ? mapRow(r) : undefined));
}

export function deleteRegistration(id: string) {
  return supabaseDb.deleteRegistration(id);
}
