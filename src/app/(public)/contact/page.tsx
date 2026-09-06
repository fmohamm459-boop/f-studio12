import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { MonoChip } from "@/components/content/MonoChip";
import { ContactForm } from "./ContactForm";
import { getServerTranslation } from "@/i18n/server";

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

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { dict } = await getServerTranslation();

  const infoCards = [
    { label: dict.contact.email, value: "hello@fstudio.example" },
    { label: dict.contact.phone, value: "+1 (555) 010-2024" },
    { label: dict.contact.officeHours, value: dict.contact.officeHoursValue },
  ];

  const faqPreview = [
    { q: dict.contact.faqQ1, a: dict.contact.faqA1 },
    { q: dict.contact.faqQ2, a: dict.contact.faqA2 },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              {dict.contact.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-foreground/70">
              {dict.contact.heroSubtitle}
            </p>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
              <ContactForm />
            </div>

            <div className="flex flex-col gap-4">
              {infoCards.map((card) => (
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
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.contact.quickAnswers}
            </h2>
            <div className="mt-8 flex flex-col gap-6">
              {faqPreview.map((item) => (
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
