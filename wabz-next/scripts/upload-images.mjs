// Uploads all images from public/food/ and ../assets/images/
// into the "images" Supabase Storage bucket.
// Run from wabz-next:  node scripts/upload-images.mjs
// Optional env overrides: SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET
import { createClient } from "@supabase/supabase-js";
import { readdir, existsSync } from "fs";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const readdirP = promisify(readdir);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://apnxvhjlpahiepwntpmn.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbnh2aGpscGFoaWVwd250cG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTY0MDAsImV4cCI6MjA5Mjc5MjQwMH0.7GX9Pt-gW43fkoiTytFGIhzkfUnQI9H9iK4YyiBawbM";
const BUCKET = process.env.BUCKET || "Wabzfoods";

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function walk(dir, base, out) {
  const entries = await readdirP(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, base, out);
    } else {
      out.push({ file: full, rel: path.relative(base, full).split(path.sep).join("/") });
    }
  }
  return out;
}

const jobs = [];
const foodDir = path.join(ROOT, "public", "food");
const assetsDir = path.join(ROOT, "..", "assets", "images");

if (existsSync(foodDir)) {
  for (const j of await walk(foodDir, foodDir, [])) {
    if (MIME[path.extname(j.file).toLowerCase()]) {
      // public/food/<name> -> bucket root: <name>
      jobs.push({ file: j.file, storagePath: j.rel });
    }
  }
}
if (existsSync(assetsDir)) {
  for (const j of await walk(assetsDir, assetsDir, [])) {
    if (MIME[path.extname(j.file).toLowerCase()]) {
      // assets/images/<sub>/<name> -> bucket assets/<sub>/<name>
      jobs.push({ file: j.file, storagePath: `assets/${j.rel}` });
    }
  }
}

console.log(`Uploading ${jobs.length} images to bucket "${BUCKET}"...\n`);

let ok = 0;
let failed = 0;
for (const j of jobs) {
  const { readFileSync } = await import("fs");
  const bytes = readFileSync(j.file);
  const contentType = MIME[path.extname(j.file).toLowerCase()];
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(j.storagePath, bytes, { contentType, upsert: true });
  if (error) {
    failed++;
    console.log(`FAIL  ${j.storagePath}  -> ${error.message}`);
  } else {
    ok++;
    console.log(`OK    ${j.storagePath}`);
  }
}

console.log(`\nDone: ${ok} uploaded, ${failed} failed.`);
if (failed === 0) {
  console.log(`\nPublic base URL: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);
}
