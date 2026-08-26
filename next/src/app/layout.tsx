import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsentBanner } from "@/components/cookie-banner";
import { AuthQueryOpener } from "@/components/auth-query-opener";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Speako",
  description: "원어민 튜터와 함께하는 1:1 실시간 화상 언어 학습.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-canvas text-ink-900 antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CookieConsentBanner />
          <Suspense fallback={null}>
            <AuthQueryOpener />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
