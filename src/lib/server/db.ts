import fs from "node:fs";
import path from "node:path";

export type AttendeeRecord = {
  type: "attendee" | "speaker";
  id: string;
  createdAt: string;
  checkedInAt?: string | null;
  data: Record<string, unknown>;
};

const DATA_DIR = path.resolve(process.cwd(), ".data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const COUNTER_FILE = path.join(DATA_DIR, "counter.txt");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll(): AttendeeRecord[] {
  try {
    ensureDir();
    if (!fs.existsSync(REGISTRATIONS_FILE)) return [];
    return JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeAll(records: AttendeeRecord[]) {
  ensureDir();
  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(records, null, 2), "utf-8");
}

function nextId(): string {
  ensureDir();
  const current = fs.existsSync(COUNTER_FILE)
    ? Number(fs.readFileSync(COUNTER_FILE, "utf-8").trim()) + 1
    : 1;
  fs.writeFileSync(COUNTER_FILE, String(current), "utf-8");
  return `MYC2026-${String(current).padStart(5, "0")}`;
}

export function getAllRegistrations(): AttendeeRecord[] {
  return readAll();
}

export function saveRegistration(
  type: AttendeeRecord["type"],
  data: Record<string, unknown>,
): AttendeeRecord {
  const record: AttendeeRecord = {
    type,
    id: nextId(),
    createdAt: new Date().toISOString(),
    checkedInAt: null,
    data,
  };
  const all = readAll();
  all.push(record);
  writeAll(all);
  return record;
}

export function findRegistration(id: string): AttendeeRecord | undefined {
  return readAll().find((r) => r.id.toLowerCase() === id.trim().toLowerCase());
}

export function setCheckIn(id: string, checkedIn: boolean): AttendeeRecord | undefined {
  const all = readAll();
  const i = all.findIndex((r) => r.id === id);
  if (i === -1) return undefined;
  all[i] = { ...all[i], checkedInAt: checkedIn ? new Date().toISOString() : null };
  writeAll(all);
  return all[i];
}

export function deleteRegistration(id: string) {
  writeAll(readAll().filter((r) => r.id !== id));
}
