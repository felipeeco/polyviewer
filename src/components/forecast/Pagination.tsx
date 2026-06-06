import {LuArrowLeft, LuArrowRight} from "react-icons/lu";
import {Link} from "@/i18n/navigation";

type PaginationProps = {
  page: number;
  hasNextPage: boolean;
  pathname: "/" | "/resolved";
  searchParams: Record<string, string | undefined>;
  labels: {previous: string; next: string; page: string};
};

function pageHref(
  pathname: "/" | "/resolved",
  values: Record<string, string | undefined>,
  page: number
): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Pagination({
  page,
  hasNextPage,
  pathname,
  searchParams,
  labels
}: PaginationProps) {
  return (
    <nav className="mt-10 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link
          href={pageHref(pathname, searchParams, page - 1)}
          className="pv-button pv-button-secondary"
        >
          <LuArrowLeft className="size-4" />
          {labels.previous}
        </Link>
      ) : (
        <span />
      )}
      <span className="px-3 text-sm font-bold text-muted">
        {labels.page}
      </span>
      {hasNextPage ? (
        <Link
          href={pageHref(pathname, searchParams, page + 1)}
          className="pv-button pv-button-secondary"
        >
          {labels.next}
          <LuArrowRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
