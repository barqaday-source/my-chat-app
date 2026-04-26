// ====================================================================
// ProtectedRoute - الحارس النهائي (The Ultimate Shield)
// ====================================================================

import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 1. حالة التحميل: تظهر أثناء التأكد من "رتبة" المستخدم من سوبابيس
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. إذا لم يكن مسجل دخول: يطرده لصفحة تسجيل الدخول
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  // 3. إذا كانت الصفحة للأدمن والمستخدم ليس أدمن:
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-3" />
        <h2 className="text-lg font-bold mb-1">وصول محظور</h2>
        <p className="text-sm text-muted-foreground mb-4">ليس لديك الصلاحيات الكافية لدخول هذه المنطقة.</p>
        {/* توجيه تلقائي بعد ثانيتين إلى الدردشة لضمان عدم بقائه في صفحة فارغة */}
        <Navigate to="/chat" replace />
      </div>
    );
  }

  // 4. إذا عبر كل الفحوصات: يفتح له الصفحة المطلوبة
  return <>{children}</>;
}
