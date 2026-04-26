// ====================================================================
// toaster.tsx - المكون المسؤول عن إظهار التنبيهات في واجهة المستخدم
// ====================================================================

import { Toaster as HotToaster } from "react-hot-toast";

export const Toaster = () => {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        // يمكنك تخصيص الألوان هنا لتناسب تصميم تطبيقك
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
        duration: 4000,
      }}
    />
  );
};
