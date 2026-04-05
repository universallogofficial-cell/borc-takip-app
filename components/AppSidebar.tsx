"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/debts", label: "Borçlar" },
  { href: "/cash", label: "Kasalar" },
  { href: "/payments", label: "Ödemeler" },
  { href: "/settings", label: "Ayarlar" },
];

function getLinkClass(isActive: boolean) {
  return isActive
    ? "rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white"
    : "rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100";
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-900">Borç Takip</p>
          <p className="text-xs text-gray-500">Ana bölümler arasında geçiş yapın.</p>
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

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-gray-200 bg-white md:block">
        <div className="flex h-full flex-col p-5">
          <div className="mb-8">
            <p className="text-lg font-semibold text-gray-900">Borç Takip</p>
            <p className="mt-1 text-sm text-gray-500">
              Dashboard ve yönetim sayfaları
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
        </div>
      </aside>
    </>
  );
}
