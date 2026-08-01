// Typography foundation — Page_Structure.md PART C: "Hanken Grotesk (Sans) and Technical Mono (Mono-label)".
// Loaded via next/font for optimized, self-hosted delivery (no external font requests at runtime).
//
// NOTE (foundation stage only): Hanken Grotesk is available via next/font/google and is wired below.
//
// "Technical Mono" is a project-specific mono family name from the source docs — no specific font
// file/vendor was specified in any supplied document, and per Phase 9.3.4.1 corrections no font may
// be substituted, downloaded, or invented to fill this gap. It is therefore NOT wired through
// next/font/local here (an empty `src` array is invalid and fails at build time — this was the
// defect corrected in this pass). The `--font-technical-mono` CSS custom property is instead
// declared directly in globals.css with a generic monospace fallback stack, so `font-mono` keeps
// working today without asserting a specific typeface.
//
// To finish this once the real Technical Mono font file is supplied: add it under
// public/assets/fonts/, reintroduce a `next/font/local` declaration here with a non-empty `src`,
// and update globals.css to consume the resulting `.variable` instead of the plain fallback.

import { Hanken_Grotesk } from "next/font/google";

export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});
