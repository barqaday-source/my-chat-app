// ====================================================================
// App.tsx - النسخة النهائية المعتمدة لتشغيل الواجهة
// ====================================================================

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// 1. استيراد المكونات الأساسية (تعديل المسارات لضمان عملها في البيئة الحالية)
import { Toaster as Sonner } from "./components/ui/sonner"; 
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip"; // تأكد من صحة هذا المسار في مجلدك

// 2. استيراد الـ Hooks (المسارات التي تناسب بناء مشروعك الحالي)
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import { AppSettingsProvider } from "./hooks/useAppSettings";

// 3. حماية المسارات
import ProtectedRoute from "./components/ProtectedRoute";

// 4. استيراد الصفحات
import Welcome from "./pages/Welcome.tsx";
import AuthPage from "./pages/Auth.tsx";
import ChatList from "./pages/ChatList.tsx";
import ChatRoom from "./pages/ChatRoom.tsx";
import Rooms from "./pages/Rooms.tsx";
import Profile from "./pages/Profile.tsx";
import Notifications from "./pages/Notifications.tsx";
import Friends from "./pages/Friends.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppSettingsProvider>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* الصفحة الافتراضية - ستعرض شاشة الترحيب بدلاً من الفراغ الوردي */}
                <Route path="/" element={<Welcome />} />
                
                {/* صفحة تسجيل الدخول */}
                <Route path="/auth" element={<AuthPage />} />

                {/* المسارات المحمية (لا تظهر إلا بعد تسجيل الدخول) */}
                <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
                <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
                <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* صفحة الخطأ في حال كتابة مسار غير موجود */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Sonner position="top-center" expand={false} richColors />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </AppSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
