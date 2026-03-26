
"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * دمج صفحة الاشتراك مع صفحة الدخول في نظام تبويبات موحد
 * كما في واجهة دخول البروتوكول
 */
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // توجيه المستخدم إلى صفحة الدخول مع تفعيل تبويب "signup"
    router.replace("/login?mode=signup");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-primary font-black">
      جاري توجيهك إلى بوابة التسجيل الموحدة...
    </div>
  );
}
