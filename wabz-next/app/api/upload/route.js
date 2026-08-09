import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://apnxvhjlpahiepwntpmn.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbnh2aGpscGFoaWVwd250cG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTY0MDAsImV4cCI6MjA5Mjc5MjQwMH0.7GX9Pt-gW43fkoiTytFGIhzkfUnQI9H9iK4YyiBawbM";
const BUCKET = "Wabzfoods";

// Files are stored in Supabase Storage (not the server filesystem) so uploads
// survive on serverless hosts like Netlify. The bucket + upload policies come
// from scripts/setup-storage.sql.
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WEBP, GIF, AVIF." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Create safe filename
    const ext = file.name.split(".").pop().toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const storagePath = `uploads/${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({
      url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`,
      filename: safeName,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        error:
          "Upload failed: " +
          (err.message || "Unknown error") +
          ". If storage isn't configured yet, run scripts/setup-storage.sql in Supabase.",
      },
      { status: 500 }
    );
  }
}
