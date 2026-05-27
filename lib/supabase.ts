import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;

// anon key — used for frontend reads
export const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY!
);

// service_role key — used for server-side writes (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
