import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Save } from "lucide-react"
import { resetPassword } from "../services/authService"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get("token") || ""
  const loginPath = params.get("role") === "technician" ? "/technician-login" : "/customer-login"
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const valid = password.length >= 8 && password.length <= 15 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)

  const submit = async (event) => {
    event.preventDefault()
    if (!token) return setError("This reset link is invalid or incomplete. Request a new link.")
    if (!valid) return setError("Password must contain 8 to 15 characters with uppercase, lowercase, number, and special character.")
    if (password !== confirmPassword) return setError("Passwords do not match.")
    setError("")
    setLoading(true)
    try {
      await resetPassword(token, password)
      setComplete(true)
    } catch (resetError) {
      setError(resetError.message || "This reset link may have expired. Request a new link.")
    } finally {
      setLoading(false)
    }
  }

  return <main className="gos-auth-page flex min-h-screen items-center bg-[#edf2f5] px-4 py-6 text-gos-charcoal"><section className="mx-auto w-full max-w-md rounded-lg border border-gos-border bg-white p-5 shadow-[var(--gos-shadow-md)] sm:p-7"><Link to={loginPath} className="inline-flex items-center gap-2 text-xs font-extrabold text-gos-blue"><ArrowLeft size={15} /> Back to login</Link>{complete ? <div className="py-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef8f7] text-gos-turquoise"><CheckCircle2 size={24} /></span><h1 className="mt-5 font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">Password updated.</h1><p className="mt-3 text-sm font-semibold text-gos-muted">You can now sign in using your new password.</p><Link to={loginPath} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-gos-blue-deep px-6 text-sm font-extrabold text-white">Continue to login</Link></div> : <><div className="mt-7"><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">Secure account recovery</p><h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-none text-gos-blue-deep">Create a new password.</h1><p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">Use a new password that you have not used before.</p></div><form onSubmit={submit} className="mt-6 space-y-4">{error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}<PasswordField label="New password" value={password} onChange={setPassword} show={show} onToggle={() => setShow(!show)} /><p className={`text-[10px] font-bold ${password && !valid ? "text-red-600" : "text-gos-muted"}`}>{valid ? "Strong password" : "Use 8 to 15 characters with uppercase, lowercase, number, and special character."}</p><PasswordField label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} show={show} onToggle={() => setShow(!show)} /><button type="submit" disabled={loading || !token} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gos-blue-deep text-sm font-extrabold text-white disabled:opacity-50">{loading ? <><Loader2 size={17} className="animate-spin" /> Updating...</> : <><Save size={16} /> Update password</>}</button>{!token && <Link to="/forgot-password" state={params.get("role") === "technician" ? { role: "TECHNICIAN" } : undefined} className="block text-center text-xs font-extrabold text-gos-turquoise">Request a new reset link</Link>}</form></>}</section></main>
}

function PasswordField({ label, value, onChange, show, onToggle }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">{label}</span><span className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 focus-within:border-gos-turquoise"><LockKeyhole size={17} className="text-gos-turquoise" /><input type={show ? "text" : "password"} value={value} maxLength={15} onChange={(event) => onChange(event.target.value)} required className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" /><button type="button" onClick={onToggle} className="flex h-9 w-9 items-center justify-center text-gos-muted" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label> }
