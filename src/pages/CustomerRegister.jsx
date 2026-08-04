import { useState } from "react"
import logo from "../assets/logo.png"
import { useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Phone,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Star,
  ChevronDown,
  Globe2,
} from "lucide-react"
import { useCustomerAuth } from "../context/CustomerAuthContext"

export default function CustomerRegister() {
  const navigate = useNavigate()
  const { registerCustomer } = useCustomerAuth()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const [countryCode, setCountryCode] = useState("+1")
  const [countryOpen, setCountryOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")

  const hasUpper = /[A-Z]/.test(form.password)
  const hasLower = /[a-z]/.test(form.password)
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password)
  const hasLength = form.password.length >= 8
  const passwordValid = hasUpper && hasLower && hasSpecial && hasLength

  const country = countryCode === "+1" ? "US" : "UK"

  const sendOtp = () => {
    setError("")

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill all fields before OTP verification")
      return
    }

    if (!passwordValid) {
      setError("Password must follow all rules")
      return
    }

    if (form.phone.length !== 10) {
      setError(`${country} mobile number must contain 10 digits`)
      return
    }

    setOtpSent(true)
    alert("Demo OTP sent: 123456")
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    if (!otpSent) {
      setError("Please verify mobile number first")
      return
    }

    if (otp !== "123456") {
      setError("Invalid OTP. Use demo OTP 123456")
      return
    }

    const customerData = {
      ...form,
      phone: `${countryCode}${form.phone}`,
    }

    const result = await registerCustomer(customerData)

if (!result.success) {
  setError(result.message || "Registration failed")
  return
}

navigate("/customer-login")
  }

  return (
    <div className="min-h-screen bg-[#050B12] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_35%)]" />

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

              <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                <Globe2 className="w-4 h-4" />
                US / UK Service Platform
              </div>

              <h2 className="mt-8 text-4xl xl:text-5xl font-bold leading-tight max-w-2xl">
                Create your customer account in minutes.
              </h2>

              <p className="mt-5 text-slate-400 leading-7 max-w-xl">
                Book tech services, track assigned technicians, join remote
                sessions, download invoices and manage every service from one
                secure dashboard.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Book laptop, printer, WiFi and remote support",
                  "Track technician assignment and arrival status",
                  "Manage service history and invoices",
                  "Secure mobile OTP verification",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                ["4.9", "Customer Rating"],
                ["US/UK", "Coverage"],
                ["24/7", "Support"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <h3 className="mt-3 text-xl font-bold text-cyan-300">
                    {value}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleRegister}
            className="relative p-6 sm:p-8 lg:p-12 bg-[#07111C]"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="absolute left-5 top-5 z-20 flex lg:hidden w-10 h-10 rounded-full border border-white/10 bg-[#0B1623] items-center justify-center text-cyan-300 hover:bg-cyan-500/10 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="hidden lg:flex mb-7 justify-end">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1623] px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/10 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Website
              </button>
            </div>

            <div className="lg:hidden pt-10 mb-7 text-center">
              <img
                src={logo}
                alt="GeekOnSites Logo"
                className="mx-auto h-20 w-auto object-contain"
              />

              <h1 className="mt-4 text-3xl font-black">
                Geek<span className="text-cyan-300">OnSites</span>
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Customer Registration
              </p>
            </div>

            <p className="text-sm font-semibold text-cyan-300">
              CUSTOMER PORTAL
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Create account
            </h2>

            <p className="mt-3 text-sm text-slate-400 leading-6">
              Register with secure mobile OTP verification for US and UK
              customers.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-7 space-y-5">
              <InputBox icon={User} label="Full Name">
                <input
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                />
              </InputBox>

              <InputBox icon={Mail} label="Email Address">
                <input
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                />
              </InputBox>

              <div>
                <label className="text-sm text-slate-400">Mobile Number</label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1623] px-4 py-3 focus-within:border-cyan-400/50 relative">
                  <Phone className="w-5 h-5 text-cyan-300 shrink-0" />

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setCountryOpen(!countryOpen)}
                      className="flex items-center gap-2 text-sm text-white"
                    >
                      <span>{countryCode === "+1" ? "🇺🇸" : "🇬🇧"}</span>
                      <span>{countryCode}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {countryOpen && (
                      <div className="absolute left-0 top-9 z-50 w-32 rounded-2xl border border-white/10 bg-[#0B1623] shadow-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setCountryCode("+1")
                            setCountryOpen(false)
                            setForm({ ...form, phone: "" })
                          }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-cyan-500/10"
                        >
                          🇺🇸 +1 US
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCountryCode("+44")
                            setCountryOpen(false)
                            setForm({ ...form, phone: "" })
                          }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-cyan-500/10"
                        >
                          🇬🇧 +44 UK
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder={countryCode === "+1" ? "5551234567" : "7123456789"}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    autoComplete="tel"
                    maxLength={10}
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {countryCode === "+1"
                    ? "US format: +1 5551234567"
                    : "UK format: +44 7123456789"}
                </p>
              </div>

              <div>
                <label className="text-sm text-slate-400">Password</label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1623] px-4 py-3 focus-within:border-cyan-400/50">
                  <LockKeyhole className="w-5 h-5 text-cyan-300 shrink-0" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    autoComplete="new-password"
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

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <Rule ok={hasLength} text="8+ characters" />
                  <Rule ok={hasUpper} text="Uppercase letter" />
                  <Rule ok={hasLower} text="Lowercase letter" />
                  <Rule ok={hasSpecial} text="Special character" />
                </div>
              </div>

              {otpSent && (
                <InputBox icon={ShieldCheck} label="Enter OTP">
                  <input
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                  />
                </InputBox>
              )}

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/10 py-3.5 text-sm font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
                >
                  Send Mobile OTP
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-[#041014] hover:bg-cyan-300 transition flex items-center justify-center gap-2"
                >
                  Verify OTP & Create Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm">
              <span className="text-slate-400">Already have an account?</span>
              <button
                type="button"
                onClick={() => navigate("/customer-login")}
                className="text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                Login
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Secure registration for US and UK customers
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function InputBox({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="text-sm text-slate-400">{label}</label>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1623] px-4 py-3 focus-within:border-cyan-400/50">
        <Icon className="w-5 h-5 text-cyan-300 shrink-0" />
        {children}
      </div>
    </div>
  )
}

function Rule({ ok, text }) {
  return (
    <div className={ok ? "text-green-400" : "text-slate-500"}>
      {ok ? "✓" : "○"} {text}
    </div>
  )
}