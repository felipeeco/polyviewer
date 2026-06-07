import {Resolver} from "node:dns/promises";
import {request} from "node:https";
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
const REQUEST_TIMEOUT_MS = 6000;
const DIRECT_FETCH_TIMEOUT_MS = 2500;
const PUBLIC_DNS_SERVERS = ["1.1.1.1", "8.8.8.8"];
const addressCache = new Map<string, Promise<string[]>>();
const publicDnsFallbackHosts = new Set<string>();

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

function resolvePublicAddresses(hostname: string): Promise<string[]> {
  const cached = addressCache.get(hostname);
  if (cached) return cached;

  const lookup = (async () => {
    const resolver = new Resolver();
    resolver.setServers(PUBLIC_DNS_SERVERS);
    return resolver.resolve4(hostname);
  })();

  addressCache.set(hostname, lookup);
  lookup.catch(() => addressCache.delete(hostname));
  return lookup;
}

function requestJsonAtAddress(url: URL, address: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const upstream = request(
      {
        protocol: url.protocol,
        hostname: address,
        port: 443,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: url.hostname,
        headers: {
          accept: "application/json",
          host: url.hostname,
          "user-agent": "PolyViewer/1.0"
        },
        timeout: REQUEST_TIMEOUT_MS
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const status = response.statusCode ?? 500;
          if (status < 200 || status >= 300) {
            reject(new Error(`Polymarket request failed with ${status}`));
            return;
          }

          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch {
            reject(new Error("Polymarket returned invalid JSON"));
          }
        });
      }
    );

    upstream.on("timeout", () => {
      upstream.destroy(new Error("Polymarket request timed out"));
    });
    upstream.on("error", reject);
    upstream.end();
  });
}

async function requestJsonThroughPublicDns(url: URL): Promise<unknown> {
  const addresses = await resolvePublicAddresses(url.hostname);
  let lastError: unknown = new Error("No public address was found");

  for (const address of addresses) {
    try {
      return await requestJsonAtAddress(url, address);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function getJson(url: URL, revalidate: number): Promise<unknown> {
  if (publicDnsFallbackHosts.has(url.hostname)) {
    return requestJsonThroughPublicDns(url);
  }

  try {
    const response = await fetch(url, {
      next: {revalidate},
      headers: {accept: "application/json"},
      signal: AbortSignal.timeout(DIRECT_FETCH_TIMEOUT_MS)
    });

    if (!response.ok) {
      throw new Error(`Polymarket request failed with ${response.status}`);
    }

    return response.json();
  } catch (directError) {
    publicDnsFallbackHosts.add(url.hostname);

    try {
      return await requestJsonThroughPublicDns(url);
    } catch (fallbackError) {
      throw new AggregateError(
        [directError, fallbackError],
        `Unable to reach ${url.hostname}`
      );
    }
  }
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
    url.searchParams.set("events_status", status === "live" ? "active" : "closed");
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
  url.searchParams.set("order", "id");
  url.searchParams.set("ascending", "true");

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
