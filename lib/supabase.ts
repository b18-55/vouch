import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://joilplmbanxarthpawjv.supabase.co";
const supabaseAnonKey = "sb_publishable_NEx5m3kr9cO62GKmNnFHSQ__Ar5CX8s";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);