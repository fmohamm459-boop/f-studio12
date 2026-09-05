import type { Metadata } from "next";
import { hankenGrotesk } from "@/lib/fonts";
import { prisma } from "@/lib/prisma";
import { getServerLocale } from "@/i18n/server";
import { getDirectionForLocale } from "@/i18n/config";
import { LanguageProvider } from "@/i18n/client";
import "./globals.css";

async function getSiteSettings() {
  return await prisma.siteSettings.findFirst();
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(
      process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    ),

    title: settings?.siteName ?? "F Studio",

    description:
      settings?.description ??
      "F Studio — digital design & technology solutions.",

    icons: {
      icon: settings?.faviconUrl ?? "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const direction = getDirectionForLocale(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={hankenGrotesk.variable}
    >
      <body>
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
