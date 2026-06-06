import {getTranslations} from "next-intl/server";
import {BrandLogo} from "@/components/brand/BrandLogo";

export async function AppFooter() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="border-b border-white/10 bg-white/[0.025]">
        <div className="pv-grid py-6 text-sm leading-6 text-muted">
          <p>{t("Disclaimer.text")}</p>
          <p className="mt-2 font-semibold text-white">
            {t("Disclaimer.short")}
          </p>
        </div>
      </div>
      <div className="pv-grid flex flex-col gap-5 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <BrandLogo />
          <p className="mt-3 text-sm text-disabled">
            {t("Footer.dataSource")}
          </p>
          <p className="mt-1 text-sm text-disabled">
            {new Date().getFullYear()} {t("Footer.rights")}
          </p>
        </div>
        <a
          href="https://www.linkedin.com/in/luisfelipemoreno/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-disabled transition hover:text-white"
        >
          {t("Footer.developedBy")}
        </a>
      </div>
    </footer>
  );
}
