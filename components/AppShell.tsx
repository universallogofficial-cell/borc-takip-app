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
      <div className="min-w-0">
        {!hasSession && (
          <div className="px-4 pt-4 md:px-6">
            <div className="mx-auto max-w-6xl rounded-[22px] border border-[rgba(15,61,46,0.08)] bg-white/60 px-4 py-3 text-sm text-[#65716a] backdrop-blur">
              Güvenli alan hazır. AKÇA çalışma alanını kullanmak için giriş yapın.
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
