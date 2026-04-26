import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
// بدلاً من السطر القديم الذي يحتوي على @/server/supabase
import { supabase } from "../server/supabase"; 


export type AppRole = "user" | "admin";
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_banned: boolean; // إضافة حقل الحظر للنوع
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username: string, useLocalEmail?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  // دالة موحدة لجلب البيانات وفحص الحظر والصلاحيات
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [{ data: profileData, error: profileError }, { data: roleData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      ]);

      if (profileError) throw profileError;

      // الثغرة الأمنية: فحص إذا كان المستخدم محظوراً
      if (profileData?.is_banned) {
        await supabase.auth.signOut();
        alert("عذراً، هذا الحساب محظور من قبل الإدارة.");
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile | null);
      setRole(roleData?.role as AppRole | null);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. مراقب حالة الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadUserData(newSession.user.id);
      } else {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    // 2. فحص الجلسة عند التشغيل
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        loadUserData(existing.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signUp = useCallback(async (email: string, password: string, username: string, useLocalEmail = false) => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_\-.]/g, "");
    const localPart = cleanUsername || `user-${Date.now()}`;
    const authEmail = useLocalEmail ? `${localPart}@dardashati.local` : email;
    
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        emailRedirectTo: 'com.astabraq.app://login-callback', // رابط الـ APK
        data: { 
          display_name: username.trim(),
          username: cleanUsername 
        },
      },
    });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'com.astabraq.app://login-callback',
        skipBrowserRedirect: false
      }
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadUserData(user.id);
  }, [user, loadUserData]);

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, role,
        isAdmin: role === "admin",
        loading,
        signUp, signIn, signInWithGoogle, signOut, refreshProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
        }
