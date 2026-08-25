import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Bell, ChevronRight, Edit3, FileText, Headphones, LogOut, Mail, MapPin, Phone, Save, ShieldCheck, User, X } from "lucide-react"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import { Capacitor } from "@capacitor/core"

const displayName = (user) => user?.fullName || user?.name || user?.username || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "User"

export default function Profile() {
  const { customer, updateCustomerProfile, logoutCustomer } = useCustomerAuth()
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("gos_user") || "null") } catch { return null } })()
  const user = customer || storedUser
  const role = String(user?.role || localStorage.getItem("gos_role") || "CUSTOMER").toLowerCase()
  const dashboard = role === "technician" ? "/technician-dashboard" : role === "agent" ? "/agent-dashboard" : "/customer-dashboard"
  const loginPath = role === "technician" ? "/technician-login" : role === "agent" ? "/agent-login" : "/customer-login"
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(displayName(user))
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")

  if (!user) {
    return <main className="min-h-screen bg-gos-off-white px-4 pb-20 pt-28"><section className="mx-auto max-w-md border border-gos-border bg-white p-6 text-center"><User className="mx-auto text-gos-turquoise" /><h1 className="mt-4 font-['Cormorant_Garamond'] text-3xl font-bold text-gos-blue-deep">Sign in to view your profile</h1><Link to="/customer-login" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-gos-blue-deep px-6 text-sm font-extrabold text-white">Log in</Link></section></main>
  }

  const saveProfile = () => {
    const updated = { ...user, fullName: name.trim(), name: name.trim(), email: email.trim(), phone: phone.trim() }
    localStorage.setItem("gos_user", JSON.stringify(updated))
    updateCustomerProfile(updated)
    setEditing(false)
  }

  const logout = () => {
    logoutCustomer()
    window.location.href = loginPath
  }

  const nativeCustomer = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android" && role === "customer"
  if (nativeCustomer) return <NativeCustomerProfile name={name} email={email} phone={phone} region={user?.city || user?.serviceArea || (localStorage.getItem("gos_location") === "UK" ? "United Kingdom" : "United States")} edit={() => setEditing(true)} logout={logout} editing={editing} close={() => setEditing(false)} save={saveProfile} setName={setName} setEmail={setEmail} setPhone={setPhone} />

  return (
    <main className="min-h-screen bg-[#edf2f5] pb-24 pt-[calc(5rem+env(safe-area-inset-top))] text-gos-charcoal sm:pt-24">
      <section className="border-b border-gos-border bg-white px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Link to={dashboard} className="inline-flex items-center gap-2 text-xs font-extrabold text-gos-blue transition hover:text-gos-turquoise"><ArrowLeft size={15} /> Back to dashboard</Link>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">Your GOS account</p><h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-none text-gos-blue-deep sm:text-5xl">Profile</h1><p className="mt-3 text-sm font-semibold text-gos-muted">Manage your contact details and account access.</p></div>
            <button type="button" onClick={() => setEditing(true)} className="hidden min-h-11 items-center gap-2 rounded-md bg-gos-blue-deep px-4 text-sm font-extrabold text-white sm:flex"><Edit3 size={16} /> Edit profile</button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-stretch gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="flex h-fit flex-col rounded-lg border border-gos-border bg-white p-5 shadow-[var(--gos-shadow-sm)]">
          <div className="flex items-center gap-4 lg:block">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-[#dff3f1] bg-gos-blue-deep font-['Cormorant_Garamond'] text-2xl font-bold text-white lg:h-20 lg:w-20 lg:text-3xl">{name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0 lg:mt-4"><h2 className="truncate font-['Cormorant_Garamond'] text-2xl font-bold text-gos-blue-deep">{name}</h2><p className="mt-1 text-xs font-extrabold capitalize text-gos-turquoise">{role} account</p></div>
          </div>
          <div className="mt-5 border-t border-gos-border pt-4"><p className="flex items-center gap-2 text-xs font-extrabold text-gos-charcoal"><ShieldCheck size={15} className="text-gos-turquoise" /> Active GOS account</p></div>
        </aside>

        <div className="rounded-lg border border-gos-border bg-white p-4 shadow-[var(--gos-shadow-sm)] sm:p-6">
          <div className="flex items-center justify-between border-b border-gos-border pb-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-muted">Account details</p><h2 className="mt-1 font-['Cormorant_Garamond'] text-2xl font-bold text-gos-blue-deep">Personal information</h2></div><button type="button" onClick={() => setEditing(true)} className="flex h-10 w-10 items-center justify-center rounded-md border border-gos-border text-gos-blue sm:hidden" aria-label="Edit profile"><Edit3 size={16} /></button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><Detail icon={User} label="Full name" value={name} /><Detail icon={Mail} label={role === "customer" ? "Email address" : "Official email"} value={email || "Not added"} /><Detail icon={Phone} label="Phone number" value={phone || "Not added"} /><Detail icon={MapPin} label={role === "agent" ? "Office / service area" : "Service region"} value={user?.city || user?.serviceArea || (localStorage.getItem("gos_location") === "UK" ? "United Kingdom" : "United States")} /><Detail icon={ShieldCheck} label="Account role" value={`${role.charAt(0).toUpperCase()}${role.slice(1)}`} /><Detail icon={ShieldCheck} label="Account status" value={user?.status || "Active"} /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="flex flex-col gap-3 rounded-lg border border-gos-border bg-white px-4 py-4 shadow-[var(--gos-shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div><p className="text-xs font-extrabold text-gos-blue-deep">Finished managing your account?</p><p className="mt-1 text-xs font-semibold text-gos-muted">Log out securely from this device.</p></div>
          <button type="button" onClick={logout} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-xs font-extrabold text-red-700 transition hover:border-red-300 hover:bg-red-50 sm:w-auto"><LogOut size={15} /> Log out</button>
        </div>
      </section>

      <nav aria-label="Account and legal links" className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-4 pb-4 sm:px-6 lg:hidden">
        <Link to="/privacy" className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-gos-border bg-white px-2 text-center text-[10px] font-extrabold text-gos-blue-deep"><ShieldCheck size={14} className="shrink-0 text-gos-turquoise" /> Privacy</Link>
        <Link to="/terms" className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-gos-border bg-white px-2 text-center text-[10px] font-extrabold text-gos-blue-deep"><FileText size={14} className="shrink-0 text-gos-turquoise" /> Terms</Link>
        <Link to="/contact" className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-gos-border bg-white px-2 text-center text-[10px] font-extrabold text-gos-blue-deep"><Headphones size={14} className="shrink-0 text-gos-turquoise" /> Support</Link>
      </nav>

      {editing && <div className="fixed inset-0 z-[99999] flex items-end bg-gos-blue-deep/55 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><div className="w-full bg-white p-5 shadow-[var(--gos-shadow-md)] sm:max-w-md sm:rounded-md sm:p-6"><div className="flex items-center justify-between border-b border-gos-border pb-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-turquoise">Account settings</p><h2 id="edit-profile-title" className="mt-1 font-['Cormorant_Garamond'] text-3xl font-bold text-gos-blue-deep">Edit profile</h2></div><button type="button" onClick={() => setEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-md border border-gos-border text-gos-blue" aria-label="Close"><X size={17} /></button></div><div className="mt-5 space-y-4"><Field label="Full name" value={name} onChange={setName} /><Field label="Email address" value={email} onChange={setEmail} type="email" /><Field label="Phone number" value={phone} onChange={setPhone} type="tel" /></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setEditing(false)} className="min-h-11 flex-1 rounded-md border border-gos-border text-sm font-extrabold text-gos-blue">Cancel</button><button type="button" onClick={saveProfile} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-gos-blue-deep text-sm font-extrabold text-white"><Save size={16} /> Save changes</button></div></div></div>}
    </main>
  )
}

