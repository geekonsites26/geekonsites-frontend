import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, CalendarCheck, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import AuthHeader from "../components/auth/AuthHeader"
import { Capacitor } from "@capacitor/core"

const customerDestination = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
  ? "/"
  : "/customer-dashboard"

export default function CustomerLogin() {
  const navigate = useNavigate()
  const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"
  const { loginCustomer, user, token, authReady } = useCustomerAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const strengthScore = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length + (password.length >= 8 ? 1 : 0)
  const strength = !password ? null : strengthScore >= 5
    ? { label: "Strong", level: 3, color: "bg-emerald-600", text: "text-emerald-700" }
    : strengthScore >= 3
      ? { label: "Weak", level: 2, color: "bg-amber-500", text: "text-amber-700" }
      : { label: "Poor", level: 1, color: "bg-red-500", text: "text-red-700" }

  useEffect(() => {
    if (authReady && token && String(user?.role || "").toUpperCase() === "CUSTOMER") {
      navigate(customerDestination(), { replace: true })
    }
  }, [authReady, navigate, token, user?.role])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError("")
    if (!email.trim() || !password) {
      setError("Enter your email address and password.")
      return
    }
    setLoading(true)
    try {
      const result = await loginCustomer(email.trim(), password)
      if (!result?.success) {
        setError(result?.message || "Unable to sign in. Please check your email and password.")
        return
      }
      if (remember) localStorage.setItem("gos_remember_customer", email.trim())
      const role = String(result?.role || result?.user?.role || "").toUpperCase()
      navigate(role === "CUSTOMER" ? customerDestination() : role === "TECHNICIAN" ? "/technician-dashboard" : role === "AGENT" ? "/agent-dashboard" : role === "ADMIN" ? "/admin-dashboard" : "/")
    } catch (loginError) {
      setError(loginError.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="gos-auth-page relative flex min-h-screen bg-white pt-16 text-gos-charcoal sm:items-center sm:bg-gos-off-white sm:px-6 sm:pb-8 sm:pt-24">
      <AuthHeader className="absolute inset-x-0 top-0" />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] min-w-0 w-full max-w-5xl overflow-hidden bg-white sm:min-h-[36rem] sm:rounded-lg sm:border sm:border-gos-border sm:shadow-[var(--gos-shadow-md)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden min-h-[38rem] flex-col justify-between overflow-hidden bg-gos-blue-deep p-8 text-white lg:flex xl:p-10">
          <div className="relative">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gos-gold">GeekOnSites customer access</p>
            <h1 className="mt-4 max-w-md font-['Cormorant_Garamond'] text-5xl font-bold leading-[0.95] tracking-normal">Your service journey, clearly connected.</h1>
            <p className="mt-5 max-w-md text-sm font-semibold leading-6 text-white/70">Manage bookings, follow technician updates, and keep service information together in one secure account.</p>
          </div>
          <div className="relative grid divide-y divide-white/15 border-y border-white/15">
            <Benefit icon={CalendarCheck} title="Booking history" text="Review active and completed services." />
            <Benefit icon={UserRound} title="Technician updates" text="Follow assignment and visit progress." />
            <Benefit icon={ShieldCheck} title="Secure access" text="Account details remain protected." />
          </div>
        </section>

        <section className="gos-customer-login-panel flex min-w-0 w-full flex-col px-4 py-3 sm:justify-center sm:p-8 lg:p-10 xl:p-12">
          <div className="mt-3 sm:mt-8 lg:mt-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">Customer portal</p>
            <h2 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-none tracking-normal text-gos-blue-deep sm:text-5xl">{nativeAndroid ? "Customer Sign In" : "Welcome back."}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">{nativeAndroid ? "Access your bookings and support." : "Sign in to view your bookings and service updates."}</p>
          </div>

          <form onSubmit={handleLogin} className="gos-customer-login-form mt-7 min-w-0 w-full">
            {error && <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">{error}</div>}

            <div className="space-y-5">
              <Field label="Email address" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
              <div>
                <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="customer-password" className="shrink-0 text-xs font-extrabold text-gos-blue-deep">Password</label><button type="button" onClick={() => navigate("/forgot-password")} className="min-w-0 text-right text-xs font-extrabold text-gos-turquoise hover:text-gos-blue">Forgot password?</button></div>
                <div className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 transition focus-within:border-gos-turquoise focus-within:bg-white"><LockKeyhole size={17} className="shrink-0 text-gos-turquoise" /><input id="customer-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gos-charcoal outline-none placeholder:text-gos-muted" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="flex h-9 w-9 items-center justify-center text-gos-muted hover:text-gos-blue" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
                {strength && <div className="mt-2" aria-live="polite"><div className="grid grid-cols-3 gap-1">{[1, 2, 3].map((level) => <span key={level} className={`h-1 rounded-full ${level <= strength.level ? strength.color : "bg-gos-border"}`} />)}</div><p className={`mt-1.5 text-[10px] font-extrabold ${strength.text}`}>{strength.label} password</p></div>}
              </div>
            </div>

            <label className="mt-4 flex w-fit items-center gap-2 text-xs font-bold text-gos-charcoal"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-gos-blue-deep" /> Remember my email</label>

            <button type="submit" disabled={loading} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gos-blue-deep px-5 text-sm font-extrabold text-white transition hover:bg-gos-blue disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 size={17} className="animate-spin" /> Signing in...</> : <>Sign in securely <ArrowRight size={17} /></>}</button>

            <div className="mt-6 border-t border-gos-border pt-5 text-center"><p className="text-sm font-semibold leading-6 text-gos-muted">New to GeekOnSites? <Link to="/customer-register" className="inline-block font-extrabold text-gos-blue hover:text-gos-turquoise">Create an account</Link></p>{nativeAndroid && <p className="mt-3 text-xs font-semibold text-gos-muted">Are you a technician? <Link to="/technician-login" className="font-extrabold text-gos-blue">Technician Sign In</Link></p>}<p className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-gos-muted"><ShieldCheck size={14} className="shrink-0 text-gos-turquoise" /> Secure customer access for the US and UK</p></div>
          </form>
        </section>
      </div>
    </main>
  )
}

function Benefit({ icon: Icon, title, text }) { return <div className="flex gap-3 py-4"><Icon size={18} className="mt-0.5 shrink-0 text-gos-gold" /><div><p className="text-sm font-extrabold text-white">{title}</p><p className="mt-1 text-xs font-semibold leading-5 text-white/60">{text}</p></div></div> }

function Field({ label, icon: Icon, value, onChange, ...inputProps }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">{label}</span><span className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 transition focus-within:border-gos-turquoise focus-within:bg-white"><Icon size={17} className="shrink-0 text-gos-turquoise" /><input value={value} onChange={(event) => onChange(event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gos-charcoal outline-none placeholder:text-gos-muted" {...inputProps} /></span></label> }
