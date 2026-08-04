import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wrench,
  BriefcaseBusiness,
  Edit3,
  Activity,
  X,
  Save,
} from "lucide-react"

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("gos_user") || "null")
  const authRole =
  localStorage.getItem("gos_role") ||
  user?.role ||
  ""

  const customer = authRole === "CUSTOMER"
  const technician = authRole === "TECHNICIAN"
  const agent = authRole === "AGENT"
  const role = customer ? "Customer" : technician ? "Technician" : agent ? "Agent" : ""

  const storageNameKey = customer
    ? "customerName"
    : technician
    ? "technicianName"
    : agent
    ? "agentName"
    : ""

  const storageEmailKey = customer
    ? "customerEmail"
    : technician
    ? "technicianGosEmail"
    : agent
    ? "agentEmail"
    : ""

  const initialName =
  user?.fullName ||
  user?.name ||
  localStorage.getItem(storageNameKey) ||
  role ||
  "User"

const initialEmail =
  user?.email ||
  localStorage.getItem(storageEmailKey) ||
  ""

  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [phone, setPhone] = useState(
    localStorage.getItem("gos_profile_phone") || ""
  )
  const [editOpen, setEditOpen] = useState(false)

  const data = customer
    ? {
        role: "Customer",
        dashboard: "/customer-dashboard",
        status: "Active Customer",
        id: "GOS-CUS-1048",
        icon: User,
        stats: [
          ["Bookings", "12"],
          ["Completed", "10"],
          ["Rating", "4.9"],
          ["Support", "24/7"],
        ],
        actions: [
          ["My Bookings", "/my-bookings", CalendarCheck],
          ["Notifications", "/notifications", Bell],
          ["Support", "/contact", Headphones],
          ["Dashboard", "/customer-dashboard", Activity],
        ],
      }
    : technician
    ? {
        role: "Technician",
        dashboard: "/technician-dashboard",
        status: "Approved Technician",
        id: "GOS-TEC-2048",
        icon: Wrench,
        stats: [
          ["Jobs", "34"],
          ["Completed", "31"],
          ["Rating", "4.8"],
          ["Status", "Online"],
        ],
        actions: [
          ["Assigned Jobs", "/technician-dashboard", Wrench],
          ["Availability", "/technician-dashboard", MapPin],
          ["Notifications", "/notifications", Bell],
          ["Support", "/contact", Headphones],
        ],
      }
    : agent
    ? {
        role: "Agent",
        dashboard: "/agent-dashboard",
        status: "Operations Active",
        id: "GOS-AGT-3048",
        icon: BriefcaseBusiness,
        stats: [
          ["Customers", "128"],
          ["Bookings", "52"],
          ["Assigned", "46"],
          ["SLA", "96%"],
        ],
        actions: [
          ["Customers", "/agent-dashboard", User],
          ["Live Bookings", "/agent-dashboard", Activity],
          ["Notifications", "/notifications", Bell],
          ["Support", "/contact", Headphones],
        ],
      }
    : null

  const saveProfile = () => {
    if (storageNameKey) localStorage.setItem(storageNameKey, name)
    if (storageEmailKey) localStorage.setItem(storageEmailKey, email)
    localStorage.setItem("gos_profile_phone", phone)
    const updatedUser = {
  ...user,
  fullName: name,
  name,
  email,
}

localStorage.setItem("gos_user", JSON.stringify(updatedUser))
    setEditOpen(false)
    window.location.reload()
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050B12] px-4 pt-24 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-[#071122] p-8 text-center">
          <h1 className="text-2xl font-black">Please login first</h1>

          <Link
            to="/customer-login"
            className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050B12] px-4 pt-[110px] pb-24 text-white">
      {editOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#071122] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-cyan-300">
                  Account Settings
                </p>
                <h2 className="text-2xl font-black">Edit Profile</h2>
              </div>

              <button
                onClick={() => setEditOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Full Name" value={name} onChange={setName} />
              <Field label="Email Address" value={email} onChange={setEmail} />
              <Field label="Phone Number" value={phone} onChange={setPhone} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 py-3 text-sm font-black text-black"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <Link
          to={data.dashboard}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071122] shadow-2xl">
          <div className="relative p-5 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.10),transparent_35%)]" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl font-black text-black">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-black text-cyan-300">
                    {data.role} Profile
                  </p>

                  <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                    {name}
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    {data.id} • {data.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-black text-black"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:p-8 md:grid-cols-3">
            <Info icon={Mail} label="Email" value={email} />
            <Info icon={Phone} label="Phone" value={phone || "Not added yet"} />
            <Info
              icon={MapPin}
              label="Service Region"
              value={localStorage.getItem("gos_location") || "US"}
            />
          </div>

          <div className="px-5 pb-5 sm:px-8 sm:pb-8">
            <h2 className="text-xl font-black">Account Overview</h2>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {data.stats.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <h3 className="mt-2 text-2xl font-black">{value}</h3>
                </div>
              ))}
            </div>

            <h2 className="mt-8 text-xl font-black">Quick Actions</h2>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {data.actions.map(([label, path, Icon]) => (
                <Link
                  key={label}
                  to={path}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 hover:border-cyan-400/40"
                >
                  <Icon className="h-6 w-6 text-cyan-300" />
                  <p className="mt-4 text-sm font-black">{label}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-cyan-300" />

                <div>
                  <h3 className="font-black">Verified Account</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Your GeekOnSites account is secure and verified for platform
                    access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <Icon className="h-5 w-5 text-cyan-300" />
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-200">{value}</p>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
      />
    </div>
  )
}