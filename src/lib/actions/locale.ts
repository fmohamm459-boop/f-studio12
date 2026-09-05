"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSupportedLocale, LOCALE_COOKIE_NAME, type Locale } from "@/i18n/config";

export async function setLocaleAction(locale: string, path?: string) {
  if (!isSupportedLocale(locale)) {
    return { success: false, error: "Unsupported locale" };
  }

  try {
    const cookieStore = cookies();
    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath("/", "layout");
    }

    return { success: true, locale: locale as Locale };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set locale",
    };
  }
}
