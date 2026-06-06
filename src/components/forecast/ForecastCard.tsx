import {getFormatter, getTranslations} from "next-intl/server";
import {LuArrowRight, LuCalendarClock, LuLayers3} from "react-icons/lu";
import {Link} from "@/i18n/navigation";
import type {ForecastEvent, ForecastStatus} from "@/lib/polymarket/types";

export async function ForecastCard({
  event,
  status
}: {
  event: ForecastEvent;
  status: ForecastStatus;
}) {
  const t = await getTranslations("Market");
  const format = await getFormatter();
  const leadingMarket = event.markets[0];
  const leadingOutcomes = leadingMarket?.outcomes.slice(0, 2) ?? [];
  const date = status === "resolved" ? event.closedTime || event.endDate : event.endDate;

  return (
    <article className="pv-card flex h-full flex-col overflow-hidden">
      <div
        className="h-36 border-b border-white/10 bg-elevated bg-cover bg-center"
        style={
          event.image
            ? {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,.8), rgba(0,0,0,.1)), url("${event.image.replaceAll('"', "%22")}")`
              }
            : {
                backgroundImage:
                  "radial-gradient(circle at 70% 30%, rgba(229,9,20,.45), transparent 30%), linear-gradient(135deg,#171717,#050505)"
              }
        }
        role="img"
        aria-label={event.title}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-extrabold uppercase ${
              status === "live"
                ? "border-pv-success/35 bg-pv-success/10 text-pv-success"
                : "border-white/15 bg-white/5 text-muted"
            }`}
          >
            {t(status)}
          </span>
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[0.68rem] font-bold text-disabled"
            >
              {tag.label}
            </span>
          ))}
        </div>

        <h2 className="mt-4 font-display text-xl font-bold leading-tight text-white">
          {event.title}
        </h2>

        {leadingOutcomes.length ? (
          <div className="mt-5 grid gap-2">
            {leadingOutcomes.map((outcome, index) => (
              <div
                key={`${outcome.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/35 px-3 py-2"
              >
                <span className="truncate pr-3 text-sm text-muted">
                  {outcome.name}
                </span>
                <strong className={index === 0 ? "text-pv-red-bright" : "text-white"}>
                  {outcome.probability === null
                    ? t("unavailable")
                    : format.number(outcome.probability, {
                        style: "percent",
                        maximumFractionDigits: 1
                      })}
                </strong>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-auto grid grid-cols-2 gap-3 pt-5 text-xs text-disabled">
          <span className="flex items-center gap-2">
            <LuLayers3 className="size-4 text-pv-red" />
            {t("markets", {count: event.markets.length})}
          </span>
          {date ? (
            <span className="flex items-center justify-end gap-2 text-right">
              <LuCalendarClock className="size-4 text-pv-red" />
              {format.dateTime(new Date(date), {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
          {[
            [t("volume"), event.volume],
            [t("volume24h"), event.volume24h],
            [t("liquidity"), event.liquidity]
          ].map(([label, value]) => (
            <div key={String(label)}>
              <span className="block text-[0.64rem] font-bold uppercase text-disabled">
                {label}
              </span>
              <strong className="mt-1 block text-sm text-white">
                {format.number(Number(value), {
                  notation: "compact",
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 1
                })}
              </strong>
            </div>
          ))}
        </div>

        <Link
          href={`/event/${event.slug}`}
          className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-extrabold uppercase text-white transition hover:text-pv-red-bright"
        >
          {t("viewForecast")}
          <LuArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
