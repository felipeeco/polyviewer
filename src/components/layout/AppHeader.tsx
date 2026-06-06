"use client";

import {Suspense} from "react";
import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import {BrandLogo} from "@/components/brand/BrandLogo";
import {Link} from "@/i18n/navigation";
import {LanguageSwitcher} from "./LanguageSwitcher";

export function AppHeader() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const resolvedActive = pathname.includes("/resolved");

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="pv-grid flex h-20 items-center justify-between gap-4">
        <Link href="/" aria-label={t("home")} className="shrink-0">
          <BrandLogo />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="ml-auto flex items-center gap-1 sm:gap-3"
        >
          <Link
            href="/"
            className={`rounded-card px-3 py-3 text-xs font-bold uppercase transition ${
              resolvedActive ? "text-muted hover:text-white" : "bg-white/8 text-white"
            }`}
          >
            {t("live")}
          </Link>
          <Link
            href="/resolved"
            className={`rounded-card px-3 py-3 text-xs font-bold uppercase transition ${
              resolvedActive ? "bg-white/8 text-white" : "text-muted hover:text-white"
            }`}
          >
            {t("resolved")}
          </Link>
          <Suspense
            fallback={
              <span className="inline-flex min-h-10 items-center rounded-card border border-white/15 bg-white/5 px-3 text-xs font-bold text-muted">
                EN/ES
              </span>
            }
          >
            <LanguageSwitcher label={t("language")} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
