import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FxLab } from "@/components/lab/FxLab";

export const metadata: Metadata = { title: "Lumera FX Lab", robots: { index: false, follow: false } };

/** The effects library, each effect on its own: what it does, how to use it, live. */
export default async function LabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FxLab locale={locale} />;
}
