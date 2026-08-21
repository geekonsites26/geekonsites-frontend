import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, CalendarCheck, CheckCheck, CheckCircle2, ChevronRight, CreditCard, FileText, MapPin, Navigation, PlayCircle, RefreshCw, UserCheck, Video, Volume2, VolumeX } from "lucide-react"
import DashboardReturnLink from "../components/customer/DashboardReturnLink"
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../services/notificationService"

const eventStyle = (title = "") => {
  const value = title.toLowerCase()
  if (value.includes("created") || value.includes("booked")) return { icon: CalendarCheck, color: "bg-blue-50 text-gos-blue", label: "Booking" }
  if (value.includes("assigned") || value.includes("accepted")) return { icon: UserCheck, color: "bg-violet-50 text-violet-700", label: "Technician" }
  if (value.includes("on the way")) return { icon: Navigation, color: "bg-amber-50 text-amber-700", label: "Journey" }
  if (value.includes("arrived")) return { icon: MapPin, color: "bg-cyan-50 text-cyan-700", label: "Arrival" }
  if (value.includes("started")) return { icon: PlayCircle, color: "bg-indigo-50 text-indigo-700", label: "Service" }
  if (value.includes("remote") || value.includes("meeting")) return { icon: Video, color: "bg-fuchsia-50 text-fuchsia-700", label: "Remote" }
  if (value.includes("payment")) return { icon: CreditCard, color: "bg-emerald-50 text-emerald-700", label: "Payment" }
  if (value.includes("invoice")) return { icon: FileText, color: "bg-slate-100 text-slate-700", label: "Invoice" }
  if (value.includes("completed") || value.includes("closed")) return { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700", label: "Completed" }
  return { icon: Bell, color: "bg-gos-off-white text-gos-turquoise", label: "Update" }
}

const relativeTime = (dateValue) => {
  if (!dateValue) return "Recently"
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Recently"
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined })
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState("")
  const [muted, setMuted] = useState(localStorage.getItem("gos_notifications_muted") === "true")
  const [liveAlert, setLiveAlert] = useState(null)
  const knownIds = useRef(new Set())
  const feedInitialized = useRef(false)
  const mutedRef = useRef(muted)

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  const loadNotifications = useCallback(async (quiet = false) => {
    try {
      quiet ? setRefreshing(true) : setLoading(true)
      setError("")
      const data = await getMyNotifications()
      const items = Array.isArray(data) ? data : []
      const newItems = feedInitialized.current ? items.filter((item) => !knownIds.current.has(item.id)) : []
      knownIds.current = new Set(items.map((item) => item.id))
      feedInitialized.current = true
      setNotifications(items)
      setLastUpdated(new Date())

      if (newItems.length && !mutedRef.current) {
        setLiveAlert(newItems[0])
        if (navigator.vibrate) navigator.vibrate([100, 60, 100])
      }
    } catch (loadError) {
      setError(loadError?.message || "Notifications could not be loaded.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!liveAlert) return undefined
    const timer = window.setTimeout(() => setLiveAlert(null), 5500)
    return () => window.clearTimeout(timer)
  }, [liveAlert])

  useEffect(() => {
    loadNotifications()
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadNotifications(true)
    }, 30000)
    const onVisible = () => { if (document.visibilityState === "visible") loadNotifications(true) }
    document.addEventListener("visibilitychange", onVisible)
    const onPush = () => loadNotifications(true)
    window.addEventListener("gos:push-received", onPush)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("gos:push-received", onPush)
    }
  }, [loadNotifications])

  const unread = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("gos:notifications-updated", { detail: { unread } }))
  }, [unread])

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item))
      try { await markNotificationAsRead(notification.id) } catch { loadNotifications(true) }
    }
    navigate(notification.actionUrl || "/customer-dashboard?view=bookings")
  }

  const markAllRead = async () => {
    if (!unread) return
    const previous = notifications
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    try {
      const updated = await markAllNotificationsAsRead()
      if (Array.isArray(updated)) setNotifications(updated)
    } catch (readError) {
      setNotifications(previous)
      setError(readError?.message || "Notifications could not be updated.")
    }
  }

  const toggleMuted = () => {
    const next = !muted
    setMuted(next)
    if (next) setLiveAlert(null)
    localStorage.setItem("gos_notifications_muted", String(next))
  }

  return (
    <main className="min-h-screen bg-[#edf2f5] pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top))] text-gos-charcoal sm:pt-[calc(4rem+env(safe-area-inset-top))]">
      {liveAlert && <button type="button" onClick={() => { const alertItem = liveAlert; setLiveAlert(null); openNotification(alertItem) }} className="fixed left-3 right-3 top-[calc(4rem+env(safe-area-inset-top))] z-[80] mx-auto flex max-w-md items-start gap-3 rounded-md border border-gos-turquoise/30 bg-white p-4 text-left shadow-[var(--gos-shadow-md)]" role="alert"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf7f5] text-gos-turquoise"><Bell size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-extrabold text-gos-blue-deep">{liveAlert.title || "Service update"}</strong><span className="mt-1 line-clamp-2 block text-xs font-semibold leading-5 text-gos-charcoal">{liveAlert.message}</span></span><ChevronRight size={16} className="mt-2 shrink-0 text-gos-muted" /></button>}
      <section className="border-b border-gos-border bg-white">
        <div className="mx-auto max-w-4xl px-4 pb-5 pt-2 sm:px-6 sm:pb-7">
          <DashboardReturnLink force className="-ml-2 mb-1" />
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gos-turquoise">Customer activity</p><h1 className="mt-1 font-['Cormorant_Garamond'] text-4xl font-bold leading-none text-gos-blue-deep sm:text-5xl">Notifications</h1><p className="mt-2 text-sm font-semibold text-gos-muted">{unread ? `${unread} unread service update${unread === 1 ? "" : "s"}` : "You are all caught up"}{lastUpdated && <span className="block text-[10px] font-bold text-gos-muted/70">Updated {relativeTime(lastUpdated)}</span>}</p></div>
            <button type="button" onClick={() => loadNotifications(true)} disabled={refreshing} className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-gos-border bg-white px-3 text-xs font-extrabold text-gos-blue disabled:opacity-50" aria-label="Refresh notifications"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /><span>{refreshing ? "Updating" : "Refresh"}</span></button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-gos-border bg-white px-3 py-2.5 shadow-[var(--gos-shadow-sm)]">
          <button type="button" onClick={toggleMuted} aria-pressed={muted} className="flex min-h-10 min-w-0 items-center gap-2 text-left text-xs font-extrabold text-gos-blue-deep">{muted ? <VolumeX size={16} className="shrink-0 text-gos-muted" /> : <Volume2 size={16} className="shrink-0 text-gos-turquoise" />}<span className="min-w-0"><span className="block">Mute live alerts</span><span className="block text-[9px] font-bold text-gos-muted">Notifications stay in your feed</span></span><span className={`relative ml-1 h-6 w-10 shrink-0 rounded-full transition ${muted ? "bg-gos-blue-deep" : "bg-gos-border"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${muted ? "left-5" : "left-1"}`} /></span></button>
          <button type="button" onClick={markAllRead} disabled={!unread} className="flex min-h-9 items-center gap-2 px-2 text-xs font-extrabold text-gos-turquoise disabled:text-gos-muted/45"><CheckCheck size={16} /> Mark all read</button>
        </div>

        {error && <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        {loading ? <LoadingFeed /> : notifications.length ? <section className="overflow-hidden rounded-md border border-gos-border bg-white shadow-[var(--gos-shadow-sm)]" aria-label="Notification activity">
          {notifications.map((notification) => {
            const style = eventStyle(notification.title)
            const Icon = style.icon
            return <button key={notification.id} type="button" onClick={() => openNotification(notification)} className={`relative flex w-full items-start gap-3 border-b border-gos-border px-3 py-4 text-left transition last:border-b-0 hover:bg-gos-off-white sm:gap-4 sm:px-5 ${notification.isRead ? "bg-white" : "bg-[#f4fbfa]"}`}>
              {!notification.isRead && <span className="absolute left-0 top-0 h-full w-0.5 bg-gos-turquoise" />}
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.color}`}><Icon size={18} /></span>
              <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><strong className="text-sm font-extrabold text-gos-blue-deep">{notification.title || "Service update"}</strong><time className="shrink-0 text-[10px] font-bold text-gos-muted">{relativeTime(notification.createdAt)}</time></span><span className="mt-1 block text-xs font-semibold leading-5 text-gos-charcoal">{notification.message || "Your booking has a new update."}</span><span className="mt-2 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-gos-turquoise">{style.label} <ChevronRight size={12} /></span></span>
            </button>
          })}
        </section> : <div className="rounded-md border border-dashed border-gos-border bg-white px-5 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gos-off-white text-gos-turquoise"><Bell size={22} /></span><h2 className="mt-4 font-['Cormorant_Garamond'] text-3xl font-bold text-gos-blue-deep">No updates yet.</h2><p className="mt-2 text-sm font-semibold text-gos-muted">Booking and technician activity will appear here automatically.</p></div>}
      </div>
    </main>
  )
}

function LoadingFeed() {
  return <div className="overflow-hidden rounded-md border border-gos-border bg-white">{[1, 2, 3].map((item) => <div key={item} className="flex gap-3 border-b border-gos-border p-4 last:border-b-0"><span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gos-border" /><span className="flex-1"><span className="block h-3 w-2/5 animate-pulse rounded bg-gos-border" /><span className="mt-3 block h-3 w-4/5 animate-pulse rounded bg-gos-off-white" /></span></div>)}</div>
}
