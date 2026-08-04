import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import { loginUser } from "../services/authService"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  Wrench,
  CalendarCheck,
  Loader2,
  XCircle,
} from "lucide-react"

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e) => {
  e.preventDefault()

  setError("")
  setSuccess(false)

  if (!email.trim() || !password.trim()) {
    setError("Please enter admin email and password.")
    return
  }

  try {
    setLoading(true)

    const result = await loginUser(email, password)

    const role = (
      result?.role ||
      result?.user?.role ||
      ""
    ).toUpperCase()

    if (role !== "ADMIN") {
      throw new Error("This account is not an Admin account.")
    }

    setSuccess(true)

    localStorage.setItem("gos_role", role)
     localStorage.setItem("gos_user_id", result.id || result.userId)

        setTimeout(() => {
         window.location.href = "/admin-dashboard"
  }, 700)
  } catch (error) {
    setError(error.message || "Invalid admin credentials")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">
      <div className="absolute top-20 left-5 md:left-20 w-72 h-72 bg-cyan-500/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-10 right-5 md:right-20 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full" />

      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 w-11 h-11 md:w-auto md:px-4 md:py-3 rounded-2xl bg-[#071122]/90 border border-cyan-500/20 flex items-center justify-center gap-2 text-cyan-300 hover:bg-cyan-500/10 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:block text-sm font-semibold">
          Back to Website
        </span>
      </button>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-10 min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-center">
        <section className="hidden lg:block">
          <div className="rounded-[38px] bg-[#071122]/90 border border-cyan-500/20 p-9 xl:p-11 shadow-2xl overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-cyan-300 text-sm font-semibold">
                <ShieldCheck className="w-5 h-5" />
                Internal Admin Access
              </div>

              <h1 className="mt-8 text-5xl xl:text-6xl font-black leading-tight">
                GeekOnSites
                <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text">
                  Control Center
                </span>
              </h1>

              <p className="mt-6 text-cyan-100/60 text-lg leading-relaxed max-w-2xl">
                Separate internal admin portal for approving technicians,
                managing agents, monitoring bookings, and controlling service
                operations across US & UK.
              </p>

              <div className="mt-9 rounded-[32px] bg-[#020817] border border-white/10 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(34,211,238,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.18)_1px,transparent_1px)] bg-[size:36px_36px]" />

                <div className="relative grid grid-cols-2 gap-5">
                  <FeatureCard icon={Wrench} title="Technicians" value="Approval Flow" />
                  <FeatureCard icon={Users} title="Agents" value="Operations" />
                  <FeatureCard icon={CalendarCheck} title="Bookings" value="Live Tracking" />
                  <FeatureCard icon={Bell} title="Alerts" value="Admin Only" />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-4">
                <StatCard title="Access" value="Private" />
                <StatCard title="Region" value="US/UK" />
                <StatCard title="Role" value="Admin" />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="lg:hidden mb-8 text-center">
            <img
              src={logo}
              alt="GeekOnSites Logo"
              className="mx-auto h-20 w-auto object-contain"
            />

            <h1 className="mt-4 text-3xl font-black">GeekOnSites</h1>
            <p className="text-cyan-300 mt-1">Admin Control Center</p>
          </div>

          <div className="rounded-[32px] md:rounded-[38px] bg-[#071122]/95 border border-cyan-500/20 p-5 sm:p-7 md:p-9 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-cyan-300">
                  ADMIN PORTAL
                </p>
                <h2 className="mt-3 text-3xl md:text-4xl font-black">
                  Sign in securely
                </h2>
                <p className="mt-2 text-cyan-100/50 text-sm md:text-base">
                  Authorized GeekOnSites administrators only.
                </p>
              </div>

              <img
                src={logo}
                alt="GeekOnSites Logo"
                className="hidden sm:block h-14 w-auto object-contain"
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <SmallInfo label="Access" value="Secure" />
              <SmallInfo label="API" value="Internal" />
              <SmallInfo label="Role" value="Admin" />
            </div>

            {error && (
              <div className="mt-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex gap-3 text-red-300">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-2xl bg-green-500/10 border border-green-500/20 p-4 flex gap-3 text-green-300">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                  Admin verified. Opening internal dashboard...
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-7 space-y-5">
              <div>
                <label className="text-sm text-cyan-100/70">
                  Admin Email
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />

                  <input
                    type="email"
                    placeholder="admin@gos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0b1628] border border-white/10 focus:border-cyan-400/60 rounded-2xl pl-12 pr-4 py-4 text-white outline-none placeholder:text-cyan-100/25"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-cyan-100/70">
                  Password
                </label>

                <div className="relative mt-2">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0b1628] border border-white/10 focus:border-cyan-400/60 rounded-2xl pl-12 pr-12 py-4 text-white outline-none placeholder:text-cyan-100/25"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-70 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Admin...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Access Approved
                  </>
                ) : (
                  <>
                    Open Admin Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
              <p className="text-sm text-cyan-100/60 leading-relaxed">
                Private internal access. This admin panel is separate from the
                public website and should later use backend JWT role-based auth.
              </p>
            </div>

            <p className="text-center text-cyan-100/35 mt-7 text-xs leading-6">
              Access monitored. Unauthorized attempts are restricted.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-3xl bg-[#071122]/90 border border-white/10 p-5">
      <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-cyan-300" />
      </div>
      <p className="mt-4 text-cyan-100/45 text-sm">{title}</p>
      <h3 className="mt-1 font-bold">{value}</h3>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-[#0b1628] border border-white/10 p-4">
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="text-xs text-cyan-100/40 mt-1">{title}</p>
    </div>
  )
}

function SmallInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#0b1628] border border-white/10 p-3 text-center">
      <p className="text-[11px] text-cyan-100/35">{label}</p>
      <h3 className="text-sm font-bold mt-1">{value}</h3>
    </div>
  )
}