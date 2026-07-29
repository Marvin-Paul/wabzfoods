import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://apnxvhjlpahiepwntpmn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbnh2aGpscGFoaWVwd250cG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTY0MDAsImV4cCI6MjA5Mjc5MjQwMH0.7GX9Pt-gW43fkoiTytFGIhzkfUnQI9H9iK4YyiBawbM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
