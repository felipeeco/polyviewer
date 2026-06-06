export type Outcome = {
  name: string;
  probability: number | null;
  tokenId: string | null;
};

export type ForecastMarket = {
  id: string;
  slug: string;
  question: string;
  active: boolean;
  closed: boolean;
  volume: number;
  volume24h: number;
  liquidity: number;
  endDate: string | null;
  outcomes: Outcome[];
};

export type ForecastTag = {
  id: string;
  label: string;
  slug: string;
};

export type ForecastEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  active: boolean;
  closed: boolean;
  volume: number;
  volume24h: number;
  liquidity: number;
  startDate: string | null;
  endDate: string | null;
  closedTime: string | null;
  resolutionSource: string | null;
  tags: ForecastTag[];
  markets: ForecastMarket[];
};

export type ForecastPage = {
  events: ForecastEvent[];
  hasNextPage: boolean;
};

export type PricePoint = {
  timestamp: number;
  probability: number;
};

export type ForecastStatus = "live" | "resolved";
export type ChartRange = "1d" | "1w" | "1m" | "max";
