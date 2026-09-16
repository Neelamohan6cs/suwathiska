export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-dairy-100" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-dairy-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-dairy-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-dairy-100" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return <div className="h-14 w-full animate-pulse rounded-lg bg-dairy-50" />;
}
