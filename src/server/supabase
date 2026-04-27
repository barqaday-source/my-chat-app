import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhbwapvtkjknbmrrlvas.supabase.co';
const supabaseAnonKey = 'sb_publishable_TL2fnxV_RTlqsd-RS_3CZQ_qJqaKgLp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}
