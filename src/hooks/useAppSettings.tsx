import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/server/supabase';

// تعريف شكل البيانات القادمة من سوبابيس (توحيد مع لوحة التحكم)
interface AppSettings {
  app_name: string;
  developer_name: string;
  app_version: string;
  support_whatsapp?: string;
  is_maintenance_mode: boolean;
  // حقول الألوان للحقن الفوري
  app_bg_color?: string;
  app_button_color?: string;
}

interface AppSettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // قيم افتراضية قوية لمنع انهيار الواجهة
  const [settings, setSettings] = useState<AppSettings>({
    app_name: 'دردشة بارق',
    developer_name: 'بارق عداي',
    app_version: '1.0.0',
    is_maintenance_mode: false,
    app_bg_color: '#F46397',
    app_button_color: '#585752'
  });
  
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات من سوبابيس
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          app_name: data.app_name,
          developer_name: data.developer_name,
          app_version: data.app_version,
          support_whatsapp: data.support_whatsapp,
          is_maintenance_mode: data.is_maintenance_mode,
          app_bg_color: data.app_bg_color,
          app_button_color: data.app_button_color
        });
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // تأثير حقن الألوان في الـ CSS
  useEffect(() => {
    if (settings) {
      // حقن الألوان في متغيرات CSS العالمية (Variables)
      document.documentElement.style.setProperty('--primary', settings.app_button_color || '#585752');
      document.documentElement.style.setProperty('--background', settings.app_bg_color || '#F46397');
    }
  }, [settings]);

  useEffect(() => {
    fetchSettings();

    // تفعيل التحديث اللحظي (Realtime)
    // بمجرد ضغط "حقن" من لوحة التحكم، سيتغير اللون عند المستخدمين فوراً
    const subscription = supabase
      .channel('app_settings_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'app_settings' 
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
