import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // The AI-automation page and its cases are app pages (app/[locale]/ai-avtomatyzatsiia, …/keisy/*): Russian under
  // /ru like the main page. Their first, static version took ?lang=ru: such links land on the Russian page.
  async redirects() {
    return ["/ai-avtomatyzatsiia", "/keisy/poshuk-zamovlen", "/keisy/ai-asystent"].map((source) => ({
      source,
      has: [{ type: "query" as const, key: "lang", value: "ru" }],
      destination: `/ru${source}`,
      permanent: false,
    }));
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
