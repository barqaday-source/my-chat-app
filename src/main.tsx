import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// الحصول على عنصر الـ root والتأكد من وجوده
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("فشل العثور على عنصر root في ملف index.html");
} else {
  createRoot(rootElement).render(<App />);
}

/**
 * ✅ تم تعطيل الـ Service Worker مؤقتاً
 * هذا يضمن أن الشاشة البيضاء ليست بسبب محاولة تحميل ملف sw.js غير الموجود
 */
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW registration failed', err));
  });
}
*/
