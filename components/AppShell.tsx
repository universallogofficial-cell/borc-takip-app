"use client";

import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { getCurrentSession, subscribeToAuthChanges } from "@/lib/auth";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void getCurrentSession()
      .then((session) => {
        if (isMounted) {
          setHasSession(Boolean(session?.user));
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasSession(false);
        }
      });

    const unsubscribe = subscribeToAuthChanges((session) => {
      setHasSession(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <AppSidebar />
      <div className="min-w-0 md:pl-[17.5rem]">
        {!hasSession && (
          <div className="hidden px-6 pt-4 md:block">
            <div className="finance-surface rounded-[22px] px-4 py-3 text-sm text-slate-500">
              Menü görünümü hazır. Yönetim alanlarını kullanmak için güvenli giriş yapın.
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
