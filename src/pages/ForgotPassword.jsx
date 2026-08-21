import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react"
import { requestPasswordReset } from "../services/authService"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [warming, setWarming] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError("Enter a valid email address.")

    setError("")
    setLoading(true)
    setWarming(false)
    const controller = new AbortController()
    const warmingId = window.setTimeout(() => setWarming(true), 5000)
    const timeoutId = window.setTimeout(() => controller.abort(), 20000)
    try {
      await requestPasswordReset(cleanEmail, { signal: controller.signal })
      setSent(true)
    } catch (requestError) {
      setError(requestError.name === "AbortError" ? "The reset service is unavailable. Please check that the backend is running and try again." : requestError.message || "We could not send the reset email. Please try again.")
    } finally {
      window.clearTimeout(warmingId)
      window.clearTimeout(timeoutId)
      setWarming(false)
      setLoading(false)
    }
  }

  return (
    <main className="gos-auth-page flex min-h-screen items-center bg-[#edf2f5] px-4 py-6 text-gos-charcoal">
      <section className="mx-auto w-full max-w-md rounded-lg border border-gos-border bg-white p-5 shadow-[var(--gos-shadow-md)] sm:p-7">
        <Link to="/customer-login" className="inline-flex items-center gap-2 text-xs font-extrabold text-gos-blue"><ArrowLeft size={15} /> Back to login</Link>
        {sent ? (
          <div className="py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef8f7] text-gos-turquoise"><CheckCircle2 size={24} /></span>
            <h1 className="mt-5 font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">Check your email.</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">If an account exists for <strong className="text-gos-blue-deep">{email}</strong>, password reset instructions have been sent.</p>
            <Link to="/customer-login" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-gos-blue-deep px-6 text-sm font-extrabold text-white">Return to login</Link>
          </div>
        ) : (
          <>
            <div className="mt-7"><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">Account recovery</p><h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-none text-gos-blue-deep">Reset your password.</h1><p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">Enter the email used for your GeekOnSites account.</p></div>
            <form onSubmit={submit} className="mt-6">
              {error && <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
              <label className="block"><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">Email address</span><span className="flex min-h-12 items-center gap-3 rounded-lg border border-gos-border bg-[#f8fafb] px-3 focus-within:border-gos-turquoise"><Mail size={17} className="text-gos-turquoise" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-gos-muted" /></span></label>
              <button type="submit" disabled={loading} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gos-blue-deep text-sm font-extrabold text-white disabled:opacity-60">{loading ? <><Loader2 size={17} className="animate-spin" /> {warming ? "Starting secure service..." : "Sending..."}</> : <>Send reset link <ArrowRight size={17} /></>}</button>
              {warming && <p className="mt-3 text-center text-xs font-bold text-gos-muted">Connecting to the secure reset service...</p>}
              <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-gos-muted"><ShieldCheck size={14} className="text-gos-turquoise" /> For security, account existence is never disclosed.</p>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
