import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jjyluatyxtwiketexsej.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_jOwFGoufooZ6Nbnj7FpRhg_4MEtEE1v";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Bog'lanish holatini tekshirish
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("students").select("id").limit(1);
    return !error;
  } catch (err) {
    console.warn("Supabase ulanishida xatolik:", err);
    return false;
  }
}
