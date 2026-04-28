import { createClient } from '@supabase/supabase-js';

// استدعاء المتغيرات من بيئة Vite (المفاتيح التي وضعناها في GitHub Secrets)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
