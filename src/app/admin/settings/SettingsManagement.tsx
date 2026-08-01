"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type SectionKey = "overview" | "general" | "brand" | "contact" | "security" | "system";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "general", label: "General" },
  { key: "brand", label: "Brand" },
  { key: "contact", label: "Contact & Social" },
  { key: "security", label: "Security" },
  { key: "system", label: "System & Backup" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (EN)" },
  { value: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (AR)" },
];

const THEME_OPTIONS = [
  { value: "system", label: "Match system" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function SavePanel({ label }: { label: string }) {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-3">
      <Button type="submit">Save {label}</Button>
      {saved ? (
        <span role="status" className="text-sm text-foreground/70">
          Saved (preview only — not persisted).
        </span>
      ) : null}
    </form>
  );
}

/**
 * Settings (Page_Structure.md §16). Section nav (tabs at lg+, accordion-like
 * top tabs on mobile) + content panels, each with its own Save action per
 * §15.9. All fields use static defaultValues; Save only shows a local
 * role="status" confirmation and never persists (no data layer at this
 * stage). The Danger Zone action requires an inline confirm step before
 * anything happens, and even then performs no request.
 */
export function SettingsManagement() {
  const [section, setSection] = useState<SectionKey>("overview");
  const [confirmingDanger, setConfirmingDanger] = useState(false);
  const [dangerDone, setDangerDone] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Settings sections">
        <div role="tablist" aria-label="Settings sections" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((item) => {
            const active = item.key === section;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSection(item.key)}
                className={`min-h-[44px] shrink-0 rounded-[var(--radius-lg)] px-4 text-start text-sm font-medium transition-colors duration-150 lg:w-full ${
                  active ? "bg-surface font-semibold text-foreground" : "text-foreground/70 hover:bg-surface hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-6 sm:p-8">
        {section === "overview" ? (
          <section aria-label="Overview">
            <h2 className="font-sans text-lg font-semibold text-foreground">Overview</h2>
            <p className="mt-2 max-w-2xl text-sm text-foreground/70">
              A summary of the current system configuration. Studio name, locale, brand accent, and
              security settings are managed in the sections to the side.
            </p>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">Studio name</dt>
                <dd className="mt-1 text-sm text-foreground">F Studio</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">Default language</dt>
                <dd className="mt-1 text-sm text-foreground">English (EN)</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">Theme</dt>
                <dd className="mt-1 text-sm text-foreground">Match system</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">Two-factor auth</dt>
                <dd className="mt-1 text-sm text-foreground">Not enabled</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {section === "general" ? (
          <section aria-label="General settings">
            <h2 className="font-sans text-lg font-semibold text-foreground">General</h2>
            <div className="mt-6 flex flex-col gap-5">
              <Input id="settings-studio-name" label="Studio name" defaultValue="F Studio" required />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Select id="settings-language" label="Default language" options={LANGUAGE_OPTIONS} defaultValue="en" />
                <Select id="settings-timezone" label="Time zone" options={[{ value: "utc", label: "UTC" }, { value: "gmt+1", label: "GMT+1" }]} defaultValue="utc" />
              </div>
              <Select id="settings-theme" label="Theme" options={THEME_OPTIONS} defaultValue="system" />
            </div>
            <SavePanel label="general settings" />
          </section>
        ) : null}

        {section === "brand" ? (
          <section aria-label="Brand settings">
            <h2 className="font-sans text-lg font-semibold text-foreground">Brand</h2>
            <div className="mt-6 flex flex-col gap-5">
              <div>
                <p className="text-sm font-medium text-foreground">Logo</p>
                <div className="mt-2 flex items-center gap-4">
                  <div aria-hidden="true" className="flex aspect-square w-20 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface font-sans text-sm font-semibold text-foreground/40">
                    F
                  </div>
                  <Button type="button" variant="secondary">
                    Replace logo
                  </Button>
                </div>
              </div>
              <Input id="settings-accent" label="Accent color" defaultValue="#008080" hint="Teal is the only approved accent (UI_Guidelines §18.6)." />
            </div>
            <SavePanel label="brand settings" />
          </section>
        ) : null}

        {section === "contact" ? (
          <section aria-label="Contact and social settings">
            <h2 className="font-sans text-lg font-semibold text-foreground">Contact & Social</h2>
            <div className="mt-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input id="settings-email" type="email" label="Studio email" defaultValue="hello@fstudio.example" />
                <Input id="settings-phone" type="tel" label="Studio phone" defaultValue="+1 555 010 1234" />
              </div>
              <Textarea id="settings-hours" label="Office hours" defaultValue={"Mon\u2013Fri, 9:00\u201318:00"} rows={2} />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input id="settings-linkedin" label="LinkedIn URL" defaultValue="https://linkedin.com/company/f-studio" />
                <Input id="settings-instagram" label="Instagram URL" defaultValue="https://instagram.com/fstudio" />
              </div>
            </div>
            <SavePanel label="contact settings" />
          </section>
        ) : null}

        {section === "security" ? (
          <section aria-label="Security settings">
            <h2 className="font-sans text-lg font-semibold text-foreground">Security</h2>
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                  <p className="mt-0.5 text-xs text-foreground/60">Not enabled</p>
                </div>
                <Button type="button" variant="secondary">
                  Enable
                </Button>
              </div>
              <Input
                id="settings-new-password"
                type="password"
                label="New password"
                autoComplete="new-password"
                hint="At least 12 characters, with a mix of letters and numbers."
              />
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <p className="text-sm font-medium text-foreground">Active sessions</p>
                <p className="mt-1 text-sm text-foreground/70">1 active session on this device.</p>
              </div>
            </div>
            <SavePanel label="security settings" />
          </section>
        ) : null}

        {section === "system" ? (
          <section aria-label="System and backup settings">
            <h2 className="font-sans text-lg font-semibold text-foreground">System & Backup</h2>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">App version</dt>
                <dd className="numeral-ltr mt-1 text-sm text-foreground">0.1.0</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">Last backup</dt>
                <dd className="numeral-ltr mt-1 text-sm text-foreground">2026-07-20</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Button type="button" variant="secondary">
                Export data
              </Button>
            </div>

            <div className="mt-10 rounded-[var(--radius-lg)] border border-border p-5">
              <h3 className="font-sans text-sm font-semibold text-foreground">Danger zone</h3>
              <p className="mt-1 text-sm text-foreground/70">Reset the studio dashboard to its default demo state.</p>

              {dangerDone ? (
                <p role="status" className="mt-4 text-sm text-foreground">
                  Preview confirmed — nothing was actually reset (no data layer at this stage).
                </p>
              ) : confirmingDanger ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-foreground">Reset all demo data?</span>
                  <Button
                    type="button"
                    onClick={() => {
                      setDangerDone(true);
                      setConfirmingDanger(false);
                    }}
                  >
                    Confirm reset
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setConfirmingDanger(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="secondary" className="mt-4" onClick={() => setConfirmingDanger(true)}>
                  Reset demo data
                </Button>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
