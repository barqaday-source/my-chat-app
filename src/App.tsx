// ====================================================================
// App.tsx - المحرك الرئيسي لتطبيق المستخدم (النسخة النظيفة)
// ====================================================================

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppSettingsProvider } from "@/hooks/useAppSettings";
import ProtectedRoute from "@/components/ProtectedRoute";

// استيراد صفحات المستخدم فقط
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
      {/* هذا هو المكون الوحيد الذي يربط التطبيق بأوامرك من لوحة التحكم عن بُعد */}
      <AppSettingsProvider>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. مسارات البداية (العامة) */}
                <Route path="/" element={<Welcome />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* 2. قسم المحادثات */}
                <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
                <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />

                {/* 3. قسم الغرف */}
                <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />

                {/* 4. قسم الحساب الشخصي والداشبورد الخاص بالمستخدم */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />

                {/* 5. قسم الإشعارات */}
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* ملاحظة: تم حذف جميع مسارات الـ Admin من هنا نهائياً للفصل والأمان */}

                {/* مسار العودة في حال الخطأ */}
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
