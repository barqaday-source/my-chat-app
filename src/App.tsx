// ====================================================================
// App.tsx - النسخة النهائية المصلحة والمربوطة بالمسارات المحلية
// ====================================================================

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// تم التعديل: العودة للمسارات المحلية بعد أن أنشأنا الملفات الناقصة
import { Toaster as Sonner } from "./components/ui/sonner"; 
import { Toaster } from "./components/ui/toaster";


import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppSettingsProvider } from "@/hooks/useAppSettings";
import ProtectedRoute from "@/components/ProtectedRoute";

// استيراد صفحات المستخدم
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
                <Route path="/" element={<Welcome />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
                <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
                <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            
            {/* الآن سيعمل المكونان من داخل مجلد ui الخاص بك */}
            <Sonner position="top-center" expand={false} richColors />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </AppSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
