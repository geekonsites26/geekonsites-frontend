import { createBooking } from "../services/bookingService"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Laptop, Printer, Wifi, User, Phone, MapPin, CreditCard,
  ArrowRight, ArrowLeft, ChevronDown, CheckCircle2, Home,
  PackageCheck, Monitor, Truck, Building2, Shield, Mail,
  HardDrive, Camera, Computer, Headphones, BriefcaseBusiness,
  Sparkles, CalendarDays, LocateFixed, ShieldCheck, Clock3,
  ShoppingBag, Minus, Plus,
} from "lucide-react"

const serviceCategories = [
  { title: "Remote IT Support", icon: Headphones, models: ["Windows PC", "Mac", "Laptop", "Desktop", "Printer", "Network", "Other"], types: ["PC Health Check & Diagnosis", "Virus & Malware Removal", "Slow PC Optimization", "Windows Troubleshooting", "Printer Setup & Configuration", "Email Setup & Fixes", "Software Installation", "Microsoft Office Setup", "Driver Installation", "Wi-Fi & Network Troubleshooting", "New PC Setup (Remote)"] },
  { title: "Laptop Repair", icon: Laptop, models: ["Dell", "HP", "Lenovo", "Apple MacBook", "Acer", "Asus", "MSI", "Samsung", "Other"], types: ["Not Working", "Slow Performance", "Screen Issue", "Battery Issue", "Keyboard Issue", "OS Installation", "Virus Removal", "Data Backup"] },
  { title: "Computer Repair", icon: Computer, models: ["Dell Desktop", "HP Desktop", "Lenovo Desktop", "Custom PC", "Gaming PC", "Other"], types: ["Not Turning On", "Blue Screen", "Slow PC", "Hardware Upgrade", "Windows Issue", "Driver Issue", "Data Recovery"] },
  { title: "Printer Setup", icon: Printer, models: ["HP", "Canon", "Epson", "Brother", "Xerox", "Other"], types: ["Printer Setup & Configuration", "Printer Offline", "Wireless Setup", "Paper Jam", "Scanner Issue", "Driver Setup", "Printing Error"] },
  { title: "WiFi / Router Setup", icon: Wifi, models: ["TP-Link", "Netgear", "D-Link", "Linksys", "Google Nest", "Other"], types: ["Router Setup", "Wi-Fi & Network Troubleshooting", "Slow Internet", "Signal Issue", "Mesh WiFi Setup", "Password Setup", "Office Network"] },
  { title: "CCTV Installation", icon: Camera, models: ["Hikvision", "Dahua", "Ring", "Nest Cam", "Other"], types: ["New Installation", "Camera Not Working", "DVR Setup", "Remote Viewing", "Maintenance"] },
  { title: "Business IT Support", icon: Building2, models: ["Small Office", "Startup", "Enterprise", "Retail Store", "Remote Team"], types: ["Managed IT Services", "Server Setup", "Office Networking", "Cloud Support", "Business Security"] },
]

const steps = ["Service", "Support", "Add-ons", "Protection", "Customer", "Location", "Schedule", "Review"]

const remoteServiceNames = serviceCategories[0].types

