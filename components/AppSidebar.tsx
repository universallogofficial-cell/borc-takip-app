"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/app", label: "Genel Durum" },
  { href: "/app/debts", label: "Borçlar" },
  { href: "/app/cash", label: "Nakit" },
  { href: "/app/payments", label: "Ödemeler" },
  { href: "/app/settings", label: "Ayarlar" },
];

function getLinkClass(isActive: boolean) {
  return isActive
    ? "rounded-full bg-[rgba(15,61,46,0.1)] px-4 py-2.5 text-sm font-semibold text-[#0f3d2e]"
    : "rounded-full px-4 py-2.5 text-sm font-medium text-[#65716a] transition hover:bg-white/70 hover:text-[#1f2924]";
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(15,61,46,0.08)] bg-[rgba(247,248,244,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/app" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f3d2e] text-white">
              <span className="h-3 w-3 rounded-full bg-[#d5e5db]" />
            </span>
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#748179]">
                Çalışma Alanı
              </p>
              <p className="text-base font-semibold tracking-[0.16em] text-[#1f2924]">
                AKÇA
              </p>
            </div>
          </Link>

          <Link href="/" className="finance-button-ghost hidden md:inline-flex">
            Ana sayfa
          </Link>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
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
    </header>
  );
}
