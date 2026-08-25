import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import BrandLogo from "../common/BrandLogo"

export default function AuthHeader({ className = "" }) {
  return (
    <header className={`gos-auth-header z-40 w-full border-b border-gos-border bg-white px-4 py-3 ${className}`} style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <Link to="/" className="inline-flex min-h-9 items-center gap-1.5 text-xs font-extrabold text-gos-blue transition hover:text-gos-turquoise" aria-label="Back to Home">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <Link to="/" aria-label="GeekOnSites home">
          <BrandLogo className="h-auto w-32 sm:w-40 lg:w-44" />
        </Link>
      </div>
    </header>
  )
}
