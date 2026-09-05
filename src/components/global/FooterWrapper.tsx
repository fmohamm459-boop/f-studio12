import { getSiteSettings } from "@/lib/actions/settings";
import { Footer } from "./Footer";

export async function FooterWrapper() {
  const settings = await getSiteSettings();

  return (
    <Footer
      siteName={settings?.siteName}
      description={settings?.description}
      contactEmail={settings?.email}
    />
  );
}
