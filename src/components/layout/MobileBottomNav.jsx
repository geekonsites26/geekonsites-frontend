import { Link, useLocation } from "react-router-dom"
import { Home, Wrench, CalendarCheck, Bell, User } from "lucide-react"

export default function MobileBottomNav() {
  const location = useLocation()

  const role = localStorage.getItem("gos_role") || ""

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

  const items = [
    {
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      label: "Services",
      icon: Wrench,
      path: "/services",
    },
    {
      label: "Bookings",
      icon: CalendarCheck,
      path: "/my-bookings",
    },
    {
      label: "Notify",
      icon: Bell,
      path: "/notifications",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ]

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/"
    }

    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-[9999]
        border-t
        border-cyan-500/20
        bg-[#071122]/95
        backdrop-blur-2xl
        lg:hidden
        pb-[max(env(safe-area-inset-bottom),10px)]
        pt-2
        shadow-[0_-10px_40px_rgba(0,0,0,0.45)]
      "
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all duration-300 ${
                active
                  ? "bg-cyan-400 text-black shadow-lg shadow-cyan-500/30"
                  : "text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300"
              }`}
            >
              <Icon
                size={20}
                className={active ? "scale-110" : ""}
              />

              <span className="mt-1 text-[10px] font-bold">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}