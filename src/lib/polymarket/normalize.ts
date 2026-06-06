import type {
  ForecastEvent,
  ForecastMarket,
  ForecastTag,
  PricePoint
} from "./types";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function optionalText(value: unknown): string | null {
  const parsed = text(value).trim();
  return parsed || null;
}

function number(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function boolean(value: unknown): boolean {
  return value === true || value === "true";
}

function array(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Pattern: DTO Transformer
 * Layer: Application
 * Responsibility: Converts an untrusted Gamma market payload into the viewer's stable market model.
 */
export function normalizeMarket(value: unknown): ForecastMarket {
  const raw = record(value);
  const names = array(raw.outcomes).map((item) => text(item));
  const prices = array(raw.outcomePrices).map((item) => number(item));
  const tokenIds = array(raw.clobTokenIds).map((item) => text(item));

  return {
    id: text(raw.id || raw.conditionId),
    slug: text(raw.slug),
    question: text(raw.question || raw.title),
    active: boolean(raw.active),
    closed: boolean(raw.closed),
    volume: number(raw.volume || raw.volumeNum),
    volume24h: number(raw.volume24hr || raw.volume24hrClob),
    liquidity: number(raw.liquidity || raw.liquidityNum),
    endDate: optionalText(raw.endDate || raw.endDateIso),
    outcomes: names.map((name, index) => ({
      name,
      probability: Number.isFinite(prices[index]) ? prices[index] : null,
      tokenId: tokenIds[index] || null
    }))
  };
}

/**
 * Pattern: DTO Transformer
 * Layer: Application
 * Responsibility: Converts an untrusted Gamma event payload into a complete forecast event.
 */
export function normalizeEvent(value: unknown): ForecastEvent {
  const raw = record(value);

  return {
    id: text(raw.id),
    slug: text(raw.slug),
    title: text(raw.title),
    description: text(raw.description),
    image: optionalText(raw.image || raw.icon),
    active: boolean(raw.active),
    closed: boolean(raw.closed),
    volume: number(raw.volume),
    volume24h: number(raw.volume24hr),
    liquidity: number(raw.liquidity),
    startDate: optionalText(raw.startDate),
    endDate: optionalText(raw.endDate),
    closedTime: optionalText(raw.closedTime || raw.closed_time),
    resolutionSource: optionalText(raw.resolutionSource),
    tags: array(raw.tags).map(normalizeTag).filter((tag) => tag.id),
    markets: array(raw.markets)
      .map(normalizeMarket)
      .filter((market) => market.id && market.question)
  };
}

/**
 * Pattern: DTO Transformer
 * Layer: Application
 * Responsibility: Normalizes a public Polymarket category tag.
 */
export function normalizeTag(value: unknown): ForecastTag {
  const raw = record(value);
  return {
    id: text(raw.id),
    label: text(raw.label),
    slug: text(raw.slug)
  };
}

/**
 * Pattern: DTO Transformer
 * Layer: Application
 * Responsibility: Converts CLOB history points into chart-safe probabilities.
 */
export function normalizePriceHistory(value: unknown): PricePoint[] {
  const raw = record(value);

  return array(raw.history)
    .map((item) => {
      const point = record(item);
      return {
        timestamp: number(point.t),
        probability: number(point.p)
      };
    })
    .filter(
      (point) =>
        point.timestamp > 0 &&
        point.probability >= 0 &&
        point.probability <= 1
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}
