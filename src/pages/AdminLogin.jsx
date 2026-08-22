import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, XCircle } from "lucide-react"
import AuthHeader from "../components/auth/AuthHeader"
import { loginAdmin } from "../services/authService"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (event) => {
    event.preventDefault()
    setError("")
    if (!email.trim() || !password) return setError("Enter your administrator email and password.")

    try {
      setLoading(true)
      const result = await loginAdmin(email.trim(), password)
      if (String(result?.role || result?.user?.role || "").toUpperCase() !== "ADMIN") throw new Error("This account does not have administrator access.")
      localStorage.setItem("gos_role", "ADMIN")
      localStorage.setItem("gos_user_id", String(result.id || result.userId || ""))
      navigate("/admin-dashboard", { replace: true })
    } catch (loginError) {
      setError(loginError.message || "The admin email or password is incorrect.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="gos-admin-login">
      <AuthHeader />
      <div className="gos-admin-login__body"><section className="gos-admin-login__shell">
        <aside className="gos-admin-login__intro">
          <div className="gos-admin-login__brand"><div><span>Administration</span></div></div>
          <div className="gos-admin-login__intro-copy">
            <span className="gos-admin-login__eyebrow">INTERNAL OPERATIONS</span>
            <h1>One secure place to run every service.</h1>
            <p>Review technicians, manage bookings, support customers, and monitor payments across the United States and United Kingdom.</p>
          </div>
          <div className="gos-admin-login__assurance"><ShieldCheck size={21} /><div><strong>Role-protected access</strong><span>Dedicated administrator authentication</span></div></div>
        </aside>

        <div className="gos-admin-login__form-panel">
          <div className="gos-admin-login__form-heading"><span className="gos-admin-login__icon"><KeyRound size={22} /></span><div><p>ADMIN PORTAL</p><h2>Welcome back</h2></div></div>
          <p className="gos-admin-login__lead">Sign in with your private GeekOnSites administrator credentials.</p>
          {error && <div className="gos-admin-login__alert" role="alert"><XCircle size={19} /><span>{error}</span></div>}

          <form onSubmit={handleLogin} className="gos-admin-login__form">
            <label><span>Admin email</span><div className="gos-admin-login__field"><Mail size={18} /><input type="email" autoComplete="username" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@geekonsites.com" /></div></label>
            <label><span>Password</span><div className="gos-admin-login__field"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            <button className="gos-admin-login__submit" type="submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" size={19} /> Verifying access</> : <>Open admin dashboard <ArrowRight size={19} /></>}</button>
          </form>
          <div className="gos-admin-login__security"><CheckCircle2 size={17} /><span>Administrator accounts are created only through secure server configuration.</span></div>
        </div>
      </section></div>
    </main>
  )
}
