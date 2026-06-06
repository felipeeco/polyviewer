import {
  normalizeEvent,
  normalizePriceHistory,
  normalizeTag
} from "./normalize";
import type {
  ChartRange,
  ForecastEvent,
  ForecastPage,
  ForecastStatus,
  ForecastTag,
  PricePoint
} from "./types";

const GAMMA_API = "https://gamma-api.polymarket.com";
const CLOB_API = "https://clob.polymarket.com";
const PAGE_SIZE = 24;

type ListingOptions = {
  status: ForecastStatus;
  page: number;
  query?: string;
  tagId?: string;
  sort?: string;
};

function cacheSeconds(status: ForecastStatus): number {
  return status === "live" ? 60 : 86400;
}

function statusMatches(event: ForecastEvent, status: ForecastStatus): boolean {
  return status === "live"
    ? event.active && !event.closed
    : event.closed;
}

function listingOrder(status: ForecastStatus, sort?: string): {
  order: string;
  ascending: string;
} {
  if (status === "resolved") {
    return {order: "closed_time", ascending: "false"};
  }

  switch (sort) {
    case "volume":
      return {order: "volume", ascending: "false"};
    case "liquidity":
      return {order: "liquidity", ascending: "false"};
    case "closing":
      return {order: "end_date", ascending: "true"};
    default:
      return {order: "volume_24hr", ascending: "false"};
  }
}

async function getJson(url: URL, revalidate: number): Promise<unknown> {
  const response = await fetch(url, {
    next: {revalidate},
    headers: {accept: "application/json"}
  });

  if (!response.ok) {
    throw new Error(`Polymarket request failed with ${response.status}`);
  }

  return response.json();
}

/**
 * Pattern: Adapter
 * Layer: Infrastructure
 * Responsibility: Retrieves a paginated live or resolved event collection from Polymarket.
 */
export async function getForecastEvents({
  status,
  page,
  query,
  tagId,
  sort
}: ListingOptions): Promise<ForecastPage> {
  const safePage = Math.max(1, page);

  if (query?.trim()) {
    const url = new URL("/public-search", GAMMA_API);
    url.searchParams.set("q", query.trim());
    url.searchParams.set("page", String(safePage));
    url.searchParams.set("limit_per_type", String(PAGE_SIZE + 1));
    url.searchParams.set("search_profiles", "false");
    url.searchParams.set("search_tags", "false");
    url.searchParams.set("keep_closed_markets", status === "resolved" ? "1" : "0");

    const payload = (await getJson(url, cacheSeconds(status))) as {
      events?: unknown[];
      pagination?: {hasMore?: boolean};
    };
    const events = (payload.events ?? [])
      .map(normalizeEvent)
      .filter((event) => event.id && statusMatches(event, status));

    return {
      events: events.slice(0, PAGE_SIZE),
      hasNextPage:
        Boolean(payload.pagination?.hasMore) || events.length > PAGE_SIZE
    };
  }

  const {order, ascending} = listingOrder(status, sort);
  const url = new URL("/events", GAMMA_API);
  url.searchParams.set("active", status === "live" ? "true" : "false");
  url.searchParams.set("closed", status === "resolved" ? "true" : "false");
  url.searchParams.set("limit", String(PAGE_SIZE + 1));
  url.searchParams.set("offset", String((safePage - 1) * PAGE_SIZE));
  url.searchParams.set("order", order);
  url.searchParams.set("ascending", ascending);
  if (tagId) url.searchParams.set("tag_id", tagId);

  const payload = await getJson(url, cacheSeconds(status));
  const events = (Array.isArray(payload) ? payload : [])
    .map(normalizeEvent)
    .filter((event) => event.id);

  return {
    events: events.slice(0, PAGE_SIZE),
    hasNextPage: events.length > PAGE_SIZE
  };
}

/**
 * Pattern: Adapter
 * Layer: Infrastructure
 * Responsibility: Retrieves the category choices used by forecast filters.
 */
export async function getForecastTags(): Promise<ForecastTag[]> {
  const url = new URL("/tags", GAMMA_API);
  url.searchParams.set("limit", "100");
  url.searchParams.set("offset", "0");
  url.searchParams.set("order", "volume");
  url.searchParams.set("ascending", "false");

  const payload = await getJson(url, 86400);
  return (Array.isArray(payload) ? payload : [])
    .map(normalizeTag)
    .filter((tag) => tag.id && tag.label);
}

/**
 * Pattern: Adapter
 * Layer: Infrastructure
 * Responsibility: Retrieves a single event by its public Polymarket slug.
 */
export async function getForecastEvent(
  slug: string
): Promise<ForecastEvent | null> {
  const url = new URL(`/events/slug/${encodeURIComponent(slug)}`, GAMMA_API);

  try {
    const payload = await getJson(url, 60);
    const event = normalizeEvent(payload);
    return event.id ? event : null;
  } catch {
    return null;
  }
}

function historyParameters(range: ChartRange): {
  interval: string;
  fidelity: string;
  startTs?: string;
} {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;

  switch (range) {
    case "1d":
      return {interval: "1d", fidelity: "5", startTs: String(now - day)};
    case "1w":
      return {interval: "1w", fidelity: "30", startTs: String(now - day * 7)};
    case "1m":
      return {interval: "1m", fidelity: "120", startTs: String(now - day * 30)};
    default:
      return {interval: "max", fidelity: "720"};
  }
}

/**
 * Pattern: Adapter
 * Layer: Infrastructure
 * Responsibility: Retrieves public CLOB price history for one outcome token.
 */
export async function getPriceHistory(
  tokenId: string,
  range: ChartRange
): Promise<PricePoint[]> {
  const url = new URL("/prices-history", CLOB_API);
  const parameters = historyParameters(range);
  url.searchParams.set("market", tokenId);
  url.searchParams.set("interval", parameters.interval);
  url.searchParams.set("fidelity", parameters.fidelity);
  if (parameters.startTs) url.searchParams.set("startTs", parameters.startTs);

  const payload = await getJson(url, 300);
  return normalizePriceHistory(payload);
}