const addonCatalog = {
  "Remote IT Support": [
    ["priority-support", "Priority Same-Day Support", 19, 15],
    ["extended-remote", "Extended Remote Support - 2 Hours", 29, 25],
    ["pc-optimization", "PC Speed Optimization", 39, 35],
    ["virus-cleanup", "Advanced Virus Cleanup", 49, 39],
    ["data-backup", "Data Backup Setup", 39, 35],
    ["email-setup", "Email Setup & Sync", 29, 25],
    ["office-setup", "Microsoft Office Setup", 39, 35],
    ["cloud-sync", "Cloud Sync Setup", 49, 39],
    ["password-manager", "Password Manager Setup", 29, 25],
    ["remote-training", "30-Minute User Training", 25, 20],
  ],

  "Laptop Repair": [
    ["mouse", "Wireless Mouse", 19, 15],
    ["keyboard", "Wireless Keyboard", 29, 25],
    ["laptop-charger", "Laptop Charger", 49, 39],
    ["usb-c-charger", "USB-C Fast Charger", 59, 49],
    ["laptop-bag", "Laptop Carry Bag", 39, 29],
    ["cooling-pad", "Laptop Cooling Pad", 24, 19],
    ["external-hdd", "External Hard Drive", 79, 69],
    ["ssd-upgrade", "SSD Upgrade Support", 79, 69],
    ["ram-upgrade", "RAM Upgrade Support", 59, 49],
    ["screen-protector", "Screen Protector", 19, 15],
    ["data-backup", "Data Backup Before Repair", 39, 35],
    ["premium-cleaning", "Internal Dust Cleaning", 29, 25],
  ],

  "Computer Repair": [
    ["keyboard", "Wireless Keyboard", 29, 25],
    ["mouse", "Wireless Mouse", 19, 15],
    ["monitor-cable", "HDMI / Display Cable", 19, 15],
    ["external-hdd", "External Hard Drive", 79, 69],
    ["ssd-upgrade", "SSD Upgrade Support", 79, 69],
    ["ram-upgrade", "RAM Upgrade Support", 59, 49],
    ["thermal-paste", "Thermal Paste Service", 29, 25],
    ["dust-cleaning", "Desktop Internal Cleaning", 39, 35],
    ["wifi-adapter", "USB WiFi Adapter", 29, 25],
    ["bluetooth-adapter", "Bluetooth Adapter", 19, 15],
    ["backup-drive", "Backup Drive Setup", 49, 39],
  ],

  "Printer Setup": [
    ["wireless-printer", "Wireless Printer Setup", 29, 25],
    ["ink", "Ink / Cartridge Support", 39, 35],
    ["scanner", "Scanner Configuration", 25, 20],
    ["printer-cable", "Printer USB Cable", 15, 12],
    ["paper-pack", "Premium Paper Pack", 15, 12],
    ["extended-printer", "Extended Printer Support", 29, 25],
    ["network-printer", "Network Printer Setup", 49, 39],
    ["driver-install", "Printer Driver Installation", 25, 20],
    ["mobile-print", "Mobile Printing Setup", 29, 25],
  ],

  "WiFi / Router Setup": [
    ["wifi-extender", "WiFi Range Extender", 69, 59],
    ["mesh-setup", "Mesh WiFi Setup", 99, 89],
    ["router-config", "Premium Router Configuration", 49, 39],
    ["network-security", "WiFi Security Setup", 39, 35],
    ["guest-network", "Guest WiFi Setup", 29, 25],
    ["parental-control", "Parental Control Setup", 29, 25],
    ["office-network", "Office Network Optimization", 79, 69],
    ["ethernet-cable", "Ethernet Cable Pack", 19, 15],
    ["smart-home-wifi", "Smart Home WiFi Setup", 49, 39],
  ],

  "CCTV Installation": [
    ["extra-camera", "Extra Camera Installation", 89, 79],
    ["cloud-recording", "Cloud Recording Setup", 39, 35],
    ["mobile-monitoring", "Mobile App Monitoring Setup", 29, 25],
    ["dvr-setup", "DVR/NVR Configuration", 49, 39],
    ["camera-maintenance", "Camera Maintenance", 49, 39],
    ["night-vision-check", "Night Vision Check", 29, 25],
    ["motion-alerts", "Motion Alert Setup", 29, 25],
    ["storage-drive", "CCTV Storage Drive Setup", 79, 69],
    ["remote-viewing", "Remote Viewing Setup", 39, 35],
  ],

  "Business IT Support": [
    ["business-priority", "Priority Business Support", 99, 89],
    ["cloud-backup", "Cloud Backup Setup", 79, 69],
    ["managed-it", "Managed IT Starter Plan", 149, 129],
    ["security-audit", "Business Security Check", 99, 89],
    ["office-network", "Office Network Setup", 99, 89],
    ["email-business", "Business Email Setup", 79, 69],
    ["server-check", "Server Health Check", 149, 129],
    ["device-onboarding", "Employee Device Onboarding", 49, 39],
    ["monthly-maintenance", "Monthly IT Maintenance Add-on", 199, 179],
  ],
}

const antivirusPlans = [
  { id: "essential", name: "GOS Secure Essential", devices: "1 Device", priceUS: 29, priceUK: 24 },
  { id: "family", name: "GOS Secure Family", devices: "3 Devices", priceUS: 49, priceUK: 39 },
  { id: "premium", name: "GOS Secure Premium", devices: "5 Devices", priceUS: 79, priceUK: 69 },
]

const getSafeCountry = () => {
  const saved = localStorage.getItem("gos_location")
  return saved === "US" || saved === "UK" ? saved : "UK"
}

