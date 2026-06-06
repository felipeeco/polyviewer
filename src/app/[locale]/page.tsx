import {setRequestLocale} from "next-intl/server";
import {ForecastListing} from "@/components/forecast/ForecastListing";

type PageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LiveForecastsPage({
  params,
  searchParams
}: PageProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <ForecastListing status="live" searchParams={searchParams} />;
}
