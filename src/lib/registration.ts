import {
  getAllRegistrations as serverGetAll,
  saveRegistration as serverSave,
  findRegistration as serverFind,
  setCheckIn as serverCheckIn,
  deleteRegistration as serverDelete,
  type AttendeeRecord,
} from "./server-fns";

export type { AttendeeRecord };

export function getAllRegistrations(): Promise<AttendeeRecord[]> {
  return serverGetAll();
}

export function saveRegistration(
  type: AttendeeRecord["type"],
  data: Record<string, unknown>,
): Promise<AttendeeRecord> {
  return serverSave({ type, data });
}

export function findRegistration(id: string): Promise<AttendeeRecord | undefined> {
  return serverFind(id);
}

export function setCheckIn(id: string, checkedIn: boolean): Promise<AttendeeRecord | undefined> {
  return serverCheckIn({ id, checkedIn });
}

export function deleteRegistration(id: string): Promise<void> {
  return serverDelete(id).then(() => undefined);
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Array.from(
    rows.reduce((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set<string>()),
  );
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join(
    "\n",
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
