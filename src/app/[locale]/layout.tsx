import type {Metadata} from "next";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {AppFooter} from "@/components/layout/AppFooter";
import {AppHeader} from "@/components/layout/AppHeader";
import {Disclaimer} from "@/components/layout/Disclaimer";
import {routing} from "@/i18n/routing";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: LocaleLayoutProps): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({locale, namespace: "Metadata"});

  return {
    title: t("title"),
    description: t("description"),
    applicationName: "PolyViewer",
    icons: {icon: "/icon.svg"},
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website"
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("Disclaimer");

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <Disclaimer text={t("text")} />
            <main className="flex-1">{children}</main>
            <AppFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
