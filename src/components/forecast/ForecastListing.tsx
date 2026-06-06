import {getTranslations} from "next-intl/server";
import {LuDatabaseZap, LuSearchX} from "react-icons/lu";
import {ForecastCard} from "./ForecastCard";
import {ForecastFilters} from "./ForecastFilters";
import {Pagination} from "./Pagination";
import {getForecastEvents, getForecastTags} from "@/lib/polymarket/api";
import type {
  ForecastPage,
  ForecastStatus,
  ForecastTag
} from "@/lib/polymarket/types";
import {parsePage, queryValue} from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function ForecastListing({
  status,
  searchParams
}: {
  status: ForecastStatus;
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const query = queryValue(params.q);
  const tag = queryValue(params.tag);
  const sort = queryValue(params.sort);
  const t = await getTranslations("Listing");

  let data: ForecastPage;
  let tags: ForecastTag[] = [];
  let failed = false;

  try {
    [data, tags] = await Promise.all([
      getForecastEvents({status, page, query, tagId: tag, sort}),
      getForecastTags()
    ]);
  } catch {
    failed = true;
    data = {events: [], hasNextPage: false};
  }

  const live = status === "live";
  const pathname = live ? "/" : "/resolved";

  return (
    <div className="pv-grid py-10 sm:py-14">
      <section className="max-w-3xl">
        <p className="pv-eyebrow">
          {t(live ? "liveEyebrow" : "resolvedEyebrow")}
        </p>
        <h1 className="pv-title mt-3 text-4xl text-white sm:text-6xl">
          {t(live ? "liveTitle" : "resolvedTitle")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {t(live ? "liveDescription" : "resolvedDescription")}
        </p>
      </section>

      <div className="mt-8">
        <ForecastFilters
          status={status}
          tags={tags}
          values={{query, tag, sort}}
          labels={{
            search: t("searchLabel"),
            searchPlaceholder: t("searchPlaceholder"),
            category: t("categoryLabel"),
            allCategories: t("allCategories"),
            sort: t("sortLabel"),
            volume24h: t("sortVolume24h"),
            volume: t("sortVolume"),
            liquidity: t("sortLiquidity"),
            closing: t("sortClosingSoon"),
            newestResolved: t("sortNewestResolved"),
            apply: t("apply"),
            clear: t("clear")
          }}
        />
      </div>

      {failed ? (
        <div className="pv-panel mt-8 grid min-h-72 place-items-center p-8 text-center">
          <div>
            <LuDatabaseZap className="mx-auto size-10 text-pv-red" />
            <h2 className="mt-4 font-display text-2xl font-bold">
              {t("errorTitle")}
            </h2>
            <p className="mt-2 text-muted">{t("errorDescription")}</p>
          </div>
        </div>
      ) : data.events.length === 0 ? (
        <div className="pv-panel mt-8 grid min-h-72 place-items-center p-8 text-center">
          <div>
            <LuSearchX className="mx-auto size-10 text-pv-red" />
            <h2 className="mt-4 font-display text-2xl font-bold">
              {t("emptyTitle")}
            </h2>
            <p className="mt-2 text-muted">{t("emptyDescription")}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between text-sm text-disabled">
            <p>{t("results", {count: data.events.length})}</p>
            <p>{t("page", {page})}</p>
          </div>
          <section className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.events.map((event) => (
              <ForecastCard key={event.id} event={event} status={status} />
            ))}
          </section>
          <Pagination
            page={page}
            hasNextPage={data.hasNextPage}
            pathname={pathname}
            searchParams={{q: query, tag, sort}}
            labels={{
              previous: t("previous"),
              next: t("next"),
              page: t("page", {page})
            }}
          />
        </>
      )}
    </div>
  );
}
