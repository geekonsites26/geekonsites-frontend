import BrandLogo from "../common/BrandLogo"

export default function DashboardLoader({ technician = false }) {
  const label = technician
    ? "Loading your technician dashboard..."
    : "Loading your dashboard..."

  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center overflow-hidden bg-[#f6f8fa] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))] text-gos-blue-deep"
    >
      <div className="w-full max-w-xs text-center">
        <BrandLogo className="mx-auto h-auto w-40 max-w-[70vw]" />
        <span className="mx-auto mt-6 block h-8 w-8 animate-spin rounded-full border-[3px] border-gos-border border-t-gos-turquoise" aria-hidden="true" />
        <p className="mt-4 text-sm font-extrabold">{label}</p>
      </div>
    </main>
  )
}
