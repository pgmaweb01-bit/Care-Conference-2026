import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const UPLOAD_DIR = path.resolve(process.cwd(), ".data", "uploads");

function ensureDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveFile(
  filename: string,
  buffer: ArrayBuffer,
): Promise<{ url: string; filename: string }> {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safe}`;

  // Use Supabase Storage when configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(unique, new Uint8Array(buffer), {
        contentType: "application/octet-stream",
        upsert: false,
      });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(data.path);
    return { url: urlData.publicUrl, filename: safe };
  }

  // Fallback to local file storage
  ensureDir();
  const filepath = path.join(UPLOAD_DIR, unique);
  fs.writeFileSync(filepath, Buffer.from(buffer));
  return { url: `/uploads/${unique}`, filename: safe };
}
