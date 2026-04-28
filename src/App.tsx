import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// 1. استيراد المكونات الأساسية للواجهة
import { Toaster as Sonner } from "./components/ui/sonner"; 
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

// 2. استيراد الـ Hooks (المحركات التي أصلحناها)
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import { AppSettingsProvider } from "./hooks/useAppSettings";

// 3. استيراد الصفحات
import Welcome from "./pages/Welcome";
import AuthPage from "./pages/Auth";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import Rooms from "./pages/Rooms";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Friends from "./pages/Friends";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";

// إنشاء العميل الخاص بالاستعلامات (Query Client) لمرة واحدة خارج المكون
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // محاولة واحدة فقط عند الفشل لضمان السرعة
      refetchOnWindowFocus: false, // منع إعادة الجلب عند تغيير التبويب
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppSettingsProvider>
          <TooltipProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  {/* المسارات الأساسية */}
                  <Route path="/" element={<Welcome />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/chat" element={<ChatList />} />
                  <Route path="/chat/:roomId" element={<ChatRoom />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/notifications" element={<Notifications />} />

                  {/* صفحة 404 - أي مسار غير موجود */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              
              {/* التنبيهات (Toasters) */}
              <Sonner position="top-center" expand={false} richColors />
              <Toaster />
            </AuthProvider>
          </TooltipProvider>
        </AppSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
