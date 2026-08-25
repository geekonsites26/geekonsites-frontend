import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Capacitor } from "@capacitor/core"
import {
  Bell,
  CalendarCheck,
  CreditCard,
  MapPinned,
  Navigation,
  UserRound,
  Video,
  Wrench,
  X,
} from "lucide-react"
import BrandLogo from "../components/common/BrandLogo"

// Native Android only: this is the "Choose your portal" screen a logged-out
// user reaches from the guest bottom nav's Account tab. On the desktop
// website nothing links here, but guard it anyway so a stray deep link never
// shows Android-only structural UI on the browser site.
export default function PortalChooser() {
  const navigate = useNavigate()
  const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

  useEffect(() => {
    if (!nativeAndroid) navigate("/", { replace: true })
  }, [nativeAndroid, navigate])

  if (!nativeAndroid) return null

  return (
    <main className="gos-portal-chooser min-h-[100dvh] overflow-x-hidden bg-[#f4f7f9] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-gos-charcoal">
      <header className="flex items-center justify-between px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))]">
        <BrandLogo className="h-auto w-32" />
        <button type="button" onClick={() => navigate("/")} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gos-blue-deep shadow-sm" aria-label="Close"><X size={17} /></button>
      </header>

      <div className="px-4 pb-2 pt-3">
        <h1 className="text-[26px] font-black leading-tight tracking-[-.02em] text-gos-blue-deep">Choose your portal</h1>
        <p className="mt-1.5 text-sm font-semibold leading-5 text-gos-muted">Select how you'd like to use GeekOnSites.</p>
      </div>

      <div className="space-y-4 px-4 py-3">
        <PortalCard
          image="/images/support/remote-support.webp?v=1"
          eyebrow="Customer portal"
          title="Customer"
          description="Book and manage tech support"
          capabilities={["Book Remote or On-site Support", "Track Bookings", "Invoices & Service Records", "Remote Support Sessions"]}
          icons={[CalendarCheck, MapPinned, CreditCard, Video]}
          primaryLabel="Sign in as Customer"
          onPrimary={() => navigate("/customer-login")}
          secondaryLabel="Create Customer Account"
          onSecondary={() => navigate("/customer-register")}
        />

        <PortalCard
          image="/images/support/onsite-support.webp?v=1"
          eyebrow="Technician portal"
          title="Technician"
          description="Manage assigned service jobs"
          capabilities={["Assigned Jobs", "On-site Job Updates", "Live Location Sharing", "Remote Support Sessions"]}
          icons={[Wrench, Navigation, MapPinned, Video]}
          primaryLabel="Technician Sign In"
          onPrimary={() => navigate("/technician-login")}
          secondaryLabel="Technician Registration"
          onSecondary={() => navigate("/technician-register")}
        />
      </div>

      <div className="flex items-center gap-2 px-4 pt-1 pb-4 text-[11px] font-semibold text-gos-muted">
        <Bell size={13} className="shrink-0 text-gos-turquoise" />
        <span>You can switch portals anytime by signing out from your profile.</span>
      </div>
    </main>
  )
}

function PortalCard({ image, eyebrow, title, description, capabilities, icons, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-gos-border bg-white shadow-[0_8px_22px_rgba(8,43,91,.08)]">
      <div className="relative h-28 w-full">
        <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03101d]/85 via-[#03101d]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gos-blue-deep"><UserRound size={17} /></span>
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7ce5dc]">{eyebrow}</p>
            <p className="truncate text-lg font-black leading-tight text-white">{title}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm font-extrabold text-gos-blue-deep">{description}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {capabilities.map((item, index) => {
            const Icon = icons[index]
            return <span key={item} className="flex items-center gap-1.5 text-[10px] font-semibold text-gos-muted"><Icon size={12} className="shrink-0 text-gos-turquoise" />{item}</span>
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onPrimary} className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-gos-blue-deep px-3 text-xs font-extrabold text-white">{primaryLabel}</button>
          <button type="button" onClick={onSecondary} className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-gos-border bg-white px-3 text-xs font-extrabold text-gos-blue-deep">{secondaryLabel}</button>
        </div>
      </div>
    </section>
  )
}
