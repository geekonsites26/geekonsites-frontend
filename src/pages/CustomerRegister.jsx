import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import { setLocation, useRegion } from "../utils/location"
import AuthHeader from "../components/auth/AuthHeader"

const passwordRules = [
  ["Uppercase letter", (value) => /[A-Z]/.test(value)],
  ["Lowercase letter", (value) => /[a-z]/.test(value)],
  ["Number", (value) => /\d/.test(value)],
  ["Special character", (value) => /[^A-Za-z0-9]/.test(value)],
]

export default function CustomerRegister() {
  const navigate = useNavigate()
  const region = useRegion()
  const { registerCustomer } = useCustomerAuth()
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const checks = useMemo(() => passwordRules.map(([label, test]) => ({ label, valid: test(form.password) })), [form.password])
  const passwordValid = form.password.length >= 8 && form.password.length <= 15 && checks.every(({ valid }) => valid)
  const strength = useMemo(() => {
    if (!form.password) return null
    const score = checks.filter(({ valid }) => valid).length + (form.password.length >= 8 ? 1 : 0)
    if (score >= 5) return { label: "Strong", level: 3, color: "bg-emerald-600", text: "text-emerald-700" }
    if (score >= 3) return { label: "Weak", level: 2, color: "bg-amber-500", text: "text-amber-700" }
    return { label: "Poor", level: 1, color: "bg-red-500", text: "text-red-700" }
  }, [checks, form.password])

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const changeRegion = (code) => {
    setLocation(code)
    setForm((current) => ({ ...current, phone: "" }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (name.length < 2) return setError("Enter your full name.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.")
    if (form.phone.length !== 10) return setError(`Enter a valid 10-digit ${region.code} mobile number.`)
    if (!passwordValid) return setError("Password must satisfy all five security requirements.")
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.")
    if (!accepted) return setError("Accept the Terms and Privacy Policy to continue.")

    setLoading(true)
    const result = await registerCustomer({
      name,
      email,
      phone: `${region.dialCode}${form.phone}`,
      password: form.password,
      country: region.code,
    })
    setLoading(false)

    if (!result.success) return setError(result.message || "Registration failed. Please try again.")
    navigate("/customer-login", { replace: true, state: { registered: true, email } })
  }

  return (
    <main className="gos-register-page min-h-screen bg-gos-off-white text-gos-charcoal">
      <AuthHeader />

      <section className="mx-auto grid min-h-[calc(100dvh-3.5rem)] min-w-0 w-full max-w-5xl items-stretch lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="hidden bg-gos-blue-deep px-8 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gos-turquoise text-gos-blue-deep"><ShieldCheck size={20} /></span>
            <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.15em] text-gos-gold">Customer account</p>
            <h1 className="mt-3 font-['Cormorant_Garamond'] text-5xl font-bold leading-[0.95]">Support starts with a secure account.</h1>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-6 text-white/70">Book assistance, follow service progress, manage payments, and keep every visit in one place.</p>
          </div>
          <div className="space-y-3 border-t border-white/15 pt-6">
            {["Protected account access", `${region.country} service settings`, "Booking history and updates"].map((item) => <p key={item} className="flex items-center gap-3 text-xs font-bold text-white/80"><Check size={15} className="text-gos-turquoise" /> {item}</p>)}
          </div>
        </aside>

        <div className="flex min-w-0 w-full items-center px-4 py-5 sm:px-8 sm:py-8 lg:bg-white lg:px-12">
          <form onSubmit={submit} autoComplete="off" data-form-type="other" className="mx-auto min-w-0 w-full max-w-xl rounded-lg border border-gos-border bg-white p-4 shadow-[var(--gos-shadow-md)] sm:p-7 lg:border-0 lg:p-0 lg:shadow-none">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">Create your account</p>
            <h2 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-none text-gos-blue-deep">Join GeekOnSites.</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">Use accurate details so your technician and service updates reach you.</p>

            {error && <div role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field icon={User} label="Full name"><input value={form.name} onChange={update("name")} autoComplete="name" placeholder="Your full name" required /></Field>
              <Field icon={Mail} label="Email address"><input type="email" value={form.email} onChange={update("email")} autoComplete="email" placeholder="you@example.com" required /></Field>
            </div>

            <div className="mt-4">
              <span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">Service region</span>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gos-border" role="group" aria-label="Service region">
                {["US", "UK"].map((code) => <button key={code} type="button" onClick={() => changeRegion(code)} aria-pressed={region.code === code} className={`flex min-h-14 min-w-0 items-center justify-center gap-2 px-2 text-left outline-none transition focus-visible:outline-none ${region.code === code ? "bg-gos-blue-deep text-white" : "bg-white text-gos-blue hover:bg-gos-off-white"}`}><MapPin size={15} className="shrink-0" /><span className="min-w-0"><strong className="block text-xs font-extrabold">{code}</strong><span className={`block text-[10px] font-bold leading-4 ${region.code === code ? "text-white/70" : "text-gos-muted"}`}>{code === "US" ? "United States" : "United Kingdom"}</span></span></button>)}
              </div>
            </div>

            <div className="mt-4">
              <span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">Mobile number</span>
              <div className="flex min-h-12 items-center rounded-lg border border-gos-border bg-[#f8fafb] focus-within:border-gos-turquoise">
                <span className="flex h-7 items-center gap-2 border-r border-gos-border px-3 text-sm font-extrabold text-gos-blue-deep"><Phone size={16} className="text-gos-turquoise" /> {region.dialCode}</span>
                <input type="tel" inputMode="numeric" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} autoComplete="tel-national" placeholder="10-digit mobile number" required className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none focus-visible:outline-none" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><PasswordField label="Password" value={form.password} onChange={update("password")} visible={showPassword} toggle={() => setShowPassword((value) => !value)} />{strength && <div className="mt-2" aria-live="polite"><div className="grid grid-cols-3 gap-1">{[1, 2, 3].map((level) => <span key={level} className={`h-1 rounded-full ${level <= strength.level ? strength.color : "bg-gos-border"}`} />)}</div><p className={`mt-1.5 text-[10px] font-extrabold ${strength.text}`}>{strength.label} password</p></div>}</div>
              <PasswordField label="Confirm password" value={form.confirmPassword} onChange={update("confirmPassword")} visible={showConfirmPassword} toggle={() => setShowConfirmPassword((value) => !value)} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
              {checks.map(({ label, valid }) => <span key={label} className={`flex items-center gap-1.5 text-[10px] font-bold ${valid ? "text-emerald-700" : "text-gos-muted"}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${valid ? "bg-emerald-100" : "bg-gos-off-white"}`}>{valid && <Check size={11} />}</span>{label}</span>)}
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs font-semibold leading-5 text-gos-muted"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-gos-blue-deep" /><span>I agree to the GeekOnSites Terms and Privacy Policy.</span></label>

            <button type="submit" disabled={loading} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gos-blue-deep px-5 text-sm font-extrabold text-white transition hover:bg-gos-blue disabled:cursor-wait disabled:opacity-60">{loading ? "Creating account..." : <>Create secure account <ArrowRight size={17} /></>}</button>
            <p className="mt-5 text-center text-xs font-semibold text-gos-muted">Already registered? <Link to="/customer-login" className="font-extrabold text-gos-blue">Log in</Link></p>
          </form>
        </div>
      </section>
    </main>
  )
}

function Field({ icon: Icon, label, children }) {
  return <label className="block"><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">{label}</span><span className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 focus-within:border-gos-turquoise"><Icon size={17} className="shrink-0 text-gos-turquoise" /><span className="min-w-0 flex-1 [&>input]:w-full [&>input]:bg-transparent [&>input]:text-sm [&>input]:font-semibold [&>input]:outline-none [&>input]:focus-visible:outline-none [&>input]:placeholder:text-gos-muted">{children}</span></span></label>
}

function PasswordField({ label, value, onChange, visible, toggle }) {
  const isConfirmation = label === "Confirm password"
  const inputId = isConfirmation ? "gos-confirm-entry" : "gos-secure-entry"
  return <label className="block" htmlFor={inputId}><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">{label}</span><span className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 focus-within:border-gos-turquoise"><LockKeyhole size={17} className="pointer-events-none shrink-0 text-gos-turquoise" /><input id={inputId} type={visible ? "text" : "password"} value={value} onChange={onChange} maxLength={15} required autoComplete="new-password" placeholder={label} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gos-charcoal outline-none placeholder:text-gos-muted" />{toggle && <button type="button" onClick={toggle} aria-label={visible ? "Hide password" : "Show password"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gos-muted hover:text-gos-blue">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>}</span></label>
}
