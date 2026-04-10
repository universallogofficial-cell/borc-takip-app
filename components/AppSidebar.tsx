"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/debts", label: "Borçlar" },
  { href: "/app/cash", label: "Kasalar" },
  { href: "/app/payments", label: "Ödemeler" },
  { href: "/app/settings", label: "Ayarlar" },
];

function getLinkClass(isActive: boolean) {
  return isActive
    ? "rounded-[18px] bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)]"
    : "rounded-[18px] px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950";
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-[rgba(248,250,252,0.88)] px-4 py-3 backdrop-blur md:hidden">
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-950">Borç Takip</p>
          <p className="text-xs text-slate-500">Kişisel finans alanları arasında geçiş yapın.</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${getLinkClass(isActive)} whitespace-nowrap`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[17.5rem] px-4 py-4 md:block">
        <div className="finance-surface-strong flex h-full flex-col rounded-[30px] p-5">
          <div className="mb-8">
            <p className="finance-kicker">Borç Takip</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">Finans çalışma alanı</p>
            <p className="mt-1 text-sm text-slate-500">
              Dashboard, kayıt akışları ve ayarlar
            </p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block ${getLinkClass(isActive)}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[24px] bg-slate-950 px-4 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Ürün Notu
            </p>
            <p className="mt-2 text-sm font-medium">
              Veriler hesap bazında tutulur ve yalnızca size ait görünür.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
