import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Borç Takip App",
  description: "Borç, ödeme ve kasa takibi için kişisel finans paneli.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
