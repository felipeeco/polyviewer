"use client";

import {usePathname, useSearchParams} from "next/navigation";
import {LuLanguages} from "react-icons/lu";

export function LanguageSwitcher({label}: {label: string}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = pathname.split("/")[1] === "es" ? "es" : "en";
  const nextLocale = currentLocale === "en" ? "es" : "en";
  const localizedPath = pathname.replace(/^\/(en|es)(?=\/|$)/, `/${nextLocale}`);
  const query = searchParams.toString();
  const href = query ? `${localizedPath}?${query}` : localizedPath;

  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex min-h-10 items-center gap-2 rounded-card border border-white/15 bg-white/5 px-3 text-xs font-bold uppercase text-white transition hover:border-pv-red hover:bg-pv-red/10"
    >
      <LuLanguages className="size-4" />
      {nextLocale.toUpperCase()}
    </a>
  );
}
