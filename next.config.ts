import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Formats/sizes per UI_Guidelines §20.2 (WebP/AVIF preferred, >=2x for high-DPI).
    formats: ["image/avif", "image/webp"],
    // Phase 9.3.13-A — required so next/image (and, by extension, any
    // future rendering of Project.heroImage/galleryImages via next/image)
    // can serve Cloudinary-hosted URLs. No other images config changed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
