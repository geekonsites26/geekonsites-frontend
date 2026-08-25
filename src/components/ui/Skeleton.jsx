// Shared branded loading primitives. Replaces plain "Loading..." text states
// with a subtle shimmer that mirrors the shape of the content being fetched,
// so the screen never looks empty/broken while data loads on Android.

export function SkeletonBlock({ className = "" }) {
  return <span className={`gos-skeleton block rounded-md ${className}`} />
}

export function SkeletonCircle({ className = "" }) {
  return <span className={`gos-skeleton block rounded-full ${className}`} />
}

// A single card shaped like a booking / job row: avatar, two text lines, a pill.
export function SkeletonRow({ className = "", dark = false }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${dark ? "border-white/10 bg-[#071122]" : "border-gos-border bg-white"} ${className}`}>
      <SkeletonCircle className={`h-11 w-11 shrink-0 ${dark ? "gos-skeleton--dark" : ""}`} />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className={`h-3 w-2/5 ${dark ? "gos-skeleton--dark" : ""}`} />
        <SkeletonBlock className={`h-2.5 w-3/5 ${dark ? "gos-skeleton--dark" : ""}`} />
      </div>
      <SkeletonBlock className={`h-6 w-16 shrink-0 rounded-full ${dark ? "gos-skeleton--dark" : ""}`} />
    </div>
  )
}

// Branded splash-style card used for full-page loads (dashboard, invoice, session).
export function SkeletonBrandCard({ title = "Loading", text = "", dark = false, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-sm rounded-2xl border p-6 text-center shadow-sm ${dark ? "border-white/10 bg-[#071122]" : "border-gos-border bg-white"} ${className}`}>
      <div className={`mx-auto h-1.5 w-40 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-gos-border"}`}>
        <span className={`block h-full w-1/2 animate-pulse rounded-full ${dark ? "bg-cyan-400" : "bg-gos-turquoise"}`} />
      </div>
      <p className={`mt-4 text-sm font-extrabold ${dark ? "text-white" : "text-gos-blue-deep"}`}>{title}</p>
      {text && <p className={`mt-1 text-xs font-semibold ${dark ? "text-cyan-100/60" : "text-gos-muted"}`}>{text}</p>}
    </div>
  )
}

// A vertical list of skeleton rows, for bookings / notifications / job lists.
export function SkeletonList({ count = 4, dark = false, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: count }).map((_, index) => <SkeletonRow key={index} dark={dark} />)}
    </div>
  )
}

// Compact stat-tile row skeleton (dashboard summary cards).
export function SkeletonStats({ count = 3, className = "" }) {
  return (
    <div className={`grid overflow-hidden rounded-2xl border border-gos-border bg-white ${className}`} style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`space-y-2 p-4 ${index ? "border-l border-gos-border" : ""}`}>
          <SkeletonBlock className="h-5 w-8" />
          <SkeletonBlock className="h-2.5 w-3/4" />
        </div>
      ))}
    </div>
  )
}

// Receipt-shaped skeleton for the invoice screen.
export function SkeletonInvoice({ dark = true, className = "" }) {
  const line = dark ? "bg-white/10" : "bg-gos-border"
  return (
    <div className={`rounded-2xl border p-5 ${dark ? "border-white/10 bg-[#071122]" : "border-gos-border bg-white"} ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <SkeletonBlock className={`h-9 w-28 ${line}`} />
        <SkeletonBlock className={`h-6 w-20 rounded-full ${line}`} />
      </div>
      <div className="mt-4 space-y-2.5">
        <SkeletonBlock className={`h-3 w-1/3 ${line}`} />
        <SkeletonBlock className={`h-3 w-1/2 ${line}`} />
        <SkeletonBlock className={`h-3 w-2/5 ${line}`} />
      </div>
      <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
        {[1, 2, 3].map((row) => (
          <div key={row} className="flex items-center justify-between gap-3">
            <SkeletonBlock className={`h-2.5 w-2/5 ${line}`} />
            <SkeletonBlock className={`h-2.5 w-14 ${line}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Map/session-shaped skeleton for live tracking and the remote session screen.
export function SkeletonMapPanel({ className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gos-border bg-white ${className}`}>
      <SkeletonBlock className="h-44 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <SkeletonBlock className="h-3 w-2/5" />
        <SkeletonBlock className="h-2.5 w-3/5" />
      </div>
    </div>
  )
}
