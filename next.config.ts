import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // The AI-automation page and its cases are plain HTML pages in public/ (own CSS, JS and UA/RU dictionaries,
  // public/css|js|locales/ai-*); a folder's index.html is not served by itself, so the clean addresses point at it.
  async rewrites() {
    return [
      { source: "/ai-avtomatyzatsiia", destination: "/ai-avtomatyzatsiia/index.html" },
      { source: "/keisy/poshuk-zamovlen", destination: "/keisy/poshuk-zamovlen/index.html" },
      { source: "/keisy/ai-asystent", destination: "/keisy/ai-asystent/index.html" },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default createNextIntlPlugin()(nextConfig);