export default function BookService() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedFromServices = location.state || {}

  const [currentStep, setCurrentStep] = useState(1)
  const [supportMode, setSupportMode] = useState("")
  const [service, setService] = useState("")
  const [model, setModel] = useState("")
  const [types, setTypes] = useState([])
  const [warranty, setWarranty] = useState("")
  const [agree, setAgree] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [loading, setLoading] = useState(false)

  const [selectedAddons, setSelectedAddons] = useState([])
  const [selectedAntivirus, setSelectedAntivirus] = useState(null)

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [houseAddress, setHouseAddress] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [city, setCity] = useState("")
  const [stateRegion, setStateRegion] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState(
  localStorage.getItem("gos_location") || "UK"
)
useEffect(() => {
  const updateLocation = () => {
    setCountry(localStorage.getItem("gos_location") || "UK")
  }

  window.addEventListener("gos-location-changed", updateLocation)

  return () =>
    window.removeEventListener(
      "gos-location-changed",
      updateLocation
    )
}, [])
  const [issueDescription, setIssueDescription] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("")

  useEffect(() => {
    if (!selectedFromServices?.serviceType) return
    const incomingService = selectedFromServices.serviceType
    const incomingCategory = selectedFromServices.serviceCategory || ""
    const matchedCategory =
      serviceCategories.find((cat) => cat.title === incomingCategory) ||
      serviceCategories.find((cat) => cat.types.includes(incomingService)) ||
      serviceCategories[0]

    setService(matchedCategory.title)
    setTypes([incomingService])

    if (incomingCategory === "Remote Support" || incomingService.includes("Remote") || remoteServiceNames.includes(incomingService)) {
      setSupportMode("Remote")
      setWarranty("")
    } else {
      setSupportMode("Onsite")
    }
  }, [selectedFromServices?.serviceType, selectedFromServices?.serviceCategory])

  const selectedService = serviceCategories.find((item) => item.title === service)
  const currency = country === "UK" ? "GBP" : "USD"
  const symbol = country === "UK" ? "£" : "$"

  const baseAmount = useMemo(() => {
    const raw = country === "UK" ? selectedFromServices?.ukPrice : selectedFromServices?.usaPrice
    const n = Number(String(raw || "").replace(/[^0-9.]/g, ""))
    return n || (country === "UK" ? 79.99 : 99.99)
  }, [country, selectedFromServices])

const selectedIssueKey =
  types.length > 0
    ? types[types.length - 1]
    : ""

const issueSpecificAddons = {
  "Screen Issue": [
    ["replacement-screen", "Replacement Screen", 129, 109],
    ["screen-protector", "Screen Protector", 19, 15],
    ["external-monitor", "External Monitor Setup", 49, 39],
  ],
  "Battery Issue": [
    ["battery-replacement", "Battery Replacement", 89, 79],
    ["fast-charger", "Fast Charger", 59, 49],
    ["cooling-pad", "Laptop Cooling Pad", 24, 19],
  ],
  "Slow Performance": [
    ["ssd-upgrade", "SSD Upgrade Support", 79, 69],
    ["ram-upgrade", "RAM Upgrade Support", 59, 49],
    ["pc-optimization", "PC Speed Optimization", 39, 35],
  ],
  "Virus Removal": [
    ["virus-cleanup", "Advanced Virus Cleanup", 49, 39],
    ["gos-secure", "GOS Secure Antivirus Setup", 29, 24],
    ["backup-drive", "Backup Drive Setup", 49, 39],
  ],
  "Printer Offline": [
    ["printer-driver", "Printer Driver Setup", 25, 20],
    ["printer-cable", "Printer USB Cable", 15, 12],
    ["wireless-printer", "Wireless Printer Setup", 29, 25],
  ],
  "Router Setup": [
    ["wifi-extender", "WiFi Range Extender", 69, 59],
    ["mesh-setup", "Mesh WiFi Setup", 99, 89],
    ["network-security", "WiFi Security Setup", 39, 35],
  ],
  "New Installation": [
    ["extra-camera", "Extra Camera Installation", 89, 79],
    ["cloud-recording", "Cloud Recording Setup", 39, 35],
    ["mobile-monitoring", "Mobile App Monitoring Setup", 29, 25],
  ],
}

const dynamicAddons = useMemo(() => {
  const categoryAddons = addonCatalog[service] || addonCatalog["Remote IT Support"]
  const issueAddons = issueSpecificAddons[selectedIssueKey] || []

  const merged = [...issueAddons, ...categoryAddons]

  const unique = merged.filter(
    (item, index, self) =>
      index === self.findIndex((x) => x[0] === item[0])
  )

  return unique.map(([id, name, priceUS, priceUK]) => ({
    id,
    name,
    priceUS,
    priceUK,
  }))
}, [service, selectedIssueKey])

  const addonsTotal = selectedAddons.reduce((sum, item) => {
    const unit = country === "UK" ? item.priceUK : item.priceUS
    return sum + unit * item.qty
  }, 0)

  const antivirusTotal = selectedAntivirus ? (country === "UK" ? selectedAntivirus.priceUK : selectedAntivirus.priceUS) : 0
  const platformFee = 12
  const taxAmount=0
  const totalAmount =
  baseAmount +
  addonsTotal +
  antivirusTotal +
  platformFee

