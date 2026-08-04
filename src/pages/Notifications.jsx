import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Bell, VolumeX, Settings } from "lucide-react"
import { getMyNotifications } from "../services/notificationService"

export default function Notifications() {
  const [enabled, setEnabled] = useState(
    localStorage.getItem("gos_notifications_enabled") !== "false"
  )
  const [muted, setMuted] = useState(
    localStorage.getItem("gos_notifications_muted") === "true"
  )
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await getMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const dashboard = "/customer-dashboard"

  const toggleEnabled = () => {
    const value = !enabled
    setEnabled(value)
    localStorage.setItem("gos_notifications_enabled", String(value))
  }

  const toggleMuted = () => {
    const value = !muted
    setMuted(value)
    localStorage.setItem("gos_notifications_muted", String(value))
  }

  return (
    <div className="min-h-screen bg-[#050B12] px-4 pb-40 pt-[100px] text-white sm:pt-[150px]">
      <div className="mx-auto max-w-5xl">
        <Link
          to={dashboard}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071122] shadow-2xl">
          <div className="relative p-5 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.10),transparent_35%)]" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10">
                  <Bell className="h-8 w-8 text-cyan-300" />
                </div>

                <div>
                  <p className="text-sm font-black text-cyan-300">
                    Notification Center
                  </p>
                  <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                    Latest Updates
                  </h1>
                </div>
              </div>

              <button
                onClick={loadNotifications}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="border-y border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <SettingCard
                icon={Bell}
                title="Notifications"
                desc="Receive booking, payment and technician updates."
                active={enabled}
                onClick={toggleEnabled}
                labelOn="On"
                labelOff="Off"
              />

              <SettingCard
                icon={VolumeX}
                title="Mute Alerts"
                desc="Silence notification sounds and pop-up alerts."
                active={muted}
                onClick={toggleMuted}
                labelOn="Muted"
                labelOff="Active"
              />
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black">Activity Timeline</h2>
            </div>

            {enabled ? (
              loading ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
                  <p className="font-bold text-cyan-300">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 ${
                        muted ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
                        <Bell className="h-6 w-6 text-cyan-300" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="font-black">
                            {notification.title || "Notification"}
                          </h4>

                          <p className="text-xs text-slate-500">
                            {notification.createdAt
                              ? new Date(notification.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {notification.message || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
                  <Bell className="mx-auto h-10 w-10 text-slate-500" />
                  <h3 className="mt-4 text-xl font-black">No Notifications</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    You don't have any notifications yet.
                  </p>
                </div>
              )
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
                <Bell className="mx-auto h-10 w-10 text-slate-500" />
                <h3 className="mt-4 text-xl font-black">
                  Notifications are turned off
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Turn them on to receive booking, payment, technician and service updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingCard({
  icon: Icon,
  title,
  desc,
  active,
  onClick,
  labelOn,
  labelOff,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Icon className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <h3 className="font-black">{title}</h3>
            <p className="mt-1 text-sm leading-5 text-slate-400">{desc}</p>
          </div>
        </div>

        <button
          onClick={onClick}
          className={`relative h-7 w-13 rounded-full border transition ${
            active
              ? "border-cyan-400/40 bg-cyan-400/20"
              : "border-white/10 bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full transition ${
              active ? "right-1 bg-cyan-300" : "left-1 bg-slate-500"
            }`}
          />
        </button>
      </div>

      <p
        className={`mt-4 text-xs font-black ${
          active ? "text-cyan-300" : "text-slate-500"
        }`}
      >
        {active ? labelOn : labelOff}
      </p>
    </div>
  )
}