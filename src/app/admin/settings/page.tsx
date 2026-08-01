import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SettingsManagement } from "./SettingsManagement";

export const metadata: Metadata = {
  title: "Settings — F Studio Admin",
  description: "Configure general, brand, contact, security, and system settings.",
};

/**
 * Settings (Page_Structure.md §16). Global Components: SideNavBar,
 * AdminHeader. Section nav + panels live in SettingsManagement (colocated
 * client component) per §15.9.
 */
export default function AdminSettingsPage() {
  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="settings" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="Settings" breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]} />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <SettingsManagement />
        </main>
      </div>
    </div>
  );
}
