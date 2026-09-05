import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SettingsManagement } from "./SettingsManagement";
import { getSiteSettings } from "@/lib/actions/settings";
import { getServerTranslation } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Settings — F Studio Admin",
  description: "Configure general, brand, contact, security, and system settings.",
};

export default async function AdminSettingsPage() {
  const { t } = await getServerTranslation();
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="settings" />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={t.admin.settings}
          breadcrumbs={[{ label: t.admin.dashboard, href: "/admin/dashboard" }, { label: t.admin.settings }]}
        />

        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <SettingsManagement settings={settings} />
        </main>
      </div>
    </div>
  );
}