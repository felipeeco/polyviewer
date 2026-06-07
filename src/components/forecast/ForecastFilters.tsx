import {LuFilter, LuSearch, LuX} from "react-icons/lu";
import type {ForecastStatus, ForecastTag} from "@/lib/polymarket/types";
import {Link} from "@/i18n/navigation";

type ForecastFiltersProps = {
  status: ForecastStatus;
  tags: ForecastTag[];
  values: {
    query?: string;
    tag?: string;
    sort?: string;
  };
  labels: {
    search: string;
    searchPlaceholder: string;
    category: string;
    allCategories: string;
    sort: string;
    volume24h: string;
    volume: string;
    liquidity: string;
    closing: string;
    newestResolved: string;
    apply: string;
    clear: string;
  };
};

export function ForecastFilters({
  status,
  tags,
  values,
  labels
}: ForecastFiltersProps) {
  return (
    <form className="pv-panel grid gap-4 p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto] lg:items-end">
      <label className="grid gap-2 text-xs font-bold uppercase text-muted">
        {labels.search}
        <span className="relative">
          <input
            name="q"
            defaultValue={values.query}
            placeholder={labels.searchPlaceholder}
            className="pv-input pl-10"
          />
        </span>
      </label>

      <label className="grid gap-2 text-xs font-bold uppercase text-muted">
        {labels.category}
        <select name="tag" defaultValue={values.tag ?? ""} className="pv-input">
          <option value="">{labels.allCategories}</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-xs font-bold uppercase text-muted">
        {labels.sort}
        <select name="sort" defaultValue={values.sort ?? ""} className="pv-input">
          {status === "resolved" ? (
            <option value="">{labels.newestResolved}</option>
          ) : (
            <>
              <option value="">{labels.volume24h}</option>
              <option value="volume">{labels.volume}</option>
              <option value="liquidity">{labels.liquidity}</option>
              <option value="closing">{labels.closing}</option>
            </>
          )}
        </select>
      </label>

      <div className="flex gap-2">
        <button type="submit" className="pv-button pv-button-primary flex-1">
          <LuFilter className="size-4" />
          {labels.apply}
        </button>
        <Link
          href={status === "live" ? "/" : "/resolved"}
          aria-label={labels.clear}
          className="pv-button pv-button-secondary px-3"
        >
          <LuX className="size-4" />
        </Link>
      </div>
    </form>
  );
}
