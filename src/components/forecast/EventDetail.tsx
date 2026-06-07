import {getFormatter, getTranslations} from "next-intl/server";
import {
  LuArrowLeft,
  LuArrowUpRight,
  LuCalendarClock,
  LuCircleDollarSign,
  LuDroplets,
  LuExternalLink
} from "react-icons/lu";
import {Link} from "@/i18n/navigation";
import {ProbabilityChart} from "./ProbabilityChart";
import {rankForecastMarkets} from "@/lib/polymarket/markets";
import type {
  ChartRange,
  ForecastEvent,
  ForecastMarket
} from "@/lib/polymarket/types";

function detailHref(
  slug: string,
  market: ForecastMarket,
  range: ChartRange
): string {
  const params = new URLSearchParams({market: market.id, range});
  return `/event/${slug}?${params}`;
}

export async function EventDetail({
  event,
  market,
  range
}: {
  event: ForecastEvent;
  market: ForecastMarket;
  range: ChartRange;
}) {
  const t = await getTranslations();
  const format = await getFormatter();
  const status = event.closed ? "resolved" : "live";
  const leadingOutcome = market.outcomes[0];
  const rankedMarkets = rankForecastMarkets(event.markets);

  return (
    <div className="pv-grid py-9 sm:py-12">
      <Link
        href={event.closed ? "/resolved" : "/"}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase text-muted transition hover:text-white"
      >
        <LuArrowLeft className="size-4" />
        {t("Detail.back")}
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-extrabold uppercase ${
                status === "live"
                  ? "border-pv-success/35 bg-pv-success/10 text-pv-success"
                  : "border-white/15 bg-white/5 text-muted"
              }`}
            >
              {t(`Market.${status}`)}
            </span>
            {event.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold text-disabled"
              >
                {tag.label}
              </span>
            ))}
          </div>
          <h1 className="pv-title mt-5 max-w-4xl text-4xl sm:text-6xl">
            {event.title}
          </h1>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted">
            <LuCalendarClock className="size-4 text-pv-red" />
            {event.endDate
              ? `${t(status === "live" ? "Market.ends" : "Market.closed")}: ${format.dateTime(
                  new Date(event.endDate),
                  {year: "numeric", month: "long", day: "numeric"}
                )}`
              : t("Market.unavailable")}
          </p>
        </div>

        <div
          className="min-h-52 rounded-panel border border-white/10 bg-elevated bg-cover bg-center"
          style={
            event.image
              ? {backgroundImage: `url("${event.image.replaceAll('"', "%22")}")`}
              : {
                  backgroundImage:
                    "radial-gradient(circle at 70% 30%, rgba(229,9,20,.5), transparent 30%), linear-gradient(135deg,#171717,#050505)"
                }
          }
          role="img"
          aria-label={event.title}
        />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [LuCircleDollarSign, t("Market.volume"), event.volume],
          [LuArrowUpRight, t("Market.volume24h"), event.volume24h],
          [LuDroplets, t("Market.liquidity"), event.liquidity]
        ].map(([Icon, label, value]) => {
          const StatIcon = Icon as typeof LuCircleDollarSign;
          return (
            <div key={String(label)} className="pv-panel flex items-center gap-4 p-5">
              <span className="grid size-11 place-items-center rounded-full border border-pv-red/40 bg-pv-red/10 text-pv-red-bright">
                <StatIcon className="size-5" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase text-disabled">
                  {label as string}
                </span>
                <strong className="mt-1 block text-xl">
                  {format.number(Number(value), {
                    notation: "compact",
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 1
                  })}
                </strong>
              </div>
            </div>
          );
        })}
      </section>

      {event.markets.length > 1 ? (
        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase text-muted">
            {t("Detail.selectMarket")}
          </h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {rankedMarkets.map((option) => (
              <Link
                key={option.id}
                href={detailHref(event.slug, option, range)}
                className={`shrink-0 rounded-card border px-4 py-3 text-sm font-semibold transition ${
                  option.id === market.id
                    ? "border-pv-red bg-pv-red/15 text-white"
                    : "border-white/10 bg-white/[0.035] text-muted hover:border-white/25 hover:text-white"
                }`}
              >
                {option.question}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="pv-panel mt-8 p-5 sm:p-7">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="pv-eyebrow">{t("Detail.marketStatus")}</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              {market.question}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase text-muted">
            {t(`Market.${market.closed ? "resolved" : "live"}`)}
          </span>
        </div>

        <h3 className="mt-6 text-xs font-bold uppercase text-muted">
          {t("Detail.outcomes")}
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {market.outcomes.map((outcome, index) => (
            <div
              key={`${outcome.name}-${index}`}
              className="flex items-center justify-between rounded-card border border-white/10 bg-black/35 p-4"
            >
              <span className="text-muted">{outcome.name}</span>
              <strong
                className={`font-display text-3xl ${
                  index === 0 ? "text-pv-red-bright" : "text-white"
                }`}
              >
                {outcome.probability === null
                  ? "—"
                  : format.number(outcome.probability, {
                      style: "percent",
                      maximumFractionDigits: 1
                    })}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="pv-panel mt-8 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {t("Detail.history")}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t("Detail.historyDescription", {
                outcome: leadingOutcome?.name ?? ""
              })}
            </p>
          </div>
          <div className="flex gap-1" aria-label={t("Detail.range")}>
            {(["1d", "1w", "1m", "max"] as const).map((option) => (
              <Link
                key={option}
                href={detailHref(event.slug, market, option)}
                className={`rounded-lg px-3 py-2 text-xs font-extrabold uppercase transition ${
                  range === option
                    ? "bg-pv-red text-white"
                    : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
                }`}
              >
                {t(`Detail.range${option === "max" ? "Max" : option}`)}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <ProbabilityChart outcome={leadingOutcome} range={range} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="pv-panel p-6">
          <h2 className="font-display text-2xl font-bold">
            {t("Detail.about")}
          </h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">
            {event.description || t("Market.unavailable")}
          </p>
          {event.resolutionSource ? (
            <div className="mt-6 border-t border-white/10 pt-5">
              <h3 className="text-xs font-bold uppercase text-disabled">
                {t("Detail.resolutionSource")}
              </h3>
              <p className="mt-2 break-words text-sm text-muted">
                {event.resolutionSource}
              </p>
            </div>
          ) : null}
        </div>
        <a
          href={`https://polymarket.com/event/${event.slug}`}
          target="_blank"
          rel="noreferrer"
          className="pv-button pv-button-primary self-start"
        >
          {t("Detail.openPolymarket")}
          <LuExternalLink className="size-4" />
        </a>
      </section>
    </div>
  );
}
