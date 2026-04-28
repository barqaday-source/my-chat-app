import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom"; // تم تغيير BrowserRouter إلى HashRouter

import { Toaster as Sonner } from "./components/ui/sonner"; 
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import { AppSettingsProvider } from "./hooks/useAppSettings";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppSettingsProvider>
          <TooltipProvider>
            <AuthProvider>
              <HashRouter> {/* تم التغيير هنا */}
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/chat" element={<ChatList />} />
                  <Route path="/chat/:roomId" element={<ChatRoom />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HashRouter>
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
