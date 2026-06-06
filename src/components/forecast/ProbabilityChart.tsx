import {getFormatter, getTranslations} from "next-intl/server";
import {getPriceHistory} from "@/lib/polymarket/api";
import type {
  ChartRange,
  Outcome,
  PricePoint
} from "@/lib/polymarket/types";

const WIDTH = 900;
const HEIGHT = 320;
const PADDING_X = 54;
const PADDING_Y = 28;

function chartPath(points: {timestamp: number; probability: number}[]): string {
  if (points.length === 0) return "";
  const first = points[0].timestamp;
  const last = points.at(-1)?.timestamp ?? first;
  const span = Math.max(1, last - first);

  return points
    .map((point, index) => {
      const x = PADDING_X + ((point.timestamp - first) / span) * (WIDTH - PADDING_X * 2);
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
 * Responsibility: Loads one outcome's public history and renders an accessible probability chart.
 */
export async function ProbabilityChart({
  outcome,
  range
}: {
  outcome: Outcome | undefined;
  range: ChartRange;
}) {
  const t = await getTranslations("Detail");
  const format = await getFormatter();
  let points: PricePoint[] = [];
  let failed = false;

  if (outcome?.tokenId) {
    try {
      points = await getPriceHistory(outcome.tokenId, range);
    } catch {
      failed = true;
    }
  }

  if (failed) {
    return (
      <div className="grid min-h-72 place-items-center text-center text-muted">
        {t("chartError")}
      </div>
    );
  }

  if (points.length < 2) {
    return (
      <div className="grid min-h-72 place-items-center text-center text-muted">
        {t("chartEmpty")}
      </div>
    );
  }

  const path = chartPath(points);
  const start = new Date(points[0].timestamp * 1000);
  const end = new Date((points.at(-1)?.timestamp ?? points[0].timestamp) * 1000);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t("historyDescription", {outcome: outcome?.name ?? ""})}
        className="h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e50914" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#e50914" stopOpacity="0" />
          </linearGradient>
        </defs>
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
        <path
          d={`${path} L${WIDTH - PADDING_X},${HEIGHT - PADDING_Y} L${PADDING_X},${HEIGHT - PADDING_Y} Z`}
          fill="url(#chart-fill)"
        />
        <path
          d={path}
          fill="none"
          stroke="#ff2432"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={WIDTH - PADDING_X}
          cy={
            PADDING_Y +
            (1 - (points.at(-1)?.probability ?? 0)) *
              (HEIGHT - PADDING_Y * 2)
          }
          r="6"
          fill="#fff"
          stroke="#e50914"
          strokeWidth="4"
        />
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
