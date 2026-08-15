import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { MonoChip } from "@/components/content/MonoChip";
import { ContactForm } from "./ContactForm";

const PAGE_TITLE = "Contact — F Studio";
const PAGE_DESCRIPTION = "Start a project with F Studio.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/contact",
    siteName: "F Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const INFO_CARDS = [
  { label: "Email", value: "hello@fstudio.example" },
  { label: "Phone", value: "+1 (555) 010-2024" },
  { label: "Office hours", value: "Mon–Fri, 9:00–18:00" },
];

const FAQ_PREVIEW = [
  { q: "What happens after I submit this form?", a: "We review your project and reply within one business day." },
  { q: "Do you offer fixed-price quotes?", a: "Most engagements are scoped after a short discovery call." },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              Let&apos;s build the future
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-foreground/70">
              Tell us about your project and we&apos;ll get back to you within one business day.
            </p>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
              <ContactForm />
            </div>

            <div className="flex flex-col gap-4">
              {INFO_CARDS.map((card) => (
                <div key={card.label} className="rounded-[var(--radius-lg)] border border-border p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                    {card.label}
                  </p>
                  <MonoChip className="mt-2 numeral-ltr">{card.value}</MonoChip>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">Quick answers</h2>
            <div className="mt-8 flex flex-col gap-6">
              {FAQ_PREVIEW.map((item) => (
                <div key={item.q}>
                  <p className="text-sm font-medium text-foreground">{item.q}</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
