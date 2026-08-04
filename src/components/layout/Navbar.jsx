import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { autoDetectUserLocation } from "../../services/locationService"
import logo from "../../assets/logo.png"

import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  MapPin,
  User,
  LogOut,
  Calendar,
  Laptop,
  Printer,
  Network,
  Headphones,
  Camera,
  Cpu,
  Building2,
  Users,
  Wrench,
  Shield,
  LayoutDashboard,
} from "lucide-react"

export default function Navbar() {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [activeTopDropdown, setActiveTopDropdown] = useState(null)
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem("gos_location") || "US"
  )

  const [profile, setProfile] = useState({
    loggedIn: false,
    name: "",
    role: "",
    dashboardPath: "/customer-login",
  })

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const location = await autoDetectUserLocation()

        if (location.countryCode === "US") {
          setSelectedLocation("US")
          localStorage.setItem("gos_location", "US")
          localStorage.removeItem("gos_unsupported_country")
          localStorage.removeItem("gos_detected_country")
          localStorage.removeItem("gos_detected_city")
        } else if (location.countryCode === "UK" || location.countryCode === "US") {
          setSelectedLocation("UK")
          localStorage.setItem("gos_location", "UK")
          localStorage.removeItem("gos_unsupported_country")
          localStorage.removeItem("gos_detected_country")
          localStorage.removeItem("gos_detected_city")
        } else {
          localStorage.setItem("gos_unsupported_country", "true")
          localStorage.setItem("gos_detected_country", location.countryCode)
          localStorage.setItem("gos_detected_city", location.city || "")

          const alreadyShown =
            sessionStorage.getItem("gos_country_modal") === "true"

          if (!alreadyShown) {
            sessionStorage.setItem("gos_country_modal", "true")
            setShowUnsupportedModal(true)
          }
        }
      } catch {
        console.log("Location permission denied")
      }
    }

    detectLocation()

    const handleScroll = () => setIsScrolled(window.scrollY > 20)

    const customerLoggedIn = localStorage.getItem("customerLoggedIn") === "true"
    const technicianLoggedIn =
      localStorage.getItem("technicianLoggedIn") === "true"
    const agentLoggedIn = localStorage.getItem("agentLoggedIn") === "true"

    if (customerLoggedIn) {
      setProfile({
        loggedIn: true,
        name: localStorage.getItem("customerName") || "Customer",
        role: "Customer",
        dashboardPath: "/customer-dashboard",
      })
    } else if (technicianLoggedIn) {
      setProfile({
        loggedIn: true,
        name: localStorage.getItem("technicianName") || "Technician",
        role: "Technician",
        dashboardPath: "/technician-dashboard",
      })
    } else if (agentLoggedIn) {
      setProfile({
        loggedIn: true,
        name: localStorage.getItem("agentName") || "Agent",
        role: "Agent",
        dashboardPath: "/agent-dashboard",
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

   const services = [
  { name: "All Services", icon: Laptop, path: "/services" },
  { name: "Remote IT Support", icon: Headphones, path: "/services" },
  { name: "Virus & Malware Removal", icon: Shield, path: "/book-service", serviceType: "Virus & Malware Removal" },
  { name: "Printer Setup", icon: Printer, path: "/book-service", serviceType: "Printer Setup & Configuration" },
  { name: "Wi-Fi Troubleshooting", icon: Network, path: "/book-service", serviceType: "Wi-Fi & Network Troubleshooting" },
  { name: "Business IT Support", icon: Building2, path: "/book-service", serviceType: "Business IT Support" },
]

  const portalOptions = [
    { name: "Customer Portal", icon: Users, path: "/customer-login" },
    { name: "Technician Portal", icon: Wrench, path: "/technician-login" },
  ]

  const agentOptions = [
    { name: "Agent Login", icon: Shield, path: "/agent-login" },
    { name: "Agent Dashboard", icon: LayoutDashboard, path: "/agent-dashboard" },
  ]

  const closeAll = () => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
    setActiveTopDropdown(null)
  }

  const logout = () => {
    localStorage.removeItem("customerLoggedIn")
    localStorage.removeItem("customerName")
    localStorage.removeItem("customerEmail")
    localStorage.removeItem("technicianLoggedIn")
    localStorage.removeItem("technicianName")
    localStorage.removeItem("technicianGosEmail")
    localStorage.removeItem("agentLoggedIn")
    localStorage.removeItem("agentName")
    localStorage.removeItem("agentEmail")

    closeAll()
    window.location.href = "/"
  }

  const changeLocation = (value) => {
  setSelectedLocation(value)

  localStorage.setItem("gos_location", value)

  if (value === "US") {
    localStorage.setItem("gos_country", "United States")
    localStorage.setItem("gos_currency", "USD")
    localStorage.setItem("gos_symbol", "$")
  } else {
    localStorage.setItem("gos_country", "United Kingdom")
    localStorage.setItem("gos_currency", "GBP")
    localStorage.setItem("gos_symbol", "£")
  }

  window.dispatchEvent(new Event("gos-location-changed"))
}

  const profileLetter = profile.name?.charAt(0)?.toUpperCase() || "U"

  const ProfileLink = ({ to, icon: Icon, label, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
    >
      <Icon size={18} />
      {label}
    </Link>
  )

  const DropdownMenu = ({ items, isOpen }) => {
    if (!isOpen) return null

    return (
      <div className="absolute left-0 top-full z-[99999] mt-2 w-72 overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
        <div className="py-2">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                to={item.path}
                state={
                  item.serviceType
                    ? { serviceType: item.serviceType }
                    : undefined
                }
                onClick={closeAll}
                className="group flex items-center gap-3 px-4 py-3 text-gray-300 transition hover:bg-gray-800/50 hover:text-white"
              >
                <Icon
                  size={18}
                  className="text-gray-500 group-hover:text-cyan-400"
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  const MobileLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={closeAll}
      className="block w-full rounded-xl px-4 py-3 text-gray-200 transition hover:bg-gray-800 hover:text-white"
    >
      {children}
    </Link>
  )

  return (
    <>
      {showUnsupportedModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#071122] p-6 text-white shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10">
              <MapPin className="h-8 w-8 text-cyan-300" />
            </div>

            <h2 className="text-center text-2xl font-black">
              Service Availability
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-400">
              GeekOnSites currently operates only in the United States and
              United Kingdom.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <p className="text-2xl">🇺🇸</p>
                <p className="mt-2 text-sm font-bold text-cyan-300">
                  United States
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <p className="text-2xl">🇬🇧</p>
                <p className="mt-2 text-sm font-bold text-cyan-300">
                  United Kingdom
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              You may continue browsing, but bookings are available only in
              supported regions.
            </p>

            <button
              onClick={() => setShowUnsupportedModal(false)}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 py-3.5 text-sm font-black text-black"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {activeTopDropdown === "profile" && (
        <div className="fixed right-4 top-[78px] z-[999998] w-72 rounded-2xl border border-gray-700/60 bg-[#0f172a] p-3 shadow-2xl lg:right-10 lg:top-[152px]">
          {profile.loggedIn ? (
            <>
              <div className="mb-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-lg font-black text-black">
                    {profileLetter}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {profile.name}
                    </p>
                    <p className="text-xs font-semibold text-cyan-300">
                      {profile.role}
                    </p>
                  </div>
                </div>
              </div>

              <ProfileLink
                to="/profile"
                icon={User}
                label="My Profile"
                onClick={closeAll}
              />

              {profile.role === "Customer" && (
                <>
                  <ProfileLink
                    to="/my-bookings"
                    icon={Calendar}
                    label="My Bookings"
                    onClick={closeAll}
                  />
                  <ProfileLink
                    to="/notifications"
                    icon={Bell}
                    label="Notifications"
                    onClick={closeAll}
                  />
                </>
              )}

              {profile.role === "Technician" && (
                <>
                  <ProfileLink
                    to="/technician-dashboard"
                    icon={Wrench}
                    label="Assigned Jobs"
                    onClick={closeAll}
                  />
                  <ProfileLink
                    to="/technician-dashboard"
                    icon={MapPin}
                    label="Availability"
                    onClick={closeAll}
                  />
                </>
              )}

              {profile.role === "Agent" && (
                <>
                  <ProfileLink
                    to="/agent-dashboard"
                    icon={Users}
                    label="Assigned Customers"
                    onClick={closeAll}
                  />
                  <ProfileLink
                    to="/agent-dashboard"
                    icon={Laptop}
                    label="Live Bookings"
                    onClick={closeAll}
                  />
                </>
              )}

              <ProfileLink
                to={profile.dashboardPath}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={closeAll}
              />

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-300 hover:bg-red-500/10"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <ProfileLink
                to="/customer-login"
                icon={Shield}
                label="Login"
                onClick={closeAll}
              />
              <ProfileLink
                to="/customer-register"
                icon={User}
                label="Register"
                onClick={closeAll}
              />
            </>
          )}
        </div>
      )}

      <div className="fixed left-0 right-0 top-0 z-50">
        <div className="border-b border-gray-800/50 bg-gray-950/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between gap-3">
              <Link
                to="/"
                onClick={closeAll}
                className="flex min-w-0 items-center gap-2"
              >
                <img
                  src={logo}
                  alt="GOS Logo"
                  className="h-10 w-auto object-contain sm:h-14"
                />

                <div className="min-w-0">
                  
                </div>
              </Link>

              <div className="hidden items-center gap-2 sm:flex">
                <MapPin size={14} className="text-cyan-400" />

                <select
                  value={selectedLocation}
                  onChange={(e) => changeLocation(e.target.value)}
                  className="w-[44px] bg-transparent text-xs text-gray-300 focus:outline-none"
                >
                  <option value="US" className="bg-gray-900">
                    US
                  </option>
                  <option value="UK" className="bg-gray-900">
                    UK
                  </option>
                </select>
              </div>

              <div className="hidden max-w-xl flex-1 lg:mx-10 lg:flex">
                <div className="relative w-full">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    placeholder="Search laptop repair, printer setup..."
                    className="w-full rounded-2xl border border-gray-700/50 bg-gray-800/50 py-3 pl-12 pr-4 text-sm text-gray-300 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
  type="button"
  onClick={() => navigate("/notifications")}
  className="relative p-2 text-gray-400 hover:text-white"
>
  <Bell size={21} />
  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan-500" />
</button>

                <Link
                  to="/book-service"
                  className="hidden items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-medium text-white md:flex"
                >
                  <Calendar size={18} />
                  <span>Book a Service</span>
                </Link>

                <button
                  onClick={() =>
                    setActiveTopDropdown(
                      activeTopDropdown === "profile" ? null : "profile"
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300"
                >
                  {profile.loggedIn ? (
                    <span className="text-base font-black text-cyan-300">
                      {profileLetter}
                    </span>
                  ) : (
                    <User size={18} />
                  )}
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-300 hover:text-white lg:hidden"
                >
                  {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`relative z-10 hidden border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-xl lg:block ${
            isScrolled ? "shadow-2xl shadow-black/50" : ""
          }`}
        >
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-16 items-center justify-center">
              <nav className="flex items-center gap-3">
                <Link
                  to="/"
                  className="rounded-xl px-4 py-2.5 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                >
                  Home
                </Link>

              <div
  className="relative"
  onMouseEnter={() => setActiveDropdown("services")}
  onMouseLeave={() => setActiveDropdown(null)}
>
  <Link
    to="/services"
    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-gray-300 hover:bg-gray-800/50 hover:text-white"
  >
    Services
    <ChevronDown size={16} />
  </Link>

  <DropdownMenu
    items={services}
    isOpen={activeDropdown === "services"}
  />
</div>

                <Link
                  to="/about"
                  className="rounded-xl px-4 py-2.5 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                >
                  About Us
                </Link>

                <Link
                  to="/contact"
                  className="rounded-xl px-4 py-2.5 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                >
                  Contact
                </Link>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "portal" ? null : "portal"
                      )
                    }
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  >
                    Portal
                    <ChevronDown size={16} />
                  </button>

                  <DropdownMenu
                    items={portalOptions}
                    isOpen={activeDropdown === "portal"}
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "agent" ? null : "agent"
                      )
                    }
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  >
                    Agent
                    <ChevronDown size={16} />
                  </button>

                  <DropdownMenu
                    items={agentOptions}
                    isOpen={activeDropdown === "agent"}
                  />
                </div>
              </nav>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-b border-gray-800 bg-gray-950/98 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="max-h-[calc(100vh-80px)] space-y-2 overflow-y-auto px-4 py-5">
              <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                <p className="mb-3 text-xs uppercase tracking-widest text-cyan-400">
                  Location
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {["US", "UK"].map((item) => (
                    <button
                      key={item}
                      onClick={() => changeLocation(item)}
                      className={`rounded-xl py-2 text-sm font-bold ${
                        selectedLocation === item
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <MobileLink to="/">Home</MobileLink>
              <MobileLink to="/about">About Us</MobileLink>
              <MobileLink to="/contact">Contact</MobileLink>
              <MobileLink to="/book-service">Book Service</MobileLink>

              <div className="pt-3">
                <p className="mb-2 px-4 text-xs uppercase tracking-widest text-cyan-400">
  Services
</p>

<MobileLink to="/services">
  All Services
</MobileLink>

{services.map((item) => (
  <MobileLink key={item.name} to={item.path}>
    {item.name}
  </MobileLink>
))}
              </div>

              <div className="pt-3">
                <p className="mb-2 px-4 text-xs uppercase tracking-widest text-cyan-400">
                  Portal
                </p>

                <MobileLink to="/customer-login">Customer Portal</MobileLink>
                <MobileLink to="/technician-login">Technician Portal</MobileLink>
              </div>

              <div className="pt-3">
                <p className="mb-2 px-4 text-xs uppercase tracking-widest text-cyan-400">
                  Agent
                </p>

                <MobileLink to="/agent-login">Agent Login</MobileLink>
                <MobileLink to="/agent-dashboard">Agent Dashboard</MobileLink>
              </div>

              <div className="pt-3">
                <p className="mb-2 px-4 text-xs uppercase tracking-widest text-cyan-400">
                  My Account
                </p>

                {profile.loggedIn ? (
                  <>
                    <MobileLink to={profile.dashboardPath}>
                      {profile.role} Dashboard
                    </MobileLink>

                    <button
                      onClick={logout}
                      className="block w-full rounded-xl px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileLink to="/customer-login">Login</MobileLink>
                    <MobileLink to="/customer-register">Register</MobileLink>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}