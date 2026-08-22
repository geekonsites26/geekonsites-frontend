import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { loginUser } from "../services/authService"
import AuthHeader from "../components/auth/AuthHeader"
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  Laptop,
  Loader2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  Wrench,
  XCircle,
} from "lucide-react"

export default function TechnicianLogin() {
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
    setError("Please enter technician email and password.")
    return
  }

  setLoading(true)

  try {
    const result = await loginUser(email, password)

    const role = (
      result?.role ||
      result?.user?.role ||
      ""
    ).toUpperCase()

    if (role !== "TECHNICIAN") {
      throw new Error("This login is only for technicians.")
    }

    setSuccess(true)

    localStorage.setItem("gos_role", role)
localStorage.setItem("gos_user_id", result.id || result.userId)

setTimeout(() => {
  window.location.href = "/technician-dashboard"
}, 700)
  } catch (error) {
    setError(error.message || "Technician login failed.")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="gos-technician-auth gos-technician-login min-h-screen bg-[#020817] text-white relative overflow-hidden">
      <AuthHeader />
      <div className="absolute top-20 left-5 md:left-20 w-72 h-72 bg-cyan-500/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-10 right-5 md:right-20 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 min-h-[calc(100dvh-3.75rem)] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-center">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden lg:block"
        >
          <div className="rounded-[38px] bg-[#071122]/90 border border-cyan-500/20 p-9 xl:p-11 shadow-2xl overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-cyan-300 text-sm font-semibold">
                <ShieldCheck className="w-5 h-5" />
                Verified Technician Access
              </div>

              <h1 className="mt-8 text-5xl xl:text-6xl font-black leading-tight">
                Field Service
                <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text">
                  Command Center
                </span>
              </h1>

              <p className="mt-6 text-cyan-100/60 text-lg leading-relaxed max-w-2xl">
                Accept onsite jobs, join remote sessions, update service status,
                manage customer visits, and track performance across US & UK.
              </p>

              <div className="mt-9 rounded-[32px] bg-[#020817] border border-white/10 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(34,211,238,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.18)_1px,transparent_1px)] bg-[size:36px_36px]" />

                <div className="relative grid grid-cols-2 gap-5">
                  <FeatureCard
                    icon={BriefcaseBusiness}
                    title="Assigned Jobs"
                    value="12 Today"
                  />
                  <FeatureCard
                    icon={Laptop}
                    title="Remote Sessions"
                    value="Live Ready"
                  />
                  <FeatureCard
                    icon={MapPin}
                    title="Onsite Visits"
                    value="US & UK"
                  />
                  <FeatureCard
                    icon={Star}
                    title="Rating"
                    value="4.9 Avg"
                  />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-4">
                <StatCard title="Jobs" value="128" />
                <StatCard title="Completed" value="96%" />
                <StatCard title="Response" value="4m" />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="w-full"
        >
          <div className="rounded-[32px] md:rounded-[38px] bg-[#071122]/95 border border-cyan-500/20 p-5 sm:p-7 md:p-9 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-cyan-300">Technician portal</p>
                <h2 className="text-3xl md:text-4xl font-black">
                  Welcome back.
                </h2>
                <p className="mt-2 text-cyan-100/50 text-sm md:text-base">
                  Login with your company-issued technician account.
                </p>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-3 gap-0 border-y border-gos-border">
              <SmallInfo label="Status" value="Secure" />
              <SmallInfo label="Region" value="US/UK" />
              <SmallInfo label="Role" value="Tech" />
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
                  Login successful. Redirecting to technician dashboard...
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-7 space-y-5">
              <div>
                <label className="text-sm text-cyan-100/70">
                  Official GOS Email
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gos.com"
                    className="w-full bg-[#0b1628] border border-white/10 focus:border-cyan-400/60 rounded-2xl pl-12 pr-4 py-4 text-white outline-none placeholder:text-cyan-100/25"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-cyan-100/70">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="flex items-center gap-3 text-sm text-cyan-100/60">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-cyan-400"
                  />
                  Remember this device
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-cyan-300 hover:text-cyan-200"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-70 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Login Successful
                  </>
                ) : (
                  <>
                    Enter Technician Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
              <p className="text-sm text-cyan-100/60 leading-relaxed">
                Protected technician access. Only approved GeekOnSites field and
                remote support specialists can login.
              </p>
            </div>

            <p className="text-center text-cyan-100/45 mt-7 text-sm">
              Not approved yet?{" "}
              <Link
                to="/technician-register"
                className="text-cyan-300 font-semibold hover:text-cyan-200"
              >
                Apply as Technician
              </Link>
            </p>
          </div>
        </motion.section>
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
    <div className="border-l border-gos-border p-3 text-center first:border-l-0">
      <p className="text-[11px] text-cyan-100/35">{label}</p>
      <h3 className="text-sm font-bold mt-1">{value}</h3>
    </div>
  )
}
