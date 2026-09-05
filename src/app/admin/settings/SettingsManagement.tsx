"use client";

import { useMemo, useState, type FormEvent } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";
import type { SiteSettings } from "@prisma/client";
import { updateOwnerPassword } from "@/lib/owner-store";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/client";

type SectionKey = "overview" | "general" | "brand" | "contact" | "security" | "system";

function SavePanel({ label, buttonLabel }: { label: string; buttonLabel?: string }) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-3">
      <Button type="submit">{buttonLabel || t.settingsCMS.saveSectionBtn.replace("{label}", label)}</Button>
      {saved ? (
        <span role="status" className="text-sm text-foreground/70">
          {t.settingsCMS.saveSectionNotice}
        </span>
      ) : null}
    </form>
  );
}

export function SettingsManagement({
  settings,
}: {
  settings: SiteSettings;
}) {
  const { t } = useTranslation();
  const [section, setSection] = useState<SectionKey>("overview");
  const [confirmingDanger, setConfirmingDanger] = useState(false);
  const [dangerDone, setDangerDone] = useState(false);

  const sections = useMemo<{ key: SectionKey; label: string }[]>(
    () => [
      { key: "overview", label: t.settingsCMS.overviewTab },
      { key: "general", label: t.settingsCMS.generalTab },
      { key: "brand", label: t.settingsCMS.brandTab },
      { key: "contact", label: t.settingsCMS.contactTab },
      { key: "security", label: t.settingsCMS.securityTab },
      { key: "system", label: t.settingsCMS.systemTab },
    ],
    [t],
  );

  const languageOptions = useMemo(
    () => [
      { value: "en", label: "English (EN)" },
      { value: "ar", label: "العربية (AR)" },
    ],
    [],
  );

  const themeOptions = useMemo(
    () => [
      { value: "system", label: t.settingsCMS.matchSystemTheme },
      { value: "light", label: t.settingsCMS.lightTheme },
      { value: "dark", label: t.settingsCMS.darkTheme },
    ],
    [t],
  );

  const directionOptions = useMemo(
    () => [
      { value: "ltr", label: t.settingsCMS.directionLtr },
      { value: "rtl", label: t.settingsCMS.directionRtl },
    ],
    [t],
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      <nav aria-label={t.settingsCMS.title}>
        <div role="tablist" aria-label={t.settingsCMS.title} className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sections.map((item) => {
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
          <section aria-label={t.settingsCMS.overviewTab}>
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.settingsCMS.overviewTab}</h2>
            <p className="mt-2 max-w-2xl text-sm text-foreground/70">
              {t.settingsCMS.overviewDesc}
            </p>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">{t.settingsCMS.studioNameLabel}</dt>
                <dd className="mt-1 text-sm text-foreground">{settings.siteName || "F Studio"}</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">{t.settingsCMS.defaultLanguageLabel}</dt>
                <dd className="mt-1 text-sm text-foreground">{settings.language === "ar" ? "العربية (AR)" : "English (EN)"}</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">{t.settingsCMS.themeLabel}</dt>
                <dd className="mt-1 text-sm text-foreground">{t.settingsCMS.matchSystemTheme}</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">{t.settingsCMS.twoFactorLabel}</dt>
                <dd className="mt-1 text-sm text-foreground">{t.settingsCMS.notEnabled}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {section === "general" ? (
          <section aria-label={t.settingsCMS.generalTab}>
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.settingsCMS.generalTab}</h2>
            <form
              action={async (formData: FormData) => {
                const siteName = formData.get("siteName") as string;
                const language = formData.get("language") as string;
                const direction = formData.get("direction") as string;
                if (siteName) {
                  await updateSiteSettings({
                    siteName,
                    description: formData.get("description") as string,
                    language,
                    direction,
                  });
                }
              }}
              className="mt-6 flex flex-col gap-5"
            >
              <Input id="settings-studio-name" name="siteName" label={t.settingsCMS.studioNameLabel} defaultValue={settings.siteName} required />
              <Textarea
                id="settings-description"
                name="description"
                label={t.settingsCMS.siteDescriptionLabel}
                defaultValue={settings.description ?? ""}
                rows={3}
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Select id="settings-language" name="language" label={t.settingsCMS.defaultLanguageLabel} options={languageOptions} defaultValue={settings.language} />
                <Select id="settings-direction" name="direction" label={t.settingsCMS.textDirectionLabel} options={directionOptions} defaultValue={settings.direction} />
                <Select id="settings-timezone" name="timezone" label={t.settingsCMS.timeZoneLabel} options={[{ value: "utc", label: "UTC" }, { value: "gmt+1", label: "GMT+1" }]} defaultValue="utc" />
              </div>
              <Select id="settings-theme" name="theme" label={t.settingsCMS.themeLabel} options={themeOptions} defaultValue="system" />
              <div className="mt-2">
                <Button type="submit">{t.settingsCMS.saveGeneralBtn}</Button>
              </div>
            </form>
          </section>
        ) : null}

        {section === "brand" ? (
          <section aria-label={t.settingsCMS.brandTab}>
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.settingsCMS.brandTab}</h2>

            <form
              action={async (formData: FormData) => {
                await updateSiteSettings({
                  siteName: settings.siteName,
                  logoUrl: formData.get("logoUrl") as string,
                  faviconUrl: formData.get("faviconUrl") as string,
                });
              }}
              className="mt-6 flex flex-col gap-5"
            >
              <Input
                id="settings-logo-url"
                name="logoUrl"
                label={t.settingsCMS.logoUrlLabel}
                defaultValue={settings.logoUrl ?? ""}
                hint={t.settingsCMS.logoHint}
              />

              <Input
                id="settings-favicon-url"
                name="faviconUrl"
                label={t.settingsCMS.faviconUrlLabel}
                defaultValue={settings.faviconUrl ?? ""}
                hint={t.settingsCMS.faviconHint}
              />

              <Button type="submit">
                {t.settingsCMS.saveBrandBtn}
              </Button>
            </form>
          </section>
        ) : null}

        {section === "contact" ? (
          <section aria-label={t.settingsCMS.contactTab}>
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.settingsCMS.contactTab}</h2>
            <form
              action={async (formData: FormData) => {
                await updateSiteSettings({
                  siteName: settings.siteName,
                  email: formData.get("email") as string,
                  phone: formData.get("phone") as string,
                  address: formData.get("address") as string,
                  linkedin: formData.get("linkedin") as string,
                  instagram: formData.get("instagram") as string,
                  twitter: formData.get("twitter") as string,
                });
              }}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  id="settings-email"
                  name="email"
                  type="email"
                  label={t.settingsCMS.studioEmailLabel}
                  defaultValue={settings.email ?? ""}
                />

                <Input
                  id="settings-phone"
                  name="phone"
                  type="tel"
                  label={t.settingsCMS.studioPhoneLabel}
                  defaultValue={settings.phone ?? ""}
                />
                <Input
                  id="settings-address"
                  name="address"
                  label={t.settingsCMS.studioAddressLabel}
                  defaultValue={settings.address ?? ""}
                />
              </div>

              <Textarea
                id="settings-hours"
                name="hours"
                label={t.settingsCMS.officeHoursLabel}
                defaultValue={t.settingsCMS.defaultOfficeHours}
                rows={2}
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  id="settings-linkedin"
                  name="linkedin"
                  label={t.settingsCMS.linkedinUrlLabel}
                  defaultValue={settings.linkedin ?? ""}
                />

                <Input
                  id="settings-instagram"
                  name="instagram"
                  label={t.settingsCMS.instagramUrlLabel}
                  defaultValue={settings.instagram ?? ""}
                />
                <Input
                  id="settings-twitter"
                  name="twitter"
                  label={t.settingsCMS.twitterUrlLabel}
                  defaultValue={settings.twitter ?? ""}
                />
              </div>

              <Button type="submit">{t.settingsCMS.saveContactBtn}</Button>
            </form>
            <SavePanel label="contact" buttonLabel={t.settingsCMS.saveContactBtn} />
          </section>
        ) : null}

        {section === "security" ? (
          <section aria-label={t.settingsCMS.securityTab}>
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.settingsCMS.securityTab}</h2>

            <form
              action={async (formData: FormData) => {
                const password = formData.get("password") as string;

                if (password) {
                  await updateOwnerPassword(password);
                }
              }}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.settingsCMS.twoFactorFullLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/60">
                    {t.settingsCMS.notEnabled}
                  </p>
                </div>

                <Button type="button" variant="secondary">
                  {t.settingsCMS.enableBtn}
                </Button>
              </div>

              <Input
                id="settings-new-password"
                name="password"
                type="password"
                label={t.settingsCMS.newPasswordLabel}
                autoComplete="new-password"
                hint={t.settingsCMS.passwordRequirementHint}
              />

              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <p className="text-sm font-medium text-foreground">
                  {t.settingsCMS.activeSessionsHeading}
                </p>
                <p className="mt-1 text-sm text-foreground/70">
                  {t.settingsCMS.activeSessionsCount}
                </p>
              </div>

              <Button type="submit">
                {t.settingsCMS.saveSecurityBtn}
              </Button>
            </form>
          </section>
        ) : null}

        {section === "system" ? (
          <section aria-label={t.settingsCMS.systemTab}>
            <h2 className="font-sans text-lg font-semibold text-foreground">{t.settingsCMS.systemTab}</h2>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">{t.settingsCMS.appVersionLabel}</dt>
                <dd className="numeral-ltr mt-1 text-sm text-foreground">0.1.0</dd>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border p-4">
                <dt className="font-mono text-xs uppercase tracking-wide text-foreground/50">{t.settingsCMS.lastBackupLabel}</dt>
                <dd className="numeral-ltr mt-1 text-sm text-foreground">2026-07-20</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Button type="button" variant="secondary">
                {t.settingsCMS.exportDataBtn}
              </Button>
            </div>

            <div className="mt-10 rounded-[var(--radius-lg)] border border-border p-5">
              <h3 className="font-sans text-sm font-semibold text-foreground">{t.settingsCMS.dangerZoneHeading}</h3>
              <p className="mt-1 text-sm text-foreground/70">{t.settingsCMS.dangerZoneDesc}</p>

              {dangerDone ? (
                <p role="status" className="mt-4 text-sm text-foreground">
                  {t.settingsCMS.previewResetNotice}
                </p>
              ) : confirmingDanger ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-foreground">{t.settingsCMS.resetPrompt}</span>
                  <Button
                    type="button"
                    onClick={() => {
                      setDangerDone(true);
                      setConfirmingDanger(false);
                    }}
                  >
                    {t.settingsCMS.confirmResetBtn}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setConfirmingDanger(false)}>
                    {t.settingsCMS.cancelBtn}
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="secondary" className="mt-4" onClick={() => setConfirmingDanger(true)}>
                  {t.settingsCMS.resetDemoDataBtn}
                </Button>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
