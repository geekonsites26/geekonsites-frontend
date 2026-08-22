import SEO from "../components/common/SEO"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getLocation } from "../utils/location"
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Laptop,
  Wifi,
  Printer,
  Server,
  Camera,
  Home,
  Star,
  Clock,
  Headphones,
  HardDrive,
  MousePointer2,
  BriefcaseBusiness,
  ChevronDown,
} from "lucide-react"

const remoteServices = [
  ["PC Health Check & Diagnosis", "$29", "£25"],
  ["Virus & Malware Removal", "$79", "£69"],
  ["Slow PC Optimization", "$59", "£49"],
  ["Windows Troubleshooting", "$69", "£59"],
  ["Printer Setup & Configuration", "$49", "£39"],
  ["Email Setup & Fixes", "$39", "£35"],
  ["Software Installation", "$39", "£35"],
  ["Microsoft Office Setup", "$49", "£39"],
  ["Driver Installation", "$39", "£35"],
  ["Wi-Fi & Network Troubleshooting", "$69", "£59"],
  ["Password Recovery Assistance", "$49", "£39"],
  ["Data Backup Configuration", "$59", "£49"],
  ["New PC Setup (Remote)", "$99", "£89"],
]

const mostBooked = [
  ["Virus & Malware Removal", "$79", "£69", ShieldCheck],
  ["New PC Setup (Remote)", "$99", "£89", Laptop],
  ["Wi-Fi & Network Troubleshooting", "$69", "£59", Wifi],
  ["Printer Setup & Configuration", "$49", "£39", Printer],
]

const onsiteServices = [
  ["Laptop Repair", "Technician visit for diagnostics, repair and setup.", Laptop, "Laptop Repair"],
  ["Desktop Repair", "Hardware, software and performance repair.", Laptop, "Computer Repair"],
  ["CCTV Installation", "Camera installation, DVR/NVR and monitoring setup.", Camera, "CCTV Installation"],
  ["Router Setup", "Router installation, secure Wi-Fi and coverage setup.", Wifi, "WiFi / Router Setup"],
  ["Smart Home Setup", "Smart TV, Alexa, Google Home and smart doorbell setup.", Home, "Smart Home Setup"],
  ["Business IT Support", "Office IT, server, network and managed support.", Server, "Business IT Support"],
]

const businessServices = [
  ["Managed IT Services", "Monthly IT support for small offices.", BriefcaseBusiness],
  ["Cloud Support", "Cloud setup, migration and account support.", Server],
  ["Server Setup", "Small business server and access configuration.", Server],
  ["Office Networking", "Routers, switches, cabling and Wi-Fi planning.", Wifi],
  ["Business Security", "Security software, backups and device protection.", ShieldCheck],
]

const bundles = [
  {
    name: "PC Protection Bundle",
    price: "$99",
    ukPrice: "£85",
    icon: ShieldCheck,
    items: [
      "Antivirus installation",
      "Malware scan",
      "Windows optimization",
      "Security check",
    ],
  },
  {
    name: "New Computer Setup",
    price: "$149",
    ukPrice: "£129",
    icon: Laptop,
    items: [
      "Data transfer",
      "Printer connection",
      "Email configuration",
      "Software updates",
      "Basic user guidance",
    ],
  },
  {
    name: "Work-from-Home Bundle",
    price: "$199",
    ukPrice: "£169",
    icon: BriefcaseBusiness,
    items: [
      "Webcam setup",
      "Headset installation",
      "Wi-Fi optimization",
      "Printer configuration",
      "Security software installation",
    ],
  },
]

const products = [
  ["Networking", "Routers, Wi-Fi extenders, mesh Wi-Fi, switches", Wifi],
  ["Printer & Office", "Printer cables, HDMI, Ethernet, surge protectors", Printer],
  ["Storage", "SSD, USB drives, external hard drives", HardDrive],
  ["Accessories", "Mouse, keyboard, webcam, headset, laptop stand", MousePointer2],
  ["Antivirus", "Norton, McAfee, Bitdefender, ESET, Trend Micro", ShieldCheck],
]

