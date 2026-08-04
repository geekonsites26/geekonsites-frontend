import { useState } from "react"
import logo from "../assets/logo.png"
import { useNavigate } from "react-router-dom"
import {
  Mail,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Star,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { useCustomerAuth } from "../context/CustomerAuthContext"

export default function CustomerLogin() {
  const navigate = useNavigate()
  const { loginCustomer } = useCustomerAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

 const handleLogin = async (e) => {
  e.preventDefault()

  setError("")
  setLoading(true)

  try {
    const result = await loginCustomer(email, password)

    if (!result?.success) {
      setError(result?.message || "Unable to sign in. Please check your email and password.")
      return
    }

    const role = (
      result?.role ||
      result?.user?.role ||
      ""
    ).toUpperCase()

    setLoading(false)

    switch (role) {
      case "CUSTOMER":
        navigate("/customer-dashboard")
        break

      case "TECHNICIAN":
        navigate("/technician-dashboard")
        break

      case "AGENT":
        navigate("/agent-dashboard")
        break

      case "ADMIN":
        navigate("/admin-dashboard")
        break

      default:
        navigate("/")
    }
  } catch (err) {
    setLoading(false)
    setError(err.message || "Login failed")
  }
}

  return (
    <div className="min-h-screen bg-[#050B12] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_35%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-6xl rounded-[32px] overflow-hidden border border-white/10 bg-[#07111C]/95 shadow-2xl grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-[#081827] via-[#07111C] to-[#050B12]">
            <div>
              <div className="flex items-center gap-4">
                <img
                  src={logo}
                  alt="GeekOnSites Logo"
                  className="h-16 w-auto object-contain"
                />

                <div>
                  
                </div>
              </div>

              <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                <ShieldCheck className="w-4 h-4" />
                Secure US / UK Customer Portal
              </div>

              <h2 className="mt-8 text-4xl xl:text-5xl font-bold leading-tight max-w-2xl">
                Track every service from booking to completion.
              </h2>

              <p className="mt-5 text-slate-400 leading-7 max-w-xl">
                View technician assignment, service timeline, remote support,
                invoices and booking updates from one professional dashboard.
              </p>

              <div className="mt-9 grid grid-cols-3 gap-4 max-w-xl">
                {["Bookings", "Technician", "Remote"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <p className="mt-3 text-sm text-slate-400">{item}</p>
                    <h3 className="mt-1 text-lg font-bold text-cyan-300">
                      Live
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 mt-10">
              <div className="flex items-center gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="mt-4 text-slate-300 leading-6">
                “The technician tracking and service updates were clear and
                professional. I knew exactly when help was arriving.”
              </p>

              <p className="mt-4 text-sm text-cyan-300 font-semibold">
                — Verified Customer
              </p>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="relative p-6 sm:p-8 lg:p-12 bg-[#07111C]"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="absolute left-5 top-5 w-10 h-10 rounded-full border border-white/10 bg-[#0B1623] flex items-center justify-center text-cyan-300 hover:bg-cyan-500/10 transition"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="lg:hidden pt-10 mb-8 text-center">
             <img
  src={logo}
  alt="GeekOnSites Logo"
  className="mx-auto h-20 w-auto object-contain"
/>

              <h1 className="mt-4 text-3xl font-black">
                Geek<span className="text-cyan-300">OnSites</span>
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Customer Portal
              </p>
            </div>

            <div className="hidden lg:flex mb-8 justify-end">
              <button
  type="button"
  onClick={() => navigate("/")}
  className="absolute right-6 top-6 z-20 hidden lg:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1623] px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/10 transition"
>
  <ArrowLeft className="w-4 h-4" />
  Back to Website
</button>

<button
  type="button"
  onClick={() => navigate("/")}
  className="absolute left-5 top-5 z-20 flex lg:hidden w-10 h-10 rounded-full border border-white/10 bg-[#0B1623] items-center justify-center text-cyan-300 hover:bg-cyan-500/10 transition"
>
  <ArrowLeft className="w-5 h-5" />
</button>
            </div>

            <p className="text-sm font-semibold text-cyan-300">
              CUSTOMER PORTAL
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm text-slate-400 leading-6">
              Access your GeekOnSite bookings, technician updates and service
              history securely.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-sm text-slate-400">Email Address</label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1623] px-4 py-3.5 focus-within:border-cyan-400/50">
                  <Mail className="w-5 h-5 text-cyan-300 shrink-0" />

                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-400">Password</label>

                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1623] px-4 py-3.5 focus-within:border-cyan-400/50">
                  <LockKeyhole className="w-5 h-5 text-cyan-300 shrink-0" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-cyan-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" className="accent-cyan-400" />
                  Remember me
                </label>

                <span className="text-slate-500">Protected login</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-[#041014] hover:bg-cyan-300 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm">
              <span className="text-slate-400">New customer?</span>
              <button
                type="button"
                onClick={() => navigate("/customer-register")}
                className="text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                Create account
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Secure login for US and UK customers
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
