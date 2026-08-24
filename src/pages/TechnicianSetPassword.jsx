import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react"
import AuthHeader from "../components/auth/AuthHeader"
import { setTechnicianOnboardingPassword } from "../services/technicianService"

export default function TechnicianSetPassword() {
  const [params] = useSearchParams()
  const token = params.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const validPassword = password.length >= 8 && password.length <= 72 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)

  const submit = async (event) => {
    event.preventDefault()
    if (!token) return setError("Password setup link is invalid.")
    if (!validPassword) return setError("Password must contain uppercase, lowercase, number, and special character.")
    if (password !== confirmPassword) return setError("Passwords do not match.")
    setLoading(true)
    setError("")
    try {
      const response = await setTechnicianOnboardingPassword(token, password)
      setCompanyEmail(response.companyEmail)
      setPassword("")
      setConfirmPassword("")
    } catch (setupError) {
      setError(setupError.message || "This password setup link is invalid or expired.")
    } finally {
      setLoading(false)
    }
  }

  return <main className="gos-auth-page min-h-screen bg-gos-off-white text-gos-charcoal"><AuthHeader /><section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-8"><div className="w-full rounded-xl border border-gos-border bg-white p-6 shadow-[var(--gos-shadow-md)]">{companyEmail ? <div className="py-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><h1 className="mt-5 font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">Your technician account is ready.</h1><p className="mt-4 text-sm text-gos-muted">Registered personal email:</p><p className="mt-1 break-all font-extrabold text-gos-blue-deep">{companyEmail}</p><Link to="/technician-login" className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-gos-blue-deep px-6 text-sm font-extrabold text-white">Go to Technician Login</Link></div> : <><p className="text-xs font-extrabold uppercase tracking-widest text-gos-turquoise">Secure technician activation</p><h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">Set your GeekOnSites password</h1><p className="mt-3 text-sm leading-6 text-gos-muted">Create the password you will use with your registered personal email.</p><form onSubmit={submit} className="mt-6 space-y-4">{error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}<PasswordInput label="New Password" value={password} onChange={setPassword} show={showPassword} toggle={() => setShowPassword((value) => !value)} /><PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} show={showPassword} toggle={() => setShowPassword((value) => !value)} /><button type="submit" disabled={loading || !token} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gos-blue-deep font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Setting password...</> : "Set Password"}</button></form></>}</div></section></main>
}

function PasswordInput({ label, value, onChange, show, toggle }) {
  return <label className="block"><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">{label}</span><span className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-gos-off-white px-3"><LockKeyhole className="h-4 w-4 text-gos-turquoise" /><input type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} required autoComplete="new-password" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><button type="button" onClick={toggle} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
}
