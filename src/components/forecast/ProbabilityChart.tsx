import {getFormatter, getTranslations} from "next-intl/server";
import {getPriceHistory} from "@/lib/polymarket/api";
import {rankForecastMarkets} from "@/lib/polymarket/markets";
import type {
  ChartRange,
  ForecastMarket,
  PricePoint
} from "@/lib/polymarket/types";

const WIDTH = 900;
const HEIGHT = 320;
const PADDING_X = 54;
const PADDING_Y = 28;
const SERIES_COLORS = ["#ff2432", "#ffffff", "#22c55e", "#f59e0b", "#85858c"];

type ChartSeries = {
  label: string;
  color: string;
  points: PricePoint[];
};

/**
 * Pattern: Utility Function
 * Layer: Application
 * Responsibility: Selects the most relevant market outcomes for a comparative forecast chart.
 */
function chartActors(markets: ForecastMarket[]): {
  label: string;
  tokenId: string;
  color: string;
}[] {
  const rankedMarkets = rankForecastMarkets(markets);
  const actors =
    rankedMarkets.length > 1
      ? rankedMarkets.map((market) => ({
          label: market.question,
          tokenId: market.outcomes[0]?.tokenId
        }))
      : (rankedMarkets[0]?.outcomes ?? []).map((outcome) => ({
          label: outcome.name,
          tokenId: outcome.tokenId
        }));

  return actors
    .filter(
      (actor): actor is {label: string; tokenId: string} =>
        Boolean(actor.tokenId)
    )
    .slice(0, SERIES_COLORS.length)
    .map((actor, index) => ({
      ...actor,
      color: SERIES_COLORS[index]
    }));
}

/**
 * Pattern: Utility Function
 * Layer: Application
 * Responsibility: Projects probability points into a shared SVG time domain.
 */
function chartPath(
  points: PricePoint[],
  firstTimestamp: number,
  lastTimestamp: number
): string {
  if (points.length === 0) return "";
  const span = Math.max(1, lastTimestamp - firstTimestamp);

  return points
    .map((point, index) => {
      const x =
        PADDING_X +
        ((point.timestamp - firstTimestamp) / span) *
          (WIDTH - PADDING_X * 2);
      const y =
        PADDING_Y +
        (1 - point.probability) * (HEIGHT - PADDING_Y * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * Pattern: Functional Composition
 * Layer: Application
 * Responsibility: Loads and compares the public price history of an event's main forecast actors.
 */
export async function ProbabilityChart({
  markets,
  range
}: {
  markets: ForecastMarket[];
  range: ChartRange;
}) {
  const t = await getTranslations("Detail");
  const format = await getFormatter();
  const actors = chartActors(markets);
  const results = await Promise.allSettled(
    actors.map((actor) => getPriceHistory(actor.tokenId, range))
  );
  const series = results.flatMap<ChartSeries>((result, index) => {
    if (result.status === "rejected" || result.value.length < 2) return [];
    return [{...actors[index], points: result.value}];
  });
  const failed =
    actors.length > 0 &&
    results.length > 0 &&
    results.every((result) => result.status === "rejected");

  if (failed) {
    return (
      <div className="grid min-h-64 place-items-center text-center text-sm text-muted">
        {t("chartError")}
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="grid min-h-64 place-items-center text-center text-sm text-muted">
        {t("chartEmpty")}
      </div>
    );
  }

  const timestamps = series.flatMap((item) =>
    item.points.map((point) => point.timestamp)
  );
  const firstTimestamp = Math.min(...timestamps);
  const lastTimestamp = Math.max(...timestamps);
  const start = new Date(firstTimestamp * 1000);
  const end = new Date(lastTimestamp * 1000);

  return (
    <figure>
      <div className="mb-5 grid gap-5 border-b border-white/10 pb-5 sm:grid-cols-2 xl:grid-cols-3">
        {series.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 items-center justify-between gap-0 text-xs"
          >
            <span className="flex min-w-0 items-center gap-1 text-muted">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{backgroundColor: item.color}}
              />
              <span className="truncate">{item.label}</span>
            </span>
            <strong className="shrink-0 text-white">
              {format.number(item.points.at(-1)?.probability ?? 0, {
                style: "percent",
                maximumFractionDigits: 1
              })}
            </strong>
          </div>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t("actorsDescription")}
        className="h-auto w-full overflow-visible"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((value) => {
          const y =
            PADDING_Y + (1 - value) * (HEIGHT - PADDING_Y * 2);
          return (
            <g key={value}>
              <line
                x1={PADDING_X}
                x2={WIDTH - PADDING_X}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,.1)"
                strokeDasharray="4 6"
              />
              <text
                x={PADDING_X - 12}
                y={y + 4}
                textAnchor="end"
                fill="#85858c"
                fontSize="12"
              >
                {Math.round(value * 100)}%
              </text>
            </g>
          );
        })}
        {series.map((item) => {
          const latestPoint = item.points.at(-1) ?? item.points[0];
          const latestX =
            PADDING_X +
            ((latestPoint.timestamp - firstTimestamp) /
              Math.max(1, lastTimestamp - firstTimestamp)) *
              (WIDTH - PADDING_X * 2);
          const latestY =
            PADDING_Y +
            (1 - latestPoint.probability) * (HEIGHT - PADDING_Y * 2);

          return (
            <g key={item.label}>
              <path
                d={chartPath(item.points, firstTimestamp, lastTimestamp)}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={latestX}
                cy={latestY}
                r="4.5"
                fill="#0a0a0a"
                stroke={item.color}
                strokeWidth="3"
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex justify-between text-xs text-disabled">
        <span>
          {format.dateTime(start, {year: "numeric", month: "short", day: "numeric"})}
        </span>
        <span>
          {format.dateTime(end, {year: "numeric", month: "short", day: "numeric"})}
        </span>
      </figcaption>
    </figure>
  );
}
