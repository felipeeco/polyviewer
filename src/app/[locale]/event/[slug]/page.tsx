import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {EventDetail} from "@/components/forecast/EventDetail";
import {getForecastEvent} from "@/lib/polymarket/api";
import type {ChartRange} from "@/lib/polymarket/types";
import {queryValue} from "@/lib/format";

type DetailPageProps = {
  params: Promise<{locale: string; slug: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function chartRange(value: string | undefined): ChartRange {
  return value === "1d" || value === "1w" || value === "1m" || value === "max"
    ? value
    : "1m";
}

export async function generateMetadata({
  params
}: DetailPageProps): Promise<Metadata> {
  const {slug} = await params;
  const event = await getForecastEvent(slug);

  return event
    ? {
        title: `${event.title} | PolyViewer`,
        description: event.description.slice(0, 160)
      }
    : {};
}

export default async function ForecastDetailPage({
  params,
  searchParams
}: DetailPageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const values = await searchParams;
  const event = await getForecastEvent(slug);

  if (!event || event.markets.length === 0) {
    const t = await getTranslations("Detail");
    return (
      <div className="pv-grid grid min-h-[55vh] place-items-center py-16 text-center">
        <h1 className="pv-title text-4xl">{t("notFound")}</h1>
      </div>
    );
  }

  const marketId = queryValue(values.market);
  const market =
    event.markets.find((candidate) => candidate.id === marketId) ??
    event.markets[0];
  const range = chartRange(queryValue(values.range));

  return <EventDetail event={event} market={market} range={range} />;
}
