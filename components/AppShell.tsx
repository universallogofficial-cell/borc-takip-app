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
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="min-w-0 md:pl-64">
        {!hasSession && (
          <div className="hidden border-b border-gray-200 bg-white px-6 py-3 text-sm text-gray-500 md:block">
            Menü görünümü erişilebilir. Bölümleri kullanmak için giriş yapın.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
