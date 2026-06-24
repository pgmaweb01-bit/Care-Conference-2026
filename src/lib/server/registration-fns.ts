import * as jsonDb from "./db";
import * as supabaseDb from "./supabase";

export type { AttendeeRecord } from "./db";

const useSupabase = !!process.env.SUPABASE_URL;

function adapter() {
  if (useSupabase) {
    return {
      getAllRegistrations: () => supabaseDb.getAllRegistrations().then(mapRow),
      saveRegistration: (type: "attendee" | "speaker", data: Record<string, unknown>) =>
        supabaseDb.saveRegistration(type, data).then(mapRow),
      findRegistration: (id: string) =>
        supabaseDb.findRegistration(id).then((r) => (r ? mapRow(r) : undefined)),
      setCheckIn: (id: string, checkedIn: boolean) =>
        supabaseDb.setCheckIn(id, checkedIn).then((r) => (r ? mapRow(r) : undefined)),
      deleteRegistration: (id: string) => supabaseDb.deleteRegistration(id),
    };
  }
  return jsonDb;
}

function mapRow(r: supabaseDb.DbAttendee): jsonDb.AttendeeRecord {
  return {
    id: r.id,
    type: r.type,
    checkedInAt: r.checked_in_at,
    createdAt: r.created_at,
    data: r.data,
  };
}

const store = adapter();

export function getAllRegistrations() {
  return store.getAllRegistrations();
}

export function saveRegistration(
  type: "attendee" | "speaker",
  data: Record<string, unknown>,
) {
  return store.saveRegistration(type, data);
}

export function findRegistration(id: string) {
  return store.findRegistration(id);
}

export function setCheckIn(id: string, checkedIn: boolean) {
  return store.setCheckIn(id, checkedIn);
}

export function deleteRegistration(id: string) {
  return store.deleteRegistration(id);
}
