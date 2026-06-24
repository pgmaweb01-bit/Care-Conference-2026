import { createServerFn } from "@tanstack/react-start";
import {
  getAllRegistrations as serverGetAll,
  saveRegistration as serverSave,
  findRegistration as serverFind,
  setCheckIn as serverCheckIn,
  deleteRegistration as serverDelete,
} from "./server/registration-fns";

export type { AttendeeRecord } from "./server/registration-fns";

export const getAllRegistrations = createServerFn({ method: "GET" }).handler(async () =>
  serverGetAll(),
);

export const saveRegistration = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { type: "attendee" | "speaker"; data: Record<string, unknown> })
  .handler(async ({ data }) => serverSave(data.type, data.data));

export const findRegistration = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data }) => serverFind(data));

export const setCheckIn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id: string; checkedIn: boolean })
  .handler(async ({ data }) => serverCheckIn(data.id, data.checkedIn));

export const deleteRegistration = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data }) => {
    serverDelete(data);
    return { ok: true };
  });