function NativeCustomerProfile({ name, email, phone, region, edit, logout, editing, close, save, setName, setEmail, setPhone }) {
  return <main className="gos-native-profile min-h-[100dvh] bg-[#f4f7f9] pb-[calc(5.75rem+env(safe-area-inset-bottom))] text-gos-charcoal">
    <header className="sticky top-0 z-30 border-b border-[#dfe8ed] bg-[#f8fbfc]/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl"><div className="mx-auto flex max-w-lg items-center justify-between"><h1 className="text-[22px] font-black tracking-[-.03em] text-gos-blue-deep">Profile</h1><button type="button" onClick={edit} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gos-blue-deep shadow-sm" aria-label="Edit profile"><Edit3 size={18} /></button></div></header>
    <div className="mx-auto max-w-lg px-4 py-4">
      <section className="flex items-center gap-4 pb-5"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gos-blue-deep text-2xl font-black text-white shadow-[0_7px_18px_rgba(8,43,91,.2)]">{name.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xl font-black text-gos-blue-deep">{name}</strong><span className="mt-1 block truncate text-xs font-semibold text-gos-muted">{email || "GeekOnSites customer"}</span><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-emerald-700"><ShieldCheck size={13} /> Active customer account</span></span></section>
      <ProfileGroup title="Account"><ProfileValue icon={User} label="Full name" value={name} onClick={edit} /><ProfileValue icon={Mail} label="Email" value={email || "Not added"} onClick={edit} /><ProfileValue icon={Phone} label="Mobile number" value={phone || "Not added"} onClick={edit} /><ProfileValue icon={MapPin} label="Service region" value={region} /></ProfileGroup>
      <ProfileGroup title="Preferences"><ProfileLink icon={Bell} label="Notifications" to="/notifications" /><ProfileValue icon={MapPin} label="Location and service region" value={region} /></ProfileGroup>
      <ProfileGroup title="Support & legal"><ProfileLink icon={Headphones} label="Help & Support" to="/support" /><ProfileLink icon={ShieldCheck} label="Privacy Policy" to="/privacy" /><ProfileLink icon={FileText} label="Terms & Conditions" to="/terms" /></ProfileGroup>
      <button type="button" onClick={logout} className="mt-4 flex min-h-12 w-full items-center gap-3 border-y border-red-100 px-2 text-left text-sm font-extrabold text-red-700"><LogOut size={18} /> Log out</button>
    </div>
    {editing && <div className="fixed inset-0 z-[99999] flex items-end bg-gos-blue-deep/55" role="dialog" aria-modal="true" aria-labelledby="native-edit-profile-title"><div className="w-full rounded-t-[24px] bg-white p-5 pb-[max(24px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(8,43,91,.2)]"><div className="flex items-center justify-between border-b border-gos-border pb-4"><h2 id="native-edit-profile-title" className="text-xl font-black text-gos-blue-deep">Edit profile</h2><button type="button" onClick={close} className="flex h-9 w-9 items-center justify-center rounded-full bg-gos-off-white" aria-label="Close"><X size={17} /></button></div><div className="mt-4 space-y-3"><Field label="Full name" value={name} onChange={setName} /><Field label="Email address" value={email} onChange={setEmail} type="email" /><Field label="Phone number" value={phone} onChange={setPhone} type="tel" /></div><button type="button" onClick={save} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gos-blue-deep text-sm font-extrabold text-white"><Save size={16} /> Save changes</button></div></div>}
  </main>
}

function ProfileGroup({ title, children }) { return <section className="mb-4"><h2 className="mb-2 px-1 text-[11px] font-black uppercase tracking-[.1em] text-gos-muted">{title}</h2><div className="border-y border-gos-border bg-white">{children}</div></section> }
function ProfileValue({ icon: Icon, label, value, onClick }) { const Tag = onClick ? "button" : "div"; return <Tag type={onClick ? "button" : undefined} onClick={onClick} className="flex min-h-[58px] w-full items-center gap-3 border-b border-gos-border px-3 text-left last:border-b-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f7f5] text-gos-turquoise"><Icon size={17} /></span><span className="min-w-0 flex-1"><strong className="block text-xs text-gos-blue-deep">{label}</strong><span className="mt-0.5 block truncate text-[11px] font-semibold text-gos-muted">{value}</span></span>{onClick && <ChevronRight size={16} className="text-gos-muted" />}</Tag> }
function ProfileLink({ icon: Icon, label, to }) { return <Link to={to} className="flex min-h-[56px] items-center gap-3 border-b border-gos-border px-3 last:border-b-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f7f5] text-gos-turquoise"><Icon size={17} /></span><strong className="min-w-0 flex-1 text-xs text-gos-blue-deep">{label}</strong><ChevronRight size={16} className="text-gos-muted" /></Link> }

function Detail({ icon: Icon, label, value }) { return <div className="flex min-h-20 min-w-0 items-start gap-3 rounded-lg border border-gos-border bg-[#f8fafb] p-3.5 transition hover:border-gos-turquoise/45 hover:bg-white"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gos-turquoise shadow-sm"><Icon size={16} /></span><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-gos-muted">{label}</p><p className="mt-1 break-words text-sm font-extrabold leading-5 text-gos-blue-deep">{value}</p></div></div> }
function Field({ label, value, onChange, type = "text" }) { return <label className="block"><span className="mb-2 block text-xs font-extrabold text-gos-blue-deep">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-md border border-gos-border bg-white px-3 text-sm font-semibold text-gos-charcoal outline-none transition focus:border-gos-turquoise" /></label> }
