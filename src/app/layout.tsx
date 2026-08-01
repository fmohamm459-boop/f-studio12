import type { Metadata } from "next";
import { hankenGrotesk } from "@/lib/fonts";
import "./globals.css";

// Root layout — foundation only. No page content, no business logic.
// Locale/direction handling: defaults to LTR/English here; per-request locale switching
// (dir="rtl" for Arabic) is a future implementation concern, not resolved at foundation stage.
//
// Only `hankenGrotesk.variable` is applied here (Phase 9.3.4.1 Correction 1). The
// `--font-technical-mono` custom property is declared directly in globals.css as a documented
// placeholder until a real Technical Mono font file is supplied — see src/lib/fonts.ts.

export const metadata: Metadata = {
  // Phase 9.3.13-A: resolves relative URLs used in each page's
  // openGraph/twitter metadata (and any relative openGraph.images) into
  // absolute ones. Reuses NEXTAUTH_URL rather than introducing a new env
  // var — in this single-domain deployment it already is the site's own
  // base URL (see .env.example); adding a dedicated NEXT_PUBLIC_SITE_URL
  // would mean touching a file outside this phase's allowed list.
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: "F Studio",
  description: "F Studio — digital design & technology solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={hankenGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
