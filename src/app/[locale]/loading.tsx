export default function Loading() {
  return (
    <div className="pv-grid py-12">
      <div className="h-4 w-32 animate-pulse rounded bg-pv-red/30" />
      <div className="mt-4 h-14 max-w-xl animate-pulse rounded bg-white/10" />
      <div className="mt-8 h-28 animate-pulse rounded-panel bg-white/5" />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({length: 6}).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-card border border-white/10 bg-white/[0.035]"
          />
        ))}
      </div>
    </div>
  );
}
