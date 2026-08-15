import { getSiteSettings } from "@/lib/actions/settings";
import { TopNavBar } from "./TopNavBar";

export async function TopNavBarWrapper() {
  const settings = await getSiteSettings();

  return (
    <TopNavBar
      logoUrl={settings.logoUrl}
      siteName={settings.siteName}
    />
  );
}