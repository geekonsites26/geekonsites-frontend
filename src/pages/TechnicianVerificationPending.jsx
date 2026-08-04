import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  FileCheck2,
  BadgeCheck,
  Home,
  Mail,
  Phone,
  UserCheck,
  ArrowRight,
  Sparkles,
  LockKeyhole,
} from "lucide-react"

export default function TechnicianVerificationPending() {
  const application = JSON.parse(
    localStorage.getItem("technicianApplication") || "{}"
  )

  const name = application?.name || "Technician"
  const email = application?.email || "application@gos-network.com"
  const phone = application?.phone || "+1 XXXXX XXXXX"
  const country = application?.country === "UK" ? "United Kingdom" : "United States"
  const skill = application?.skill || "Technical Support"

  const steps = [
    {
      title: "Application Submitted",
      desc: "Your technician profile has been received.",
      icon: CheckCircle2,
      status: "done",
    },
    {
      title: "Verification Review",
      desc: "Identity, documents and work eligibility are being checked.",
      icon: Clock3,
      status: "active",
    },
    {
      title: "Background Check",
      desc: "Our operations team will validate your technician profile.",
      icon: ShieldCheck,
      status: "pending",
    },
    {
      title: "Interview Call",
      desc: "An agent may contact you for final onboarding.",
      icon: Phone,
      status: "pending",
    },
    {
      title: "Approval",
      desc: "You will receive official GeekOnSite access.",
      icon: BadgeCheck,
      status: "pending",
    },
  ]

  const checklist = [
    "Identity document verification",
    "Email and mobile verification",
    "US/UK work eligibility review",
    "Skill and experience assessment",
    "Admin approval process",
    "Official @gos.com account creation",
  ]

  return (
    <div className="min-h-screen bg-[#020817] text-white px-5 py-8 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-500/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 blur-[140px] rounded-full" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(34,211,238,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.12)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-[#071122]/80 px-3 py-2 backdrop-blur-xl hover:bg-cyan-500/10 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Home className="w-4 h-4 text-cyan-300" />
          </div>

          <div>
            <p className="text-white text-sm font-semibold leading-none">
              GeekOnSite
            </p>
            <p className="text-cyan-300 text-[11px] mt-1">Home</p>
          </div>
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-10 mt-8 items-start">
          <motion.section
            initial={{ opacity: 0, x: -45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="bg-[#071122]/95 border border-cyan-500/20 rounded-[42px] p-8 md:p-10 shadow-2xl overflow-hidden relative">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-400/10 blur-3xl rounded-full" />

              <div className="w-24 h-24 rounded-[32px] bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>

              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mt-8">
                <Sparkles className="w-4 h-4 text-green-300" />
                <span className="text-green-300 text-sm font-semibold">
                  Application Successfully Submitted
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mt-7 leading-tight">
                Welcome to the
                <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text">
                  Verification Queue
                </span>
              </h1>

              <p className="text-cyan-100/60 text-lg mt-6 leading-relaxed">
                Thank you, {name}. Your GeekOnSite technician application has
                been submitted and is now awaiting verification by our operations
                team.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <InfoCard icon={Mail} label="Email" value={email} />
                <InfoCard icon={Phone} label="Mobile" value={phone} />
                <InfoCard icon={ShieldCheck} label="Country" value={country} />
                <InfoCard icon={UserCheck} label="Primary Skill" value={skill} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ["24-72 hrs", "Review Time", Clock3],
                ["Pending", "Current Status", ShieldCheck],
                ["@gos.com", "After Approval", LockKeyhole],
              ].map(([value, label, Icon]) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -5 }}
                  className="bg-[#071122] border border-cyan-500/10 rounded-3xl p-6"
                >
                  <Icon className="w-7 h-7 text-cyan-300" />
                  <h3 className="text-2xl font-bold mt-4">{value}</h3>
                  <p className="text-cyan-100/45 text-sm mt-1">{label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[32px] p-7">
              <h3 className="text-xl font-bold">What happens next?</h3>

              <p className="text-cyan-100/55 mt-3 leading-relaxed">
                Once approved, GeekOnSite will issue your official technician
                account like <span className="text-cyan-300">firstname.lastname@gos.com</span>.
                Only approved technicians can access the technician dashboard.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-[#071122]/95 border border-cyan-500/20 rounded-[42px] p-8 md:p-10 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-cyan-300 font-semibold text-sm">
                  TECHNICIAN APPLICATION STATUS
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  Verification in Progress
                </h2>

                <p className="text-cyan-100/50 mt-3">
                  Your reference ID has been generated successfully.
                </p>
              </div>

              <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <Clock3 className="w-8 h-8 text-yellow-300" />
              </div>
            </div>

            <div className="mt-8 bg-[#0b1628] border border-cyan-500/20 rounded-3xl p-6">
              <p className="text-cyan-100/40 text-sm">
                Technician Reference ID
              </p>

              <h2 className="text-3xl font-bold text-cyan-300 mt-2">
                TECH-{new Date().getFullYear()}-1045
              </h2>
            </div>

            <div className="mt-8 space-y-5">
              {steps.map((step, index) => {
                const Icon = step.icon

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`relative flex gap-4 rounded-3xl border p-5 ${
                      step.status === "done"
                        ? "bg-green-500/10 border-green-500/20"
                        : step.status === "active"
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : "bg-[#0b1628] border-white/10"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        step.status === "done"
                          ? "bg-green-500/10 text-green-300"
                          : step.status === "active"
                          ? "bg-yellow-500/10 text-yellow-300"
                          : "bg-cyan-500/10 text-cyan-300"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="font-bold">{step.title}</h3>
                      <p className="text-cyan-100/45 text-sm mt-1">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-8 bg-[#0b1628] border border-white/10 rounded-3xl p-7">
              <h3 className="text-xl font-bold mb-5">
                Verification Checklist
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {checklist.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <FileCheck2 className="w-5 h-5 text-cyan-300 shrink-0" />
                    <span className="text-cyan-100/65 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Link
                to="/"
                className="flex-1 bg-[#0b1628] border border-white/10 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-white/5 transition"
              >
                <Home className="w-5 h-5" />
                Go to Website
              </Link>

              <Link
                to="/technician-login"
                className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
              >
                Technician Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#0b1628] border border-white/10 rounded-3xl p-5">
      <Icon className="w-6 h-6 text-cyan-300" />
      <p className="text-cyan-100/40 text-sm mt-4">{label}</p>
      <p className="text-white font-semibold mt-1 break-words">{value}</p>
    </div>
  )
}