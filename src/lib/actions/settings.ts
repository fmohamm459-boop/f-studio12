"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteName: "F Studio",
        language: "en",
        direction: "ltr",
      },
    });
  }

  return settings;
}

export async function updateSiteSettings(data: {
  siteName: string;
  description?: string | null;

  logoUrl?: string | null;
  faviconUrl?: string | null;

  email?: string | null;
  phone?: string | null;
  address?: string | null;

  linkedin?: string | null;
  instagram?: string | null;
  twitter?: string | null;

  language?: string;
  direction?: string;
}){
  const existing = await prisma.siteSettings.findFirst();

  if (!existing) {
    return prisma.siteSettings.create({
      data,
    });
  }

 const result = await prisma.siteSettings.update({
  where: {
    id: existing.id,
  },
  data,
});

revalidatePath("/admin/settings");

return result;
}