import type {ForecastMarket} from "./types";

/**
 * Pattern: Strategy
 * Layer: Domain
 * Responsibility: Ranks forecast markets by availability and their primary outcome probability.
 */
export function rankForecastMarkets(
  markets: ForecastMarket[]
): ForecastMarket[] {
  return markets.toSorted((left, right) => {
    const leftUnavailable = !left.active || left.closed;
    const rightUnavailable = !right.active || right.closed;

    if (leftUnavailable !== rightUnavailable) {
      return Number(leftUnavailable) - Number(rightUnavailable);
    }

    const leftProbability = left.outcomes[0]?.probability ?? -1;
    const rightProbability = right.outcomes[0]?.probability ?? -1;
    return rightProbability - leftProbability;
  });
}
