import { createServerFn } from "@tanstack/react-start";
import { saveFile } from "./server/upload";

export const uploadFile = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { filename: string; content: string })
  .handler(async ({ data }) => {
    const buffer = Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0)).buffer;
    return saveFile(data.filename, buffer);
  });