const brands = [
  "HP",
  "Dell",
  "Lenovo",
  "ASUS",
  "Acer",
  "Apple",
  "Intel",
  "AMD",
  "Canon",
  "Epson",
  "Brother",
  "Microsoft",
]

const policies = [
  "Free quote before work begins.",
  "No fix, no fee for most software issues.",
  "Hardware parts are billed separately unless otherwise stated.",
  "Remote support available 24/7 by appointment.",
  "Emergency same-day on-site service available with an additional surcharge.",
]

const faqs = [
  {
    q: "Do you provide both remote and on-site support?",
    a: "Yes. Remote services are available by appointment, and on-site technician visits are available for supported USA and UK service areas.",
  },
  {
    q: "Will I get a quote before the work starts?",
    a: "Yes. GeekOnSites shows a starting price and provides a quote before work begins.",
  },
  {
    q: "Are hardware parts included in the service price?",
    a: "No. Hardware parts such as SSDs, batteries, cables or printers are billed separately unless specifically included in a bundle.",
  },
  {
    q: "What happens after I book a service?",
    a: "After booking and payment, the system moves to technician assignment, then service tracking, technician assigned, and remote or on-site support.",
  },
  {
    q: "Can businesses use GeekOnSites?",
    a: "Yes. Small offices can book networking, cloud support, server setup, managed IT services and security support.",
  },
]

const catalogViews = [
  { id: "services", label: "Services", icon: Headphones, eyebrow: "Service catalog", title: "Choose the support that fits.", description: "Compare remote, on-site, and business support with clear starting prices and direct booking." },
  { id: "bundles", label: "Bundles", icon: ShieldCheck, eyebrow: "Combined support", title: "More covered in one booking.", description: "Select a focused package for protection, new-device setup, or a complete work-from-home configuration." },
  { id: "products", label: "Products", icon: HardDrive, eyebrow: "Recommended equipment", title: "The right additions for the job.", description: "Review practical accessories, storage, networking equipment, and commonly supported device brands." },
  { id: "info", label: "Support info", icon: CheckCircle2, eyebrow: "Booking confidence", title: "Clear terms before you begin.", description: "Understand pricing policies, service expectations, and answers to common customer questions." },
]

export default function Services() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("remote")
  const [catalogView, setCatalogView] = useState("services")
  const [openFaq, setOpenFaq] = useState(0)
 const [location, setLocation] = useState(
  getLocation().code
)

