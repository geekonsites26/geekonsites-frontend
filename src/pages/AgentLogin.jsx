import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, CheckCircle2, ClipboardList, Eye, EyeOff, Headphones, Loader2, LockKeyhole, Mail, ShieldCheck, Wrench } from "lucide-react"
import { loginUser } from "../services/authService"
import AuthHeader from "../components/auth/AuthHeader"

export default function AgentLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess(false)

    if (!email.trim() || !password) {
      setError("Enter your agent email address and password.")
      return
    }

    setLoading(true)
    try {
      const result = await loginUser(email.trim(), password, "AGENT")
      const role = String(result?.role || result?.user?.role || "").toUpperCase()
      if (role !== "AGENT") throw new Error("This account does not have agent access.")

      if (remember) localStorage.setItem("gos_remember_agent", email.trim())

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/agent-dashboard"
      }, 600)
    } catch (loginError) {
      setError(loginError.message || "The agent email or password is incorrect.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="gos-auth-page relative flex min-h-screen bg-white pt-16 text-gos-charcoal sm:items-center sm:bg-gos-off-white sm:px-6 sm:pb-8 sm:pt-24">
      <AuthHeader className="absolute inset-x-0 top-0" />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-5xl overflow-hidden bg-white sm:min-h-[36rem] sm:rounded-lg sm:border sm:border-gos-border sm:shadow-[var(--gos-shadow-md)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden min-h-[38rem] flex-col justify-between overflow-hidden bg-gos-blue-deep p-8 text-white lg:flex xl:p-10">
          <div className="relative">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gos-gold">GeekOnSites agent access</p>
            <h1 className="mt-4 max-w-md font-['Cormorant_Garamond'] text-5xl font-bold leading-[0.95] tracking-normal">Live operations, clearly coordinated.</h1>
            <p className="mt-5 max-w-md text-sm font-semibold leading-6 text-white/70">Manage incoming bookings, assign the right technician, and support customers across the US and UK from one secure workspace.</p>
          </div>
          <div className="relative grid divide-y divide-white/15 border-y border-white/15">
            <Benefit icon={ClipboardList} title="Booking queue" text="Review and action live service requests." />
            <Benefit icon={Wrench} title="Technician dispatch" text="Assign available professionals to jobs." />
            <Benefit icon={Headphones} title="Customer support" text="Follow sessions and resolve issues quickly." />
          </div>
        </section>

        <section className="flex flex-col px-4 py-3 sm:justify-center sm:p-8 lg:p-10 xl:p-12">
          <div className="mt-3 sm:mt-8 lg:mt-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">Agent portal</p>
            <h2 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-none tracking-normal text-gos-blue-deep sm:text-5xl">Operations login.</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">Sign in with your company-issued agent account.</p>
          </div>

          <div className="mt-6 grid grid-cols-3 border-y border-gos-border">
            {[["Access", "Secure"], ["Region", "US/UK"], ["Role", "Agent"]].map(([label, value], index) => (
              <div key={label} className={`flex min-h-16 flex-col items-center justify-center px-2 text-center ${index ? "border-l border-gos-border" : ""}`}>
                <span className="text-sm font-extrabold text-gos-blue-deep">{value}</span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gos-muted">{label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleLogin} className="mt-7">
            {error && <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">{error}</div>}
            {success && <div role="status" className="mb-5 flex items-center gap-2 rounded-md border border-[#bfe6e3] bg-[#eef8f7] px-4 py-3 text-sm font-bold leading-5 text-gos-blue-deep"><CheckCircle2 size={17} className="shrink-0 text-gos-turquoise" /> Agent verified. Opening the operations dashboard...</div>}

            <div className="space-y-5">
              <Field label="Agent email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="agent@geekonsites.com" autoComplete="username" inputMode="email" />
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="agent-password" className="shrink-0 text-xs font-extrabold text-gos-blue-deep">Password</label>
                  <Link to="/forgot-password" className="min-w-0 text-right text-xs font-extrabold text-gos-turquoise hover:text-gos-blue">Forgot password?</Link>
                </div>
                <div className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 transition focus-within:border-gos-turquoise focus-within:bg-white">
                  <LockKeyhole size={17} className="shrink-0 text-gos-turquoise" />
                  <input id="agent-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gos-charcoal outline-none placeholder:text-gos-muted" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="flex h-9 w-9 items-center justify-center text-gos-muted hover:text-gos-blue" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
            </div>

            <label className="mt-4 flex w-fit items-center gap-2 text-xs font-bold text-gos-charcoal"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-gos-blue-deep" /> Remember my email</label>

            <button type="submit" disabled={loading || success} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gos-blue-deep px-5 text-sm font-extrabold text-white transition hover:bg-gos-blue disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <><Loader2 size={17} className="animate-spin" /> Verifying agent...</> : success ? <><CheckCircle2 size={17} /> Access approved</> : <>Enter agent dashboard <ArrowRight size={17} /></>}
            </button>

            <div className="mt-6 border-t border-gos-border pt-5 text-center">
              <p className="text-sm font-semibold leading-6 text-gos-muted">Agent accounts are created by GeekOnSites administration.</p>
              <p className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-gos-muted"><ShieldCheck size={14} className="shrink-0 text-gos-turquoise" /> Protected access for approved dispatch and support agents</p>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

function Benefit({ icon: Icon, title, text }) { return <div className="flex gap-3 py-4"><Icon size={18} className="mt-0.5 shrink-0 text-gos-gold" /><div><p className="text-sm font-extrabold text-white">{title}</p><p className="mt-1 text-xs font-semibold leading-5 text-white/60">{text}</p></div></div> }

function Field({ label, icon: Icon, value, onChange, ...inputProps }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">{label}</span><span className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 transition focus-within:border-gos-turquoise focus-within:bg-white"><Icon size={17} className="shrink-0 text-gos-turquoise" /><input value={value} onChange={(event) => onChange(event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gos-charcoal outline-none placeholder:text-gos-muted" {...inputProps} /></span></label> }
