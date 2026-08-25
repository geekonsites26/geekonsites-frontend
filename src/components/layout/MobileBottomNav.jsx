import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Wrench, CalendarCheck, Bell, User, UserRound } from "lucide-react"
import { Capacitor } from "@capacitor/core"
import { getMyNotifications } from "../../services/notificationService"

export default function MobileBottomNav() {
  const location = useLocation()
  const [unread, setUnread] = useState(0)

  const role = localStorage.getItem("gos_role") || ""

  useEffect(() => {
    if (role !== "CUSTOMER" || !localStorage.getItem("gos_token")) return undefined
    let active = true
    const loadUnread = async () => {
      try {
        const items = await getMyNotifications()
        if (active) setUnread(Array.isArray(items) ? items.filter((item) => !item.isRead).length : 0)
      } catch {
        if (active) setUnread(0)
      }
    }
    const syncUnread = (event) => {
      if (typeof event.detail?.unread === "number") setUnread(event.detail.unread)
      else loadUnread()
    }
    loadUnread()
    const timer = window.setInterval(loadUnread, 30000)
    window.addEventListener("gos:notifications-updated", syncUnread)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener("gos:notifications-updated", syncUnread)
    }
  }, [role])

  const hiddenRoutes = [
    "/customer-login",
    "/customer-register",

    "/technician-login",
    "/technician-register",
    "/technician-verification",
    "/technician-dashboard",

    "/agent-login",
    "/agent-dashboard",

    "/admin-login",
    "/admin-dashboard",
  ]

  const hideNav =
    hiddenRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/track-technician") ||
    location.pathname.startsWith("/invoice")

  if (hideNav) return null

  if (
    role === "TECHNICIAN" ||
    role === "AGENT" ||
    role === "ADMIN"
  ) {
    return null
  }

  const authenticatedCustomer = role === "CUSTOMER" && Boolean(localStorage.getItem("gos_token"))
  const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
  const guestAndroidItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Services", icon: Wrench, path: "/services" },
    { label: "Book", icon: CalendarCheck, path: "/customer-login" },
    { label: "Account", icon: UserRound, path: "/portal" },
  ]
  const customerItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      label: authenticatedCustomer ? "Book" : "Services",
      icon: Wrench,
      path: authenticatedCustomer ? "/book-service" : "/services",
    },
    {
      label: "Bookings",
      icon: CalendarCheck,
      path: "/customer-dashboard?view=bookings",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ]
  const items = nativeAndroid && !authenticatedCustomer ? guestAndroidItems : customerItems

  const isActive = (path) => {
    if (path.startsWith("/customer-dashboard?view=bookings")) {
      return location.pathname === "/customer-dashboard" && new URLSearchParams(location.search).get("view") === "bookings"
    }

    if (path === "/") {
      return location.pathname === "/"
    }

    return location.pathname.startsWith(path)
  }

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="gos-mobile-bottom-nav
        fixed
        bottom-0
        left-0
        right-0
        z-[9999]
        border-t
        border-gos-border
        bg-white/95
        backdrop-blur-2xl
        lg:hidden
        pb-[max(env(safe-area-inset-bottom),10px)]
        pt-2
        shadow-[0_-8px_28px_rgba(11,39,66,0.10)]
      "
    >
      <div className={`mx-auto grid max-w-lg gap-1 px-2 ${items.length === 4 ? "grid-cols-4" : "grid-cols-5"}`}>
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-md px-0.5 py-2 transition-all duration-200 ${
                active
                  ? "bg-gos-blue text-white"
                  : "text-gos-muted hover:bg-gos-off-white hover:text-gos-turquoise"
              }`}
            >
              <span className="relative"><Icon size={20} />{item.label === "Notifications" && unread > 0 && <span className="absolute -right-2.5 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-extrabold leading-none text-white ring-2 ring-white">{unread > 99 ? "99+" : unread}</span>}</span>

              <span className="mt-1 max-w-full truncate text-[9px] font-bold sm:text-[10px]">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