useEffect(() => {
  const updateLocation = () => {
    setLocation(getLocation().code)
  }

  window.addEventListener("gos-location-changed", updateLocation)

  return () =>
    window.removeEventListener(
      "gos-location-changed",
      updateLocation
    )
}, [])

  const filteredRemoteServices = remoteServices
  const activeCatalog = catalogViews.find(({ id }) => id === catalogView) || catalogViews[0]

  const bookService = (name, usaPrice = "", ukPrice = "", category = "") => {
    navigate("/book-service", {
      state: {
        serviceType: name,
        serviceCategory: category,
        usaPrice,
        ukPrice,
      },
    })
  }

  return (
    <div className="gos-services-page min-h-screen bg-gos-off-white pb-24 text-gos-charcoal" data-catalog-view={catalogView}>
      <SEO title="Services | GeekOnSites" description="Explore professional remote support, on-site technology service and business IT solutions from GeekOnSites." />
      <section className="relative flex min-h-[33rem] overflow-hidden px-4 pb-10 pt-24 sm:min-h-[35rem] sm:px-6 sm:pb-12 sm:pt-28 lg:px-10">
        <img src="/images/services/computer-support.webp?v=1" alt="Professional computer support service" className="absolute inset-0 h-full w-full object-cover object-[center_58%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,13,29,0.9)_0%,rgba(3,13,29,0.7)_48%,rgba(3,13,29,0.12)_100%)] max-md:bg-[linear-gradient(180deg,rgba(3,13,29,0.12)_0%,rgba(3,13,29,0.76)_52%,rgba(3,13,29,0.94)_100%)]" />
        <div className="relative mx-auto flex w-full max-w-7xl items-end lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-200 sm:text-xs">
              <span className="h-px w-8 bg-yellow-300" /><MapPin size={15} /> Available across USA & UK
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[clamp(3.2rem,7vw,6.4rem)] font-bold leading-[0.88] tracking-normal text-white">
              Technology services,<span className="block italic text-cyan-300">built around you.</span>
            </h1>
            <p className="mt-6 max-w-2xl font-['Cormorant_Garamond'] text-xl font-semibold leading-8 text-white/90 sm:text-2xl">
              Remote expertise, professional on-site visits, and dependable business IT support in one clear service experience.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => bookService("PC Health Check & Diagnosis", "$29", "Â£25", "Remote Support")} className="min-h-12 rounded-md bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300">Book Service</button>
              <button onClick={() => document.getElementById("service-tabs")?.scrollIntoView({ behavior: "smooth" })} className="min-h-12 rounded-md border border-white/55 px-6 py-3 font-black text-white transition hover:bg-white hover:text-slate-950">Browse Services</button>
            </div>
          </motion.div>
        </div>
      </section>

      <nav className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 border-y border-gos-border bg-white/95 px-4 py-2 backdrop-blur-md sm:top-[calc(4rem+env(safe-area-inset-top))] sm:px-6 lg:px-10" aria-label="Service catalog sections">
        <div className="gos-hide-scrollbar mx-auto flex max-w-7xl snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain sm:grid sm:grid-cols-4 sm:gap-1" role="tablist" aria-label="Service categories">
          {catalogViews.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={catalogView === id} onClick={() => setCatalogView(id)} className={`flex min-h-11 min-w-[7.5rem] shrink-0 snap-start items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-xs font-extrabold sm:min-w-0 sm:px-2 sm:text-sm ${catalogView === id ? "bg-gos-blue-deep text-white" : "border border-gos-border text-gos-blue-deep hover:bg-gos-off-white sm:border-transparent"}`}>
              <Icon size={15} className="shrink-0" /> <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <section className="gos-catalog-intro border-b border-gos-border bg-white px-4 py-7 sm:px-6 sm:py-9 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <motion.div key={activeCatalog.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-turquoise">{activeCatalog.eyebrow}</p>
            <h2 className="mt-2 max-w-2xl font-['Cormorant_Garamond'] text-[2.3rem] font-bold leading-[0.96] text-gos-blue-deep sm:text-5xl">{activeCatalog.title}</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-gos-charcoal sm:text-base">{activeCatalog.description}</p>
          </motion.div>
          <div className="grid grid-cols-3 border-y border-gos-border lg:min-w-[28rem]">
            {[[ShieldCheck, "Verified", "Professionals"], [Clock, "Clear", "Scheduling"], [MapPin, "US & UK", "Coverage"]].map(([Icon, value, label], index) => (
              <div key={label} className={`px-2 py-3 text-center sm:px-4 ${index ? "border-l border-gos-border" : ""}`}>
                <Icon size={17} className="mx-auto text-gos-turquoise" />
                <p className="mt-1.5 text-xs font-extrabold text-gos-blue-deep sm:text-sm">{value}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-gos-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hidden relative overflow-hidden px-4 pt-28 pb-12 sm:px-6 lg:px-10">
        <div className="absolute left-[-160px] top-[-160px] h-[380px] w-[380px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute right-[-140px] top-[140px] h-[340px] w-[340px] rounded-full bg-yellow-400/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <MapPin size={16} />
              Available across USA & UK
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Professional IT support
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-yellow-300 bg-clip-text text-transparent">
                for homes & businesses.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Book remote support, on-site technician visits, antivirus setup,
              printer support, Wi-Fi troubleshooting, business IT solutions,
              bundles and recommended products.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950/75 px-4 py-3">
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  bookService("PC Health Check & Diagnosis", "$29", "£25", "Remote Support")
                }
                className="rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.25)] hover:bg-cyan-300"
              >
                Book Service
              </button>
              <button
                onClick={() => document.getElementById("service-tabs")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-4 font-black text-white hover:bg-white/[0.1]"
              >
                Browse Services
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-[1.5rem] border border-cyan-400/20 bg-slate-950/75 p-5">
              <h3 className="text-2xl font-black">
                <span className="text-yellow-300">GOS</span> Service Desk
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Select service → get quote → pay → technician assigned
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["24/7", "Remote", Headphones],
                  ["4.9", "Rating", Star],
                  ["US/UK", "Coverage", Clock],
                ].map(([value, label, Icon]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <Icon className="mb-3 text-cyan-300" size={19} />
                    <p className="font-black">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-bold text-white">Built for conversion</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Remote support, on-site booking, bundles, business services,
                  and product recommendations in one page.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionTitle group="services" badge="Most Booked" title="High-demand services" />

      <section className="gos-catalog-panel catalog-services px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mostBooked.map(([name, us, uk, Icon]) => (
            <button
              key={name}
              onClick={() => bookService(name, us, uk, "Most Booked")}
              className="group rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 text-left shadow-xl transition hover:-translate-y-1 hover:border-cyan-300/40"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                <Icon size={24} />
              </div>
              <h3 className="font-black">{name}</h3>
              <p className="mt-2 text-sm text-slate-400">
                Starts {location === "US" ? us : uk}
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm font-bold text-cyan-300">
                Book now <ArrowRight size={16} />
              </p>
            </button>
          ))}
        </div>
      </section>

      <section id="service-tabs" className="gos-catalog-panel catalog-services px-4 pb-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-2 sm:grid-cols-3">
            {[
              ["remote", "Remote Support", Headphones],
              ["onsite", "On-Site Service", Laptop],
              ["business", "Business IT", BriefcaseBusiness],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                  activeTab === id
                    ? "bg-gos-blue-deep text-white"
                    : "text-slate-300 hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeTab === "remote" && (
        <>
          <SectionTitle group="services" badge="Remote Support" title="Remote help and clear pricing" />
          <section className="gos-catalog-panel catalog-services px-4 pb-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl backdrop-blur-xl">
              <div className="hidden grid-cols-[1fr_130px_130px_150px] border-b border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-black text-slate-300 md:grid">
                <p>Service</p>
                <p>USA Price</p>
                <p>UK Price</p>
                <p></p>
              </div>

              {filteredRemoteServices.map(([name, us, uk]) => (
                <div
                  key={name}
                  className="grid gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[1fr_130px_130px_150px] md:items-center"
                >
                  <div>
                    <p className="font-black">{name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Remote technician support by appointment
                    </p>
                  </div>
                  <p className="font-bold text-cyan-300">
  {location === "US" ? us : uk}
</p>

<p className="text-sm text-slate-500">
  {location === "US" ? "United States" : "United Kingdom"}
</p>
                  <button
                    onClick={() => bookService(name, us, uk, "Remote Support")}
                    className="rounded-md bg-gos-blue-deep px-4 py-3 text-sm font-black text-white transition hover:bg-gos-blue"
                  >
                    Add to booking
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "onsite" && (
        <>
          <SectionTitle group="services" badge="On-Site Support" title="Professional help at your location" />
          <section className="gos-catalog-panel catalog-services px-4 pb-10 sm:px-6 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {onsiteServices.map(([name, desc, Icon, bookingCategory]) => (
                <button
                  key={name}
                  onClick={() => bookService(name, "", "", bookingCategory)}
                  className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-400/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-black">{name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                  <p className="mt-4 flex items-center gap-2 text-sm font-bold text-cyan-300">
                    Add to booking <ArrowRight size={16} />
                  </p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "business" && (
        <>
          <SectionTitle group="services" badge="Business IT" title="Reliable support for your business" />
          <section className="gos-catalog-panel catalog-services px-4 pb-10 sm:px-6 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {businessServices.map(([name, desc, Icon]) => (
                <button
                  key={name}
                  onClick={() => bookService(name, "", "", "Business IT Support")}
                  className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-400/10"
                >
                  <Icon className="mb-4 text-cyan-300" size={25} />
                  <h3 className="font-black">{name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                  <p className="mt-4 flex items-center gap-2 text-sm font-bold text-cyan-300">Add to booking <ArrowRight size={16} /></p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <SectionTitle group="bundles" badge="Service Bundles" title="Complete support in one booking" />

      <section className="gos-catalog-panel catalog-bundles px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const Icon = bundle.icon
            return (
              <div
                key={bundle.name}
                className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-xl"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-300">
                    <Icon size={26} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-cyan-300">
  {location === "US"
    ? bundle.price
    : bundle.ukPrice}
</p>
                  </div>
                </div>

                <h3 className="text-xl font-black">{bundle.name}</h3>

                <div className="mt-5 space-y-3">
                  {bundle.items.map((item) => (
                    <p key={item} className="flex gap-3 text-sm text-slate-300">
                      <CheckCircle2 size={17} className="shrink-0 text-cyan-300" />
                      {item}
                    </p>
                  ))}
                </div>

                <button
                  onClick={() =>
                    bookService(bundle.name, bundle.price, bundle.ukPrice, "Service Bundle")
                  }
                  className="mt-6 w-full rounded-md bg-gos-blue-deep px-5 py-3.5 font-black text-white hover:bg-gos-blue"
                >
                  Add to booking
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <SectionTitle group="products" badge="Equipment Support" title="Add equipment help to your booking" />

      <section className="gos-catalog-panel catalog-products px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {products.map(([title, desc, Icon]) => (
            <button
              key={title}
              onClick={() => bookService(`${title} Product Recommendation`, "", "", "Product Add-on")}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.075]"
            >
              <Icon className="mb-4 text-cyan-300" size={25} />
              <h3 className="font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
              <p className="mt-4 text-sm font-bold text-cyan-300">
                Add to booking
              </p>
            </button>
          ))}
        </div>
      </section>

      <SectionTitle group="products" badge="Brands" title="Devices and software we commonly support" />

      <section className="gos-catalog-panel catalog-products px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((brand) => (
            <div
              key={brand}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-center font-black text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
            >
              {brand}
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-7xl text-xs leading-6 text-slate-500">
          Brand names are shown only to indicate commonly supported devices and
          software. GeekOnSites does not claim official partnership unless
          specifically stated.
        </p>
      </section>

      <SectionTitle group="info" badge="Policy" title="Transparent pricing policies" />

      <section className="gos-catalog-panel catalog-info px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-5">
          {policies.map((policy) => (
            <div
              key={policy}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5"
            >
              <CheckCircle2 className="mb-4 text-cyan-300" size={22} />
              <p className="text-sm font-semibold leading-6 text-slate-300">
                {policy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionTitle group="info" badge="FAQ" title="Common customer questions" />

      <section className="gos-catalog-panel catalog-info px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-white/10 bg-white/[0.05]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-black">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-cyan-300 transition ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openFaq === index && (
                <div className="px-5 pb-5 text-sm leading-7 text-slate-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ badge, title, group }) {
  return (
    <section className={`gos-services-title gos-catalog-panel catalog-${group} px-4 pb-5 pt-9 sm:px-6 sm:pt-12 lg:px-10`}>
      <div className="mx-auto max-w-7xl">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-turquoise">
          {badge}
        </p>
        <h2 className="mt-2 font-['Cormorant_Garamond'] text-3xl font-bold leading-none text-gos-blue-deep sm:text-4xl">{title}</h2>
      </div>
    </section>
  )
}
