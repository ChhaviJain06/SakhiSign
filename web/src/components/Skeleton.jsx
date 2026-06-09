// Skeleton loading primitives - keep the layout stable while data loads.

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Sign-card skeleton matching the Home grid card. */
export function SignCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-12 h-6 rounded-pill" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-24 rounded-pill" />
        <Skeleton className="h-4 w-20 rounded-pill" />
      </div>
      <Skeleton className="h-4 w-28 rounded-pill mt-2" />
    </div>
  );
}

/** A horizontal row skeleton (dashboard mastery list). */
export function RowSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-24 rounded-pill" />
        <Skeleton className="h-2 w-full rounded-pill" />
      </div>
      <Skeleton className="w-20 h-10 rounded-pill" />
    </div>
  );
}
