"use client";

import {Suspense, useState} from "react";
import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import {LuMenu, LuX} from "react-icons/lu";
import {BrandLogo} from "@/components/brand/BrandLogo";
import {Link} from "@/i18n/navigation";
import {LanguageSwitcher} from "./LanguageSwitcher";

export function AppHeader() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const resolvedActive = pathname.includes("/resolved");

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="pv-grid flex h-20 items-center justify-between gap-4">
        <Link href="/" aria-label={t("home")} className="shrink-0">
          <BrandLogo />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="ml-auto hidden items-center gap-3 lg:flex"
        >
          <Link
            href="/"
            aria-current={resolvedActive ? undefined : "page"}
            className={`rounded-card px-3 py-3 text-xs font-bold uppercase transition ${
              resolvedActive ? "text-muted hover:text-white" : "bg-white/8 text-white"
            }`}
          >
            {t("live")}
          </Link>
          <Link
            href="/resolved"
            aria-current={resolvedActive ? "page" : undefined}
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

        <button
          type="button"
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto inline-flex size-11 items-center justify-center rounded-card border border-white/15 bg-white/5 text-white transition hover:border-pv-red hover:bg-pv-red/10 lg:hidden"
        >
          {menuOpen ? (
            <LuX aria-hidden="true" className="size-5" />
          ) : (
            <LuMenu aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Primary navigation"
          className="border-t border-white/10 bg-black/95 lg:hidden"
        >
          <div className="pv-grid flex flex-col gap-2 py-4">
            <Link
              href="/"
              aria-current={resolvedActive ? undefined : "page"}
              onClick={() => setMenuOpen(false)}
              className={`rounded-card px-4 py-3 text-sm font-bold uppercase transition ${
                resolvedActive ? "text-muted hover:bg-white/5 hover:text-white" : "bg-white/8 text-white"
              }`}
            >
              {t("live")}
            </Link>
            <Link
              href="/resolved"
              aria-current={resolvedActive ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
              className={`rounded-card px-4 py-3 text-sm font-bold uppercase transition ${
                resolvedActive ? "bg-white/8 text-white" : "text-muted hover:bg-white/5 hover:text-white"
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
          </div>
        </nav>
      ) : null}
    </header>
  );
}
