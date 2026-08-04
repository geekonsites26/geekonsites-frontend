import {
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"

import {
  FaGlobe,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa"
import { motion } from "framer-motion"
import logo from "../../assets/logo.png"

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#04070D] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        {/* DESKTOP FOOTER */}
        <div className="hidden md:block pt-24 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative mb-16 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl lg:p-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-[#D4AF37]/10" />

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                  <Sparkles size={16} />
                  PREMIUM TECH SUPPORT
                </div>

                <h2 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                  Ready To Book Your Tech Service?
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
                  Professional doorstep support for laptop repair, WiFi setup,
                  CCTV installation and business IT services.
                </p>
              </div>

              <button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-semibold shadow-xl shadow-cyan-500/20">
                Book a Service
              </button>
            </div>
          </motion.div>

          <div className="grid gap-12 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4">
                <img src={logo} alt="GOS Logo" className="h-16 w-auto object-contain" />
                <div>
               
                </div>
              </div>

              <p className="mt-7 max-w-md text-sm leading-relaxed text-gray-400">
                GOS provides premium tech support services with trusted
                technicians, live booking flow, technician assignment and
                professional doorstep service experience.
              </p>

              <div className="mt-7 flex items-center gap-4">
               <Social
  icon={FaGlobe}
  href="https://geekonsites.com"
/>

<Social
  icon={FaInstagram}
  href="https://www.instagram.com/geekonsites?igsh=MWJpNHBscmRsNWtlaA=="
/>

<Social
  icon={FaFacebookF}
  href="https://www.facebook.com/share/17hKaHpxUQ/"
/>

<Social
  icon={FaLinkedinIn}
  href="https://www.linkedin.com/in/geekonsites-77373840b?utm_source=share_via&utm_content=profile&utm_medium=member_android"
/>
              </div>
            </div>

            <FooterColumn
              title="Quick Links"
              items={["Home", "About Us", "Services", "Contact", "Book Service"]}
            />

            <FooterColumn
              title="Services"
              items={[
                "Laptop Repair",
                "Printer Setup",
                "WiFi & Network",
                "CCTV Installation",
                "Business IT",
              ]}
            />

            <div>
              <h3 className="mb-6 text-lg font-semibold">Contact</h3>

              <div className="space-y-5 text-sm text-gray-400">
                <Info icon={MapPin} text="United States & United Kingdom Coverage" />
                <Info icon={Mail} text="support@gos.com" />
                <Info icon={Phone} text="+1 (818) 934-4380" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-5 pt-8 text-sm text-gray-500 lg:flex-row">
            <p>© 2026 GeekOnSites. All rights reserved.</p>

            <div className="flex flex-wrap items-center gap-6">
              <button className="transition hover:text-white">Privacy Policy</button>
              <button className="transition hover:text-white">Terms & Conditions</button>
              <button className="transition hover:text-white">Cookies</button>
              <button className="transition hover:text-white">Support</button>
            </div>
          </div>
        </div>

        {/* MOBILE APP FOOTER */}
        <div className="md:hidden border-t border-white/10 py-7 text-center">
          <div className="flex items-center justify-center gap-3">
             <img src={logo} alt="GOS Logo" className="h-10 w-auto object-contain" />
            
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <button>Privacy</button>
            <span>•</span>
            <button>Terms</button>
            <span>•</span>
            <button>Support</button>
          </div>

          <p className="mt-5 text-xs text-slate-600">
            © 2026 GeekOnSites
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold">{title}</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <FooterLink key={item} text={item} />
        ))}
      </div>
    </div>
  )
}

function Social({ icon: Icon, href }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -5, scale: 1.08 }}
      className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-cyan-500/10"
    >
      <Icon
        size={19}
        className="text-gray-400 transition group-hover:text-cyan-300"
      />
    </motion.a>
  )
}

function FooterLink({ text }) {
  return (
    <button className="group flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
      <ArrowUpRight size={15} className="transition group-hover:text-cyan-300" />
      {text}
    </button>
  )
}

function Info({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <Icon size={17} className="text-cyan-300" />
      </div>

      <p className="leading-relaxed">{text}</p>
    </div>
  )
}