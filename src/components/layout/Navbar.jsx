import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Bell, Calendar, ChevronDown, LayoutDashboard, LogOut, MapPin, Menu, Shield, User, Users, Wrench, X } from "lucide-react"
import Container from "./Container"
import Button from "../ui/Button"
import { setLocation as saveLocation } from "../../utils/location"
import { useCustomerAuth } from "../../context/CustomerAuthContext"
import BrandLogo from "../common/BrandLogo"

const mainLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
]

const ROLE_DASHBOARDS = {
  CUSTOMER: { label: "Customer", path: "/customer-dashboard" },
  TECHNICIAN: { label: "Technician", path: "/technician-dashboard" },
  AGENT: { label: "Agent", path: "/agent-dashboard" },
  ADMIN: { label: "Admin", path: "/admin-dashboard" },
}

export default function Navbar() {
  const { customer, isAuthenticated, logoutCustomer } = useCustomerAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem("gos_location") || "US")
  const [profile, setProfile] = useState({ loggedIn: false, name: "", role: "", dashboardPath: "/customer-login" })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    const syncRegion = () => setSelectedLocation(localStorage.getItem("gos_location") || "US")
    window.addEventListener("gos-location-changed", syncRegion)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("gos-location-changed", syncRegion)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem("gos_unsupported_country") !== "true") return
    if (sessionStorage.getItem("gos_country_modal") === "true") return
    sessionStorage.setItem("gos_country_modal", "true")
    setShowUnsupportedModal(true)
  }, [selectedLocation])

  useEffect(() => {
    if (!isAuthenticated || !customer) {
      setProfile({ loggedIn: false, name: "", role: "", dashboardPath: "/customer-login" })
      return
    }
    const name = customer.fullName || customer.name || customer.username || [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email?.split("@")[0] || "Account"
    const roleKey = String(customer.role || "CUSTOMER").toUpperCase()
    const roleConfig = ROLE_DASHBOARDS[roleKey] || ROLE_DASHBOARDS.CUSTOMER
    setProfile({ loggedIn: true, name, role: roleConfig.label, dashboardPath: roleConfig.path })
  }, [customer, isAuthenticated])

  const closeMenus = () => { setMobileOpen(false); setProfileOpen(false); setPortalOpen(false) }
  const changeLocation = (value) => {
    setSelectedLocation(value)
    saveLocation(value)
  }
  const logout = () => {
    logoutCustomer()
    ;["customerLoggedIn","customerName","customerEmail","technicianLoggedIn","technicianName","technicianGosEmail","agentLoggedIn","agentName","agentEmail"].forEach((key) => localStorage.removeItem(key))
    window.location.href = "/"
  }
  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
  const notificationPath = profile.role === "Technician"
    ? "/technician-dashboard?view=notifications"
    : profile.role === "Agent"
      ? "/agent-dashboard?view=notifications"
      : "/notifications"

  return (
    <>
      {showUnsupportedModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gos-blue-deep/75 p-4" role="dialog" aria-modal="true" aria-labelledby="availability-title">
          <div className="w-full max-w-md rounded-lg bg-white p-7 shadow-[var(--gos-shadow-md)]">
            <MapPin className="text-gos-turquoise" size={28} />
            <h2 id="availability-title" className="mt-5 text-2xl font-bold text-gos-blue-deep">Service availability</h2>
            <p className="mt-3 text-sm leading-6 text-gos-muted">GeekOnSites currently operates in the United States and United Kingdom. You may continue browsing from another region.</p>
            <Button onClick={() => setShowUnsupportedModal(false)} className="mt-7 w-full">Continue browsing</Button>
          </div>
        </div>
      )}

      <motion.header style={{ paddingTop: "env(safe-area-inset-top)" }} animate={{ boxShadow: scrolled ? "0 12px 30px rgba(3,13,29,0.12)" : "0 2px 0 rgba(3,13,29,0.03)" }} transition={{ duration: 0.25 }} className={`fixed inset-x-0 top-0 z-50 border-b bg-white text-gos-blue-deep transition duration-300 ${scrolled ? "border-gos-border bg-white/95 backdrop-blur-xl" : "border-gos-border"}`}>
        <Container>
          <div className="flex h-14 items-center justify-between gap-2.5 sm:h-16 sm:gap-3">
            <Link to="/" onClick={closeMenus} aria-label="GeekOnSites home" className="flex min-w-0 shrink items-center">
              <BrandLogo className="h-10 w-auto sm:h-11" />
            </Link>

            <nav className="hidden h-full items-center gap-1 lg:flex" aria-label="Primary navigation">
              {mainLinks.map((item) => <Link key={item.path} to={item.path} className={`group relative flex h-full items-center px-3 text-[11px] font-extrabold uppercase tracking-[0.1em] transition xl:px-4 ${isActive(item.path) ? "text-gos-blue-deep" : "text-gos-muted hover:text-gos-blue"}`}>{item.label}<span className="absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 bg-gos-turquoise transition-transform duration-200 group-hover:scale-x-100 xl:inset-x-4" />{isActive(item.path) && <motion.span layoutId="nav-active" className="absolute inset-x-3 bottom-0 h-0.5 bg-gos-turquoise xl:inset-x-4" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}</Link>)}
            </nav>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <label className="hidden h-9 items-center gap-1.5 border-x border-gos-border px-2 sm:flex">
                <MapPin size={15} className="text-gos-turquoise" /><span className="sr-only">Service country</span>
                <select value={selectedLocation} onChange={(event) => changeLocation(event.target.value)} className="bg-white text-xs font-bold text-gos-blue outline-none"><option value="US">US</option><option value="UK">UK</option></select>
              </label>
              <button type="button" onClick={() => navigate(notificationPath)} className="hidden h-9 w-9 items-center justify-center text-gos-blue transition hover:bg-gos-off-white hover:text-gos-turquoise sm:flex" aria-label="Notifications"><Bell size={17} /></button>
              <div className="relative hidden lg:block">
                <button type="button" onClick={() => { setPortalOpen(!portalOpen); setProfileOpen(false) }} className="flex min-h-9 items-center gap-1 px-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-gos-blue hover:text-gos-turquoise xl:px-3">Portals <ChevronDown size={13} /></button>
                {portalOpen && <div className="absolute right-0 top-full mt-3 w-56 rounded-md border border-gos-border bg-white p-2 shadow-[var(--gos-shadow-md)]"><MenuLink to="/customer-login" icon={Users} onClick={closeMenus}>Customer portal</MenuLink><MenuLink to="/technician-login" icon={Wrench} onClick={closeMenus}>Technician portal</MenuLink><MenuLink to="/agent-login" icon={Shield} onClick={closeMenus}>Agent login</MenuLink></div>}
              </div>
              <div className="relative">
                <button type="button" onClick={() => { setProfileOpen(!profileOpen); setPortalOpen(false) }} className="flex h-9 w-9 items-center justify-center rounded-md border border-gos-border bg-gos-off-white text-gos-blue transition hover:border-gos-turquoise hover:bg-white" aria-label="Account menu">{profile.loggedIn ? <span className="text-xs font-extrabold">{profile.name.charAt(0).toUpperCase()}</span> : <User size={16} />}</button>
                {profileOpen && <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-gos-border bg-white p-1.5 shadow-[var(--gos-shadow-md)] sm:w-48">{profile.loggedIn ? <><div className="border-b border-gos-border px-2.5 py-2"><p className="truncate text-xs font-extrabold text-gos-blue-deep">{profile.name}</p><p className="mt-0.5 text-[10px] font-semibold text-gos-muted">{profile.role}</p></div><MenuLink to={profile.dashboardPath} icon={LayoutDashboard} onClick={closeMenus}>Dashboard</MenuLink><MenuLink to="/profile" icon={User} onClick={closeMenus}>Profile</MenuLink>{profile.role === "Customer" && <MenuLink to="/customer-dashboard?view=bookings" icon={Calendar} onClick={closeMenus}>My bookings</MenuLink>}<button onClick={logout} className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><LogOut size={15} /> Log out</button></> : <><p className="px-2.5 pb-1 pt-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-gos-muted">Account</p><MenuLink to="/customer-login" icon={Shield} onClick={closeMenus}>Log in</MenuLink><MenuLink to="/customer-register" icon={User} onClick={closeMenus}>Register</MenuLink></>}</div>}
              </div>
              <div className="hidden md:block"><Button to="/book-service" className="min-h-9 px-3.5 py-1.5 text-[11px]">Book a Service</Button></div>
              <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="flex h-9 w-9 items-center justify-center rounded-md text-gos-blue transition hover:bg-gos-off-white lg:hidden" aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
            </div>
          </div>
        </Container>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.24 }} className="max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-y-auto border-t border-gos-border bg-white lg:hidden">
              <Container className="pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-gos-border bg-gos-off-white px-3 py-2 sm:hidden">
                  <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-gos-blue-deep"><MapPin size={14} className="text-gos-turquoise" /> Service region</span>
                  <div className="flex shrink-0 overflow-hidden rounded-md border border-gos-border bg-white" role="group" aria-label="Service country">
                    {["US", "UK"].map((region) => (
                      <button key={region} type="button" onClick={() => changeLocation(region)} aria-pressed={selectedLocation === region} title={region === "US" ? "United States" : "United Kingdom"} className={`flex h-8 min-w-11 items-center justify-center px-2 text-[10px] font-extrabold transition ${selectedLocation === region ? "bg-gos-blue-deep text-white" : "text-gos-blue hover:bg-white"}`}>
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.nav initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.035 } } }} aria-label="Mobile navigation">
                  <div className="overflow-hidden rounded-md border border-gos-border bg-white">
                    {mainLinks.map((item) => (
                      <motion.div key={item.path} variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }} className="border-b border-gos-border last:border-b-0">
                        <Link to={item.path} onClick={closeMenus} className={`flex min-h-11 items-center justify-between px-3 py-2 text-[13px] font-extrabold ${isActive(item.path) ? "bg-[#eef8f7] text-gos-blue-deep" : "text-gos-blue-deep"}`}>
                          <span>{item.label}</span>{isActive(item.path) && <span className="h-2 w-2 rounded-full bg-gos-turquoise" />}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {profile.loggedIn ? <>
                    <p className="mb-2 mt-4 text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-muted">Your account</p>
                    <div className="overflow-hidden rounded-md border border-gos-border bg-white">
                      <Link to={profile.dashboardPath} onClick={closeMenus} className="flex min-h-10 items-center gap-2 border-b border-gos-border px-3 text-xs font-extrabold text-gos-blue-deep"><LayoutDashboard size={15} className="text-gos-turquoise" /> Dashboard</Link>
                      <Link to="/profile" onClick={closeMenus} className="flex min-h-10 items-center gap-2 border-b border-gos-border px-3 text-xs font-extrabold text-gos-blue-deep"><User size={15} className="text-gos-turquoise" /> Profile</Link>
                      <button type="button" onClick={logout} className="flex min-h-10 w-full items-center gap-2 px-3 text-xs font-extrabold text-red-700"><LogOut size={15} /> Log out</button>
                    </div>
                  </> : <>
                    <p className="mb-2 mt-4 text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-muted">Portals</p>
                    <div className="grid grid-cols-3 overflow-hidden rounded-md border border-gos-border bg-white">
                      <Link to="/customer-login" onClick={closeMenus} className="flex min-h-11 items-center justify-center border-r border-gos-border px-2 text-center text-[10px] font-extrabold text-gos-blue">Customer</Link>
                      <Link to="/technician-login" onClick={closeMenus} className="flex min-h-11 items-center justify-center border-r border-gos-border px-2 text-center text-[10px] font-extrabold text-gos-blue">Technician</Link>
                      <Link to="/agent-login" onClick={closeMenus} className="flex min-h-11 items-center justify-center px-2 text-center text-[10px] font-extrabold text-gos-blue">Agent</Link>
                    </div>
                  </>}

                  <Button to="/book-service" onClick={closeMenus} className="mt-4 min-h-11 w-full py-2.5 text-xs">Book a Service</Button>
                </motion.nav>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}

function MenuLink({ to, icon: Icon, onClick, children }) {
  return <Link to={to} onClick={onClick} className="flex min-h-9 items-center gap-2 rounded-md px-2.5 py-2 text-xs font-bold text-gos-charcoal hover:bg-gos-off-white hover:text-gos-blue"><Icon size={15} className="shrink-0 text-gos-turquoise" />{children}</Link>
}
