import { createClient } from '@supabase/supabase-js';

// ✅ تم تصحيح الرابط والمفتاح ليتطابقا مع إعدادات مشروعك الأصلية
const supabaseUrl = 'https://vhbwapvlkjknbmrrlvas.supabase.co';
const supabaseAnonKey = 'sb_publishable_TLZfnxV_RT1qsd-RS_3CZQ_uJqaKglp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ تم التأكد من صياغة الـ interface ليفهمها السيرفر بلا أخطاء
export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}