const progressPercent = Math.round((currentStep / steps.length) * 100)
  const toggleType = (type) => {
    setTypes((prev) => prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type])
  }

  const addAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((item) => item.id === addon.id)
      if (exists) return prev
      return [...prev, { ...addon, qty: 1 }]
    })
  }

  const removeAddon = (id) => {
    setSelectedAddons((prev) => prev.filter((item) => item.id !== id))
  }

  const changeQty = (addon, type) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((item) => item.id === addon.id)

      if (!exists && type === "plus") {
        return [...prev, { ...addon, qty: 1 }]
      }

      return prev
        .map((item) =>
          item.id === addon.id
            ? { ...item, qty: type === "plus" ? item.qty + 1 : item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    })
  }

  const getAddonQty = (id) => selectedAddons.find((item) => item.id === id)?.qty || 0

  const validateStep = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneDigits = customerPhone.replace(/\D/g, "")

    if (currentStep === 1) {
      if (!service) return "Please select service category."
      if (!model) return "Please select device/model."
      if (!types.length) return "Please select at least one issue type."
    }
    if (currentStep === 2) {
      if (!supportMode) return "Please choose Remote or On-Site support."
      if (supportMode === "Onsite" && !warranty) return "Please select warranty status."
    }
    if (currentStep === 5) {
      if (!customerName.trim()) return "Please enter full name."
      if (!emailRegex.test(customerEmail)) return "Please enter valid email address."
      if (country === "US" && phoneDigits.length !== 10) return "Please enter valid 10-digit US phone number."
      if (country === "UK" && (phoneDigits.length < 10 || phoneDigits.length > 11)) return "Please enter valid UK phone number."
    }
    if (currentStep === 6) {
      if (!city.trim()) return "Please enter city."
      if (!stateRegion.trim()) return country === "US" ? "Please enter state." : "Please enter county / region."
      if (!postalCode.trim()) return country === "US" ? "Please enter ZIP code." : "Please enter postcode."
    }
    if (currentStep === 7) {
      if (!preferredDate) return "Please select preferred date."
      if (!preferredTime) return "Please select preferred time slot."
    }
    if (currentStep === 8 && !agree) return "Please accept Terms & Conditions."
    return ""
  }

  const nextStep = () => {
    const error = validateStep()
    if (error) return alert(error)
    setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAutoLocation = () => {
    if (!navigator.geolocation) return alert("Location is not supported on this device.")
    navigator.geolocation.getCurrentPosition(
      () => alert("Location detected. Please still enter accurate address for dispatch."),
      () => alert("Location permission denied. Please enter address manually.")
    )
  }

  const handleSubmit = async () => {
  const error = validateStep()
  if (error) return alert(error)

  const cleanAddress = [houseAddress, streetAddress]
    .map((i) => i.trim())
    .filter(Boolean)
    .join(", ")

  try {
    setLoading(true)

    const addonsText = selectedAddons
      .map((item) => `${item.name} x${item.qty}`)
      .join(", ")

    const bookingPayload = {
      customerId: 1,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.replace(/\D/g, ""),

      serviceType: service,
      serviceMode: supportMode === "Remote" ? "REMOTE" : "ONSITE",
      issueDescription: issueDescription.trim() || types.join(", "),

      address: cleanAddress || "Address not provided",
      city: city.trim(),
      state: stateRegion.trim(),
      country,
      postalCode: postalCode.trim(),

      bookingDate: preferredDate,
      timeSlot: preferredTime,

      paymentStatus: "PENDING",
      baseAmount: Number(baseAmount.toFixed(2)),
      paymentAmount: Number(totalAmount.toFixed(2)),
      currency,

      remoteSessionRequired: supportMode === "Remote",

      addons: addonsText,
      addonsAmount: Number(addonsTotal.toFixed(2)),
      antivirusPlan: selectedAntivirus?.name || "",
      antivirusAmount: Number(antivirusTotal.toFixed(2)),
      protectionAmount: Number(antivirusTotal.toFixed(2)),
      platformFee: Number(platformFee.toFixed(2)),
      taxAmount: 0,
      totalAmount: Number(totalAmount.toFixed(2)),
    }

    const booking = await createBooking(bookingPayload)

    const completeBooking = {
      ...bookingPayload,
      ...booking,
      supportMode,
      issueType: types.join(", "),
      selectedAddons,
      selectedAntivirus,
      baseAmount: Number(booking?.baseAmount ?? baseAmount),
      addonsTotal: Number(booking?.addonsAmount ?? addonsTotal),
      antivirusTotal: Number(
        booking?.protectionAmount ?? booking?.antivirusAmount ?? antivirusTotal
      ),
      platformFee: Number(booking?.platformFee ?? platformFee),
      taxAmount: Number(booking?.taxAmount ?? taxAmount),
      paymentAmount: Number(booking?.paymentAmount ?? booking?.totalAmount ?? totalAmount),
      totalAmount: Number(booking?.totalAmount ?? totalAmount),
    }

    localStorage.setItem("currentBooking", JSON.stringify(completeBooking))

    navigate("/payment", {
      state: { booking: completeBooking },
    })
  } catch (err) {
    console.error(err)
    alert("Booking failed. Please check backend is running and try again.")
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050B12] pb-52 pt-24 text-white sm:pt-32 lg:pt-44">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_35%)]" />

      <section className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="mb-8 grid items-center gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-200">
              <Sparkles size={15} />
              Production Booking Flow
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Book expert tech support
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
              Book service, add accessories, choose protection, and checkout securely.
            </p>
          </div>

          <div className="hidden rounded-[3rem] border border-white/10 bg-[#07111f] p-8 lg:block">
            <h3 className="text-2xl font-black">GeekOnSites</h3>
            <p className="mt-2 text-slate-400">Tech Experts at Your Doorstep</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <HeroMini icon={Laptop} title="Book" />
              <HeroMini icon={ShieldCheck} title="Protect" />
              <HeroMini icon={Truck} title="Assign" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-[#0A1020]/85 p-4 shadow-2xl backdrop-blur-xl sm:p-7 lg:rounded-[2.5rem]">
            <Stepper currentStep={currentStep} progressPercent={progressPercent} />

            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }}>
                {currentStep === 1 && (
                  <StepCard number="01" title="Service details" subtitle="Choose service category, device, and exact issue">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <CustomDropdown label="Service Category" value={service} placeholder="Select Service" options={serviceCategories.map((i) => i.title)} open={openDropdown === "service"} onToggle={() => setOpenDropdown(openDropdown === "service" ? null : "service")} onSelect={(v) => { setService(v); setModel(""); setTypes([]); setSelectedAddons([]); setOpenDropdown(null) }} />
                      <CustomDropdown label="Device / Model" value={model} placeholder="Select Device" options={selectedService?.models || []} disabled={!selectedService} open={openDropdown === "model"} onToggle={() => setOpenDropdown(openDropdown === "model" ? null : "model")} onSelect={(v) => { setModel(v); setOpenDropdown(null) }} />
                    </div>

                    {selectedService && (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {selectedService.types.map((type) => (
                          <button key={type} type="button" onClick={() => toggleType(type)} className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${types.includes(type) ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-cyan-400/40"}`}>
                            <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${types.includes(type) ? "border-cyan-400 bg-cyan-400" : "border-white/20"}`}>
                              {types.includes(type) && <CheckCircle2 size={14} className="text-black" />}
                            </span>
                            <span className="text-sm font-semibold">{type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </StepCard>
                )}

                {currentStep === 2 && (
                  <StepCard number="02" title="Support method" subtitle="Choose remote support or on-site technician">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SupportCard title="Remote Support" subtitle="Online support by appointment" icon={Monitor} active={supportMode === "Remote"} onClick={() => { setSupportMode("Remote"); setWarranty("") }} />
                      <SupportCard title="On-Site Technician" subtitle="Technician visits your location" icon={Truck} active={supportMode === "Onsite"} onClick={() => setSupportMode("Onsite")} />
                    </div>

                    {supportMode === "Onsite" && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {["Under Warranty", "Out of Warranty"].map((item) => (
                          <button key={item} type="button" onClick={() => setWarranty(item)} className={`rounded-2xl border px-5 py-4 text-left transition ${warranty === item ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-black/20 text-gray-300"}`}>
                            <PackageCheck className="mb-3 text-cyan-300" size={22} />
                            <span className="font-bold">{item}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </StepCard>
                )}

                {currentStep === 3 && (
                  <StepCard number="03" title="Recommended add-ons" subtitle="Dynamic products based on selected service">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {dynamicAddons.map((addon) => {
                        const qty = getAddonQty(addon.id)
                        const price = country === "UK" ? addon.priceUK : addon.priceUS

                        return (
                          <div key={addon.id} className={`rounded-3xl border p-5 ${qty ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20"}`}>
                            <div className="flex justify-between gap-3">
                             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
                               <ShoppingBag className="text-cyan-300" />
                            </div>
                              <p className="font-black text-cyan-300">+{symbol}{price}</p>
                            </div>
                            <h3 className="mt-4 text-sm font-black">{addon.name}</h3>

                            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-2">
                              <button type="button" onClick={() => changeQty(addon, "minus")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                                <Minus size={16} />
                              </button>
                              <p className="font-black">{qty}</p>
                              <button type="button" onClick={() => qty ? changeQty(addon, "plus") : addAddon(addon)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-black">
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </StepCard>
                )}

                {currentStep === 4 && (
                  <StepCard number="04" title="GOS Secure Protection" subtitle="Device Security & Protection Plans">
                    <div className="rounded-[1.7rem] border border-amber-400/20 bg-amber-400/10 p-5">
                      <div className="flex gap-3">
                        <ShieldCheck className="shrink-0 text-amber-300" />
                        <div>
                          <h3 className="font-black text-amber-100">GOS Secure Antivirus</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-300">Powered by enterprise-grade security technologies. Includes malware protection, ransomware defense, safe browsing, identity protection and automatic updates.</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        {antivirusPlans.map((plan) => {
                          const active = selectedAntivirus?.id === plan.id
                          const price = country === "UK" ? plan.priceUK : plan.priceUS
                          return (
                            <button key={plan.id} type="button" onClick={() => setSelectedAntivirus(active ? null : plan)} className={`rounded-3xl border p-5 text-left transition ${active ? "border-amber-300 bg-amber-400/15" : "border-white/10 bg-black/20 hover:border-amber-300/50"}`}>
                              <Shield className="text-amber-300" size={24} />
                              <h3 className="mt-4 text-sm font-black">{plan.name}</h3>
                              <p className="mt-1 text-xs text-slate-400">{plan.devices}</p>
                              <p className="mt-3 text-xl font-black text-amber-200">{symbol}{price}/yr</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </StepCard>
                )}

                {currentStep === 5 && (
                  <StepCard number="05" title="Customer details" subtitle="Used for updates and technician communication">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input icon={User} placeholder="Full Name" value={customerName} onChange={setCustomerName} />
                      <Input icon={Phone} placeholder={country === "US" ? "US Phone: 5551234567" : "UK Phone: 07123456789"} value={customerPhone} onChange={(v) => setCustomerPhone(v.replace(/\D/g, ""))} inputMode="tel" />
                      <Input icon={Mail} placeholder="Email Address" value={customerEmail} onChange={setCustomerEmail} />
                      <CustomDropdown label="Country / Region" value={country} placeholder="Select Country" options={["US", "UK"]} open={openDropdown === "country"} onToggle={() => setOpenDropdown(openDropdown === "country" ? null : "country")} onSelect={(v) => {
  setCountry(v)

  localStorage.setItem("gos_location", v)

  if (v === "US") {
    localStorage.setItem("gos_country", "United States")
    localStorage.setItem("gos_currency", "USD")
    localStorage.setItem("gos_symbol", "$")
  } else {
    localStorage.setItem("gos_country", "United Kingdom")
    localStorage.setItem("gos_currency", "GBP")
    localStorage.setItem("gos_symbol", "£")
  }

  window.dispatchEvent(new Event("gos-location-changed"))

  setOpenDropdown(null)
}} />
                    </div>
                  </StepCard>
                )}

                {currentStep === 6 && (
                  <StepCard number="06" title="Service location" subtitle="Required for dispatch, tax, and regional pricing">
                    <button type="button" onClick={handleAutoLocation} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 text-sm font-black text-cyan-300">
                      <LocateFixed size={18} /> Use my current location
                    </button>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input icon={Home} placeholder="House / Apartment" value={houseAddress} onChange={setHouseAddress} />
                      <Input icon={MapPin} placeholder="Street / Area" value={streetAddress} onChange={setStreetAddress} />
                      <Input icon={MapPin} placeholder="City" value={city} onChange={setCity} />
                      <Input icon={MapPin} placeholder={country === "US" ? "State e.g. California" : "County / Region e.g. England"} value={stateRegion} onChange={setStateRegion} />
                      <div className="sm:col-span-2">
                        <Input icon={MapPin} placeholder={country === "US" ? "ZIP Code" : "Postcode"} value={postalCode} onChange={setPostalCode} />
                      </div>
                    </div>

                    <textarea rows={5} value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="Describe your issue..." className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-[#0B111D] p-4 text-sm text-white outline-none placeholder-gray-500" />
                  </StepCard>
                )}

                {currentStep === 7 && (
                  <StepCard number="07" title="Preferred schedule" subtitle="Choose when you want support">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input icon={CalendarDays} type="date" placeholder="Preferred Date" value={preferredDate} onChange={setPreferredDate} />
                      <CustomDropdown label="Preferred Time" value={preferredTime} placeholder="Select Time Slot" options={["08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"]} open={openDropdown === "time"} onToggle={() => setOpenDropdown(openDropdown === "time" ? null : "time")} onSelect={(v) => { setPreferredTime(v); setOpenDropdown(null) }} />
                    </div>

                    <div className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                      <div className="flex gap-4">
                        <Clock3 className="shrink-0 text-amber-300" />
                        <p className="text-sm leading-6 text-slate-300">Technician assignment starts after payment. Expected assignment time is 10–15 minutes.</p>
                      </div>
                    </div>
                  </StepCard>
                )}

                {currentStep === 8 && (
                  <StepCard number="08" title="Review & checkout" subtitle="Confirm everything before payment">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Review label="Service" value={types[0] || service || "Not selected"} />
                      <Review label="Support" value={supportMode || "Not selected"} />
                      <Review label="Device" value={model || "Not selected"} />
                      <Review label="Customer" value={customerName || "Not provided"} />
                      <Review label="Location" value={[city, stateRegion, postalCode, country].filter(Boolean).join(", ") || "Not provided"} />
                      <Review label="Schedule" value={preferredDate && preferredTime ? `${preferredDate} • ${preferredTime}` : "Not selected"} />
                    </div>

                    <TrustSection />

                    <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                      <PriceLine label="Service Fee" value={`${symbol}${baseAmount.toFixed(2)}`} />
                      <PriceLine label="Add-ons" value={`${symbol}${addonsTotal.toFixed(2)}`} />
                      <PriceLine label="Protection Plan" value={`${symbol}${antivirusTotal.toFixed(2)}`} />
                      <PriceLine label="Platform Fee" value={`${symbol}${platformFee.toFixed(2)}`} />
                  
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <PriceLine label="Total" value={`${symbol}${totalAmount.toFixed(2)}`} bold />
                      </div>
                    </div>

                    <label className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-5">
                      <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} className="mt-1 h-4 w-4 accent-cyan-400" />
                      <span className="text-sm leading-6 text-gray-400">I agree to GeekOnSites Terms, Privacy Policy, Refund Policy and service policies. Taxes, VAT, regulatory fees, or government charges may apply where legally required.</span>
                    </label>
                  </StepCard>
                )}
              </motion.div>
            </AnimatePresence>

            <DesktopButtons currentStep={currentStep} loading={loading} onBack={prevStep} onNext={nextStep} onSubmit={handleSubmit} />
          </motion.div>

          <DesktopSummary
             country={country}
             currentStep={currentStep}
             symbol={symbol}
             baseAmount={baseAmount}
             addonsTotal={addonsTotal}
             antivirusTotal={antivirusTotal}
             platformFee={platformFee}
             totalAmount={totalAmount}
             service={types[0] || service}
            selectedAddons={selectedAddons}
           selectedAntivirus={selectedAntivirus}
      />
        </div>
      </section>

      <MobileWizardCTA currentStep={currentStep} loading={loading} total={`${symbol}${totalAmount.toFixed(2)}`} onBack={prevStep} onNext={nextStep} onSubmit={handleSubmit} />
    </main>
  )
}

function Stepper({ currentStep, progressPercent }) {
  return (
    <div className="mb-7 rounded-[1.7rem] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-white">Step {currentStep} of {steps.length}</p>
        <p className="text-sm font-black text-cyan-300">{progressPercent}% Complete</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-8 gap-1">
        {steps.map((step, index) => (
          <div key={step} className="text-center">
            <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${currentStep >= index + 1 ? "bg-cyan-400 text-black" : "bg-white/10 text-slate-500"}`}>
              {index + 1}
            </div>
            <p className="mt-2 hidden text-[10px] font-bold text-slate-400 sm:block">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepCard({ number, title, subtitle, children }) {
  return (
    <section>
      <div className="mb-6 flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-black text-slate-950">{number}</div>
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function DesktopButtons({ currentStep, loading, onBack, onNext, onSubmit }) {
  return (
    <div className="mt-8 hidden items-center justify-between gap-4 lg:flex">
      <button onClick={onBack} disabled={currentStep === 1} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-6 py-4 font-black text-slate-300 disabled:opacity-40">
        <ArrowLeft size={18} /> Back
      </button>
      {currentStep < steps.length ? (
        <button onClick={onNext} className="flex items-center gap-3 rounded-2xl bg-cyan-400 px-8 py-4 font-black text-black">Next <ArrowRight size={18} /></button>
      ) : (
        <button onClick={onSubmit} disabled={loading} className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-8 py-4 font-black text-black disabled:opacity-60">
          <CreditCard size={19} /> {loading ? "Creating Booking..." : "Continue to Payment"}
        </button>
      )}
    </div>
  )
}

function MobileWizardCTA({
  currentStep,
  loading,
  total,
  onBack,
  onNext,
  onSubmit,
}) {
  const showPrice = currentStep >= 5

  return (
    <div className="fixed bottom-16 left-0 right-0 z-[9999] border-t border-white/10 bg-[#050B12]/95 p-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        {currentStep > 1 && (
          <button
            onClick={onBack}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-500">
            Step {currentStep} of {steps.length}
          </p>

          <p className="truncate text-lg font-black text-white">
            {showPrice ? total : steps[currentStep - 1]}
          </p>

          {!showPrice && (
            <p className="text-[11px] text-slate-500">
              Estimate updates after configuration
            </p>
          )}
        </div>

        {currentStep < steps.length ? (
          <button
            onClick={onNext}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950"
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Payment"} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function DesktopSummary({
  currentStep,
  symbol,
  baseAmount,
  addonsTotal,
  antivirusTotal,
  platformFee,
  totalAmount,
  service,
  selectedAddons,
  selectedAntivirus,
}) {
  const showPrice = currentStep >= 5

  return (
    <motion.aside
      initial={{ opacity: 0, x: 45 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden h-fit rounded-[2.5rem] border border-white/10 bg-[#0A1020]/80 p-6 shadow-2xl backdrop-blur-xl lg:sticky lg:top-40 lg:block"
    >
      <h2 className="text-2xl font-black">Booking Summary</h2>

      <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
        <p className="text-sm font-bold text-cyan-300">
          {showPrice ? "Estimated Total" : "Configure Your Service"}
        </p>

        <p className="mt-2 text-3xl font-black">
          {showPrice ? `${symbol}${totalAmount.toFixed(2)}` : "Price updates later"}
        </p>

        {!showPrice && (
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Select support method, add-ons, protection, and customer details to
            see final estimate.
          </p>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <Preview label="Current Step" value={steps[currentStep - 1]} />
        <Preview label="Service" value={service || "Not selected"} />
        <Preview
          label="Add-ons"
          value={
            selectedAddons.length
              ? selectedAddons.map((a) => `${a.name} x${a.qty}`).join(", ")
              : "None"
          }
        />
        <Preview label="Protection" value={selectedAntivirus?.name || "None"} />
      </div>

      {showPrice && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <PriceLine label="Service Fee" value={`${symbol}${baseAmount.toFixed(2)}`} />
          <PriceLine label="Add-ons" value={`${symbol}${addonsTotal.toFixed(2)}`} />
          <PriceLine label="Protection Plan" value={`${symbol}${antivirusTotal.toFixed(2)}`} />
          <PriceLine label="Platform Fee" value={`${symbol}${platformFee.toFixed(2)}`} />

          <div className="mt-4 border-t border-white/10 pt-4">
            <PriceLine label="Total" value={`${symbol}${totalAmount.toFixed(2)}`} bold />
          </div>
        </div>
      )}

      <TrustSection compact />
    </motion.aside>
  )
}

function TrustSection({ compact }) {
  const items = ["Secure Payment", "Verified Technicians", "30-Day Service Guarantee", "US & UK Coverage"]
  return (
    <div className={`${compact ? "mt-6" : "mt-6"} grid gap-3 sm:grid-cols-2`}>
      {items.map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <CheckCircle2 size={17} className="text-cyan-300" />
          <p className="text-sm font-semibold text-slate-300">{item}</p>
        </div>
      ))}
    </div>
  )
}

function HeroMini({ icon: Icon, title }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <Icon className="text-cyan-300" />
      <p className="mt-3 font-black">{title}</p>
    </div>
  )
}

function SupportCard({ title, subtitle, icon: Icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-3xl border p-5 text-left transition ${active ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-black/20 hover:border-cyan-400/40"}`}>
      <Icon className="mb-4 text-cyan-300" size={27} />
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
    </button>
  )
}

function CustomDropdown({ label, value, placeholder, options, open, onToggle, onSelect, disabled }) {
  return (
    <div className="relative">
      <label className="mb-3 block text-sm font-bold text-cyan-300">{label}</label>
      <button type="button" onClick={onToggle} disabled={disabled} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-left text-sm disabled:opacity-50">
        <span className={value ? "font-semibold text-white" : "text-gray-500"}>{value || placeholder}</span>
        <ChevronDown size={18} className="text-cyan-300" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 8 }} exit={{ opacity: 0, y: 12 }} className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#0B111D] shadow-2xl">
            {options.map((option) => <button type="button" key={option} onClick={() => onSelect(option)} className="block w-full px-5 py-3 text-left text-sm hover:bg-cyan-500/10">{option}</button>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Input({ icon: Icon, placeholder, value, onChange, type = "text", inputMode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
      <Icon size={18} className="shrink-0 text-cyan-300" />
      <input type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-semibold outline-none placeholder-gray-500" />
    </div>
  )
}

function Review({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-100">{value}</p>
    </div>
  )
}

function PriceLine({ label, value, bold }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className={bold ? "text-lg font-black" : "text-sm text-slate-400"}>{label}</p>
      <p className={bold ? "text-2xl font-black text-cyan-300" : "font-black"}>{value}</p>
    </div>
  )
}

function Preview({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-200">{value}</p>
    </div>
  )
}
