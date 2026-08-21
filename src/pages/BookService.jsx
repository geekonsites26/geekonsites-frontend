import { createBooking } from "../services/bookingService"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { getLocation } from "../utils/location"
import DashboardReturnLink from "../components/customer/DashboardReturnLink"
import {
  Laptop, Printer, Wifi, User, Phone, MapPin, CreditCard,
  ArrowRight, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Home,
  PackageCheck, Monitor, Truck, Building2, Mail,
  HardDrive, Camera, Computer, Headphones,
  Sparkles, CalendarDays, LocateFixed, ShieldCheck, Clock3, Minus, Plus,
} from "lucide-react"

const serviceCategories = [
  { title: "Remote IT Support", icon: Headphones, models: ["Windows PC", "Mac", "Laptop", "Desktop", "Printer", "Network", "Other"], types: ["PC Health Check & Diagnosis", "Virus & Malware Removal", "Slow PC Optimization", "Windows Troubleshooting", "Printer Setup & Configuration", "Email Setup & Fixes", "Software Installation", "Microsoft Office Setup", "Driver Installation", "Wi-Fi & Network Troubleshooting", "Password Recovery Assistance", "Data Backup Configuration", "New PC Setup (Remote)"] },
  { title: "Laptop Repair", icon: Laptop, models: ["Dell", "HP", "Lenovo", "Apple MacBook", "Acer", "Asus", "MSI", "Samsung", "Other"], types: ["Laptop Repair", "Not Working", "Slow Performance", "Screen Issue", "Battery Issue", "Keyboard Issue", "OS Installation", "Virus Removal", "Data Backup"] },
  { title: "Computer Repair", icon: Computer, models: ["Dell Desktop", "HP Desktop", "Lenovo Desktop", "Custom PC", "Gaming PC", "Other"], types: ["Desktop Repair", "Not Turning On", "Blue Screen", "Slow PC", "Hardware Upgrade", "Windows Issue", "Driver Issue", "Data Recovery"] },
  { title: "Printer Setup", icon: Printer, models: ["HP", "Canon", "Epson", "Brother", "Xerox", "Other"], types: ["Printer Setup & Configuration", "Printer Offline", "Wireless Setup", "Paper Jam", "Scanner Issue", "Driver Setup", "Printing Error"] },
  { title: "WiFi / Router Setup", icon: Wifi, models: ["TP-Link", "Netgear", "D-Link", "Linksys", "Google Nest", "Other"], types: ["Router Setup", "Wi-Fi & Network Troubleshooting", "Slow Internet", "Signal Issue", "Mesh WiFi Setup", "Password Setup", "Office Network"] },
  { title: "CCTV Installation", icon: Camera, models: ["Hikvision", "Dahua", "Ring", "Nest Cam", "Other"], types: ["CCTV Installation", "New Installation", "Camera Not Working", "DVR Setup", "Remote Viewing", "Maintenance"] },
  { title: "Business IT Support", icon: Building2, models: ["Small Office", "Startup", "Enterprise", "Retail Store", "Remote Team"], types: ["Business IT Support", "Managed IT Services", "Server Setup", "Office Networking", "Cloud Support", "Business Security"] },
  { title: "Smart Home Setup", icon: Home, models: ["Smart TV", "Alexa", "Google Home", "Smart Doorbell", "Other"], types: ["Smart Home Setup", "New Smart Home Setup", "Device Connection", "App Configuration", "Wi-Fi Integration", "Troubleshooting"] },
  { title: "Service Bundle", icon: PackageCheck, models: ["Home", "Work from Home", "Small Business"], types: ["PC Protection Bundle", "New Computer Setup", "Work-from-Home Bundle"] },
  { title: "Product Add-on", icon: HardDrive, models: ["Networking", "Printer & Office", "Storage", "Accessories", "Antivirus"], types: ["Networking Product Recommendation", "Printer & Office Product Recommendation", "Storage Product Recommendation", "Accessories Product Recommendation", "Antivirus Product Recommendation"] },
]

const steps = ["Service", "Support", "Extras", "Customer", "Location", "Schedule", "Review"]
const timeSlots = [
  { value: "08:00 AM - 10:00 AM", label: "8-10 AM" },
  { value: "10:00 AM - 12:00 PM", label: "10-12 PM" },
  { value: "12:00 PM - 02:00 PM", label: "12-2 PM" },
  { value: "02:00 PM - 04:00 PM", label: "2-4 PM" },
  { value: "04:00 PM - 06:00 PM", label: "4-6 PM" },
  { value: "06:00 PM - 08:00 PM", label: "6-8 PM" },
]

const remoteServiceNames = serviceCategories[0].types

const remoteBookingPrices = [
  ["PC Health Check & Diagnosis", 29, 25], ["Virus & Malware Removal", 79, 69],
  ["Slow PC Optimization", 59, 49], ["Windows Troubleshooting", 69, 59],
  ["Printer Setup & Configuration", 49, 39], ["Email Setup & Fixes", 39, 35],
  ["Software Installation", 39, 35], ["Microsoft Office Setup", 49, 39],
  ["Driver Installation", 39, 35], ["Wi-Fi & Network Troubleshooting", 69, 59],
  ["Password Recovery Assistance", 49, 39], ["Data Backup Configuration", 59, 49],
  ["New PC Setup (Remote)", 99, 89],
]

const bookingServiceGroups = [
  {
    id: "popular", label: "High Demand", mode: "Remote",
    services: [
      ["Virus & Malware Removal", "Remote IT Support", 79, 69],
      ["New PC Setup (Remote)", "Remote IT Support", 99, 89],
      ["Wi-Fi & Network Troubleshooting", "Remote IT Support", 69, 59],
      ["Printer Setup & Configuration", "Remote IT Support", 49, 39],
    ],
  },
  { id: "remote", label: "Remote", mode: "Remote", services: remoteBookingPrices.map(([name, us, uk]) => [name, "Remote IT Support", us, uk]) },
  {
    id: "onsite", label: "On-Site", mode: "Onsite",
    services: [
      ["Laptop Repair", "Laptop Repair", 129, 109], ["Desktop Repair", "Computer Repair", 139, 119],
      ["CCTV Installation", "CCTV Installation", 199, 179], ["Router Setup", "WiFi / Router Setup", 99, 89],
      ["Smart Home Setup", "Smart Home Setup", 109, 95], ["Business IT Support", "Business IT Support", 149, 129],
    ],
  },
  {
    id: "business", label: "Business", mode: "Onsite",
    services: [["Managed IT Services", 199, 179], ["Cloud Support", 129, 109], ["Server Setup", 179, 159], ["Office Networking", 149, 129], ["Business Security", 129, 109]].map(([name, us, uk]) => [name, "Business IT Support", us, uk]),
  },
  {
    id: "bundles", label: "Bundles", mode: "Onsite",
    services: [["PC Protection Bundle", 99, 85], ["New Computer Setup", 149, 129], ["Work-from-Home Bundle", 199, 169]].map(([name, us, uk]) => [name, "Service Bundle", us, uk]),
  },
  {
    id: "products", label: "Products", mode: "Remote",
    services: ["Networking", "Printer & Office", "Storage", "Accessories", "Antivirus"].map((name) => [`${name} Product Recommendation`, "Product Add-on", 19, 15]),
  },
]

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

export default function BookService() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedFromServices = useMemo(() => location.state || {}, [location.state])

  const [currentStep, setCurrentStep] = useState(1)
  const [activeServiceGroup, setActiveServiceGroup] = useState("popular")
  const [supportMode, setSupportMode] = useState("")
  const [service, setService] = useState("")
  const [model, setModel] = useState("")
  const [types, setTypes] = useState([])
  const [warranty, setWarranty] = useState("")
  const [agree, setAgree] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [selectedAddons, setSelectedAddons] = useState([])


  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [houseAddress, setHouseAddress] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [city, setCity] = useState("")
  const [stateRegion, setStateRegion] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState(() => getLocation().code)
useEffect(() => {
  const updateLocation = () => {
    setCountry(getLocation().code)
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
      serviceCategories.find((cat) => cat.title === incomingService) ||
      serviceCategories.find((cat) => cat.types.includes(incomingService)) ||
      serviceCategories[0]

    setService(matchedCategory.title)
    setTypes([incomingService])
    const incomingGroup = bookingServiceGroups.find(({ services }) => services.some(([name]) => name === incomingService))
    if (incomingGroup) setActiveServiceGroup(incomingGroup.id)

    if (incomingCategory === "Remote Support" || incomingService.includes("Remote") || remoteServiceNames.includes(incomingService)) {
      setSupportMode("Remote")
      setWarranty("")
    } else {
      setSupportMode("Onsite")
    }
  }, [selectedFromServices?.serviceType, selectedFromServices?.serviceCategory])

  const selectedService = serviceCategories.find((item) => item.title === service)
  const visibleServiceGroup = bookingServiceGroups.find(({ id }) => id === activeServiceGroup) || bookingServiceGroups[0]
  const currency = country === "UK" ? "GBP" : "USD"
  const symbol = country === "UK" ? "£" : "$"

  const fallbackBaseAmount = useMemo(() => {
    const raw = country === "UK" ? selectedFromServices?.ukPrice : selectedFromServices?.usaPrice
    const n = Number(String(raw || "").replace(/[^0-9.]/g, ""))
    return n || (country === "UK" ? 79.99 : 99.99)
  }, [country, selectedFromServices])

  const selectedServiceItems = useMemo(() => types.map((name) => {
    const match = bookingServiceGroups.flatMap(({ services }) => services).find(([serviceName]) => serviceName === name)
    return match ? { name, category: match[1], price: country === "UK" ? match[3] : match[2] } : { name, category: service, price: fallbackBaseAmount }
  }), [country, fallbackBaseAmount, service, types])

  const baseAmount = selectedServiceItems.reduce((total, item) => total + Number(item.price || 0), 0)

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

  const dynamicAddons = (() => {
    const issueAddons = types.flatMap((type) => issueSpecificAddons[type] || [])
    const categoryAddons = addonCatalog[service] || []
    return [...issueAddons, ...categoryAddons]
      .filter((item, index, items) => index === items.findIndex((candidate) => candidate[0] === item[0]))
      .slice(0, 8)
      .map(([id, name, priceUS, priceUK]) => ({ id, name, priceUS, priceUK }))
  })()

  const addonsTotal = selectedAddons.reduce((total, addon) => total + (country === "UK" ? addon.priceUK : addon.priceUS) * addon.quantity, 0)
  const addonsCount = selectedAddons.reduce((total, addon) => total + addon.quantity, 0)

  const platformFee = 12
  const taxAmount=0
  const totalAmount =
  baseAmount +
  addonsTotal +
  platformFee

const progressPercent = Math.round((currentStep / steps.length) * 100)
  const selectCatalogService = (name, category) => {
    const alreadySelected = types.includes(name)
    setTypes((current) => alreadySelected ? current.filter((item) => item !== name) : [...current, name])
    if (!alreadySelected) {
      setService(category)
      if (!types.length) {
        setSupportMode(visibleServiceGroup.mode)
        if (visibleServiceGroup.mode === "Remote") setWarranty("")
      }
    }
  }
  const changeAddonQuantity = (addon, change) => setSelectedAddons((current) => {
    const existing = current.find(({ id }) => id === addon.id)
    const nextQuantity = Math.min(10, Math.max(0, (existing?.quantity || 0) + change))
    if (!nextQuantity) return current.filter(({ id }) => id !== addon.id)
    if (existing) return current.map((item) => item.id === addon.id ? { ...item, quantity: nextQuantity } : item)
    return [...current, { ...addon, quantity: 1 }]
  })

  const validateStep = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneDigits = customerPhone.replace(/\D/g, "")

    if (currentStep === 1) {
      if (!types.length) return "Please select at least one service."
    }
    if (currentStep === 2) {
      if (!supportMode) return "Please choose Remote or On-Site support."
      if (supportMode === "Onsite" && !warranty) return "Please select warranty status."
    }
    if (currentStep === 4) {
      if (!customerName.trim()) return "Please enter full name."
      if (!emailRegex.test(customerEmail)) return "Please enter valid email address."
      if (country === "US" && phoneDigits.length !== 10) return "Please enter valid 10-digit US phone number."
      if (country === "UK" && phoneDigits.length !== 10) return "Please enter a valid 10-digit UK number after +44."
    }
    if (currentStep === 5) {
      if (!city.trim()) return "Please enter city."
      if (!stateRegion.trim()) return country === "US" ? "Please enter state." : "Please enter county / region."
      if (!postalCode.trim()) return country === "US" ? "Please enter ZIP code." : "Please enter postcode."
      if (country === "US" && !/^\d{5}(-\d{4})?$/.test(postalCode)) return "Please enter a valid 5-digit ZIP code or ZIP+4."
      if (country === "UK" && !/^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/.test(postalCode)) return "Please enter a valid UK postcode."
    }
    if (currentStep === 6) {
      if (!preferredDate) return "Please select preferred date."
      if (!preferredTime) return "Please select preferred time slot."
    }
    if (currentStep === 7 && !agree) return "Please accept Terms & Conditions."
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
    setSubmitError("")

    const bookingPayload = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: `${country === "US" ? "+1" : "+44"}${customerPhone.replace(/\D/g, "")}`,

      serviceType: types.join(", "),
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
      customerLatitude: supportMode === "Onsite" ? Number(localStorage.getItem("gos_latitude")) || null : null,
      customerLongitude: supportMode === "Onsite" ? Number(localStorage.getItem("gos_longitude")) || null : null,

      remoteSessionRequired: supportMode === "Remote",

      addons: selectedAddons.map(({ name, quantity }) => `${name} x${quantity}`).join(", "),
      selectedAddons: JSON.stringify(selectedAddons.map(({ id, quantity }) => ({ id, quantity }))),
      addonsAmount: Number(addonsTotal.toFixed(2)),
      antivirusPlan: "",
      antivirusAmount: 0,
      protectionAmount: 0,
      platformFee: Number(platformFee.toFixed(2)),
      taxAmount: 0,
      totalAmount: Number(totalAmount.toFixed(2)),
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 30000)
    let booking
    try {
      booking = await createBooking(bookingPayload, { signal: controller.signal })
    } finally {
      window.clearTimeout(timeoutId)
    }

    const completeBooking = {
      ...bookingPayload,
      ...booking,
      supportMode,
      issueType: types.join(", "),
      baseAmount: Number(booking?.baseAmount ?? baseAmount),
      selectedAddons,
      selectedServices: selectedServiceItems,
      addonsTotal: Number(booking?.addonsAmount ?? addonsTotal),
      antivirusTotal: 0,
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
    setSubmitError(err?.name === "AbortError"
      ? "The booking server is taking too long to respond. Your details are still here; please try again."
      : err?.message || "Booking could not be created. Please try again.")
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="gos-booking-page relative min-h-screen overflow-x-hidden bg-[#eaf0f3] pb-40 pt-[calc(3.5rem+env(safe-area-inset-top))] text-gos-charcoal sm:pt-[calc(4rem+env(safe-area-inset-top))] lg:pb-16">

      <section className="relative mx-auto max-w-7xl px-3 pb-8 sm:px-6 sm:pb-10">
        <DashboardReturnLink force to="/" className="-ml-2 my-2" />
        <div className="booking-hero mb-4 grid items-end gap-4 overflow-hidden bg-gos-blue-deep px-4 py-4 text-white shadow-[var(--gos-shadow-sm)] sm:mb-5 sm:px-7 sm:py-6 lg:grid-cols-[1fr_auto] lg:py-7">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-gold sm:mb-3 sm:text-[10px] sm:tracking-[0.18em]">
              <Sparkles size={15} />
              Secure service booking
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[1.85rem] font-bold leading-none text-white sm:text-5xl lg:text-6xl">
              Book the support you need.
            </h1>
            <p className="mt-2 max-w-xl text-xs font-semibold leading-5 text-white/75 sm:mt-3 sm:text-base sm:leading-7">
              Configure the service, schedule support, review the price, and continue securely to payment.
            </p>
          </div>

          <div className="hidden grid-cols-3 border-y border-white/20 lg:grid">
            <HeroMini icon={Laptop} title="Configure" />
            <HeroMini icon={ShieldCheck} title="Confirm" />
            <HeroMini icon={Truck} title="Connect" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)_20rem] lg:items-start">
          <BookingRail currentStep={currentStep} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="booking-workspace border border-gos-border bg-white p-3 shadow-[var(--gos-shadow-sm)] sm:p-7">
            <Stepper currentStep={currentStep} progressPercent={progressPercent} />

            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }}>
                {currentStep === 1 && (
                  <StepCard number="01" title="Choose your service" subtitle="Every GOS service, organized into six simple groups">
                    <div className="booking-service-tabs grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
                        {bookingServiceGroups.map((group) => (
                          <button key={group.id} type="button" onClick={() => setActiveServiceGroup(group.id)} className={`min-h-11 rounded-md border px-1.5 text-[10px] font-extrabold leading-4 transition sm:px-3 sm:text-xs ${activeServiceGroup === group.id ? "border-gos-blue-deep bg-gos-blue-deep text-white" : "border-gos-border bg-white text-gos-blue-deep hover:border-gos-turquoise"}`}>
                            {group.label}
                          </button>
                        ))}
                    </div>

                    <div className="booking-service-list mt-3 grid gap-1.5 sm:grid-cols-2 sm:gap-3">
                      {visibleServiceGroup.services.map(([name, category, priceUS, priceUK]) => {
                        const selected = types.includes(name)
                        const price = country === "UK" ? priceUK : priceUS
                        return (
                          <motion.button whileTap={{ scale: 0.985 }} key={`${category}-${name}`} type="button" aria-pressed={selected} onClick={() => selectCatalogService(name, category)} className={`booking-service-option flex min-h-12 touch-manipulation items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition sm:min-h-14 sm:px-4 ${selected ? "is-selected border-gos-turquoise bg-[#eef8f7]" : "border-gos-border bg-white hover:border-gos-turquoise"}`}>
                            <span className="min-w-0"><span className="block text-xs font-bold leading-5 text-gos-blue-deep sm:text-sm">{name}</span><span className="block text-[10px] font-extrabold text-gos-turquoise">{symbol}{Number(price).toFixed(2)}</span></span>
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-gos-turquoise bg-gos-turquoise text-white" : "border-gos-border text-transparent"}`}>
                              <CheckCircle2 size={14} />
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>

                    <div className="mt-5">
                      <CustomDropdown label="Device / Model (optional)" value={model} placeholder={selectedService ? "Add device details" : "Select a service first"} options={selectedService?.models || []} disabled={!selectedService} open={openDropdown === "model"} onToggle={() => setOpenDropdown(openDropdown === "model" ? null : "model")} onSelect={(v) => { setModel(v); setOpenDropdown(null) }} />
                    </div>

                    {types.length > 0 && <div className="booking-selection-confirm mt-4 flex items-start gap-3 rounded-md border border-gos-turquoise/40 bg-[#eef8f7] px-3 py-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-gos-turquoise" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-xs font-extrabold text-gos-blue-deep sm:text-sm">{types.length} {types.length === 1 ? "service" : "services"} added</p><p className="shrink-0 text-xs font-extrabold text-gos-turquoise">{symbol}{baseAmount.toFixed(2)}</p></div><p className="mt-1 text-[11px] font-semibold leading-4 text-gos-muted">{types.join(" · ")}</p></div></div>}
                  </StepCard>
                )}

                {currentStep === 2 && (
                  <StepCard number="02" title="Support method" subtitle="Choose remote support or on-site technician">
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <SupportCard title="Remote Support" subtitle="Online support by appointment" icon={Monitor} active={supportMode === "Remote"} onClick={() => { setSupportMode("Remote"); setWarranty("") }} />
                      <SupportCard title="On-Site Technician" subtitle="Technician visits your location" icon={Truck} active={supportMode === "Onsite"} onClick={() => setSupportMode("Onsite")} />
                    </div>

                    {supportMode === "Onsite" && (
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4">
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
                  <StepCard number="03" title="Optional extras" subtitle="Useful additions for this service. You can skip this step.">
                    <div className="divide-y divide-gos-border border-y border-gos-border">
                      {dynamicAddons.length ? dynamicAddons.map((addon) => {
                        const quantity = selectedAddons.find(({ id }) => id === addon.id)?.quantity || 0
                        const price = country === "UK" ? addon.priceUK : addon.priceUS
                        return (
                          <div key={addon.id} className={`flex min-h-14 w-full items-center justify-between gap-3 px-1 py-2.5 transition ${quantity ? "bg-[#eef8f7]" : "bg-white"}`}>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-5 text-gos-blue-deep sm:text-sm">{addon.name}</p>
                              <p className="text-[11px] font-extrabold text-gos-turquoise">{symbol}{price} each</p>
                            </div>
                            <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-md border border-gos-border bg-white" aria-label={`${addon.name} quantity`}>
                              <button type="button" onClick={() => changeAddonQuantity(addon, -1)} disabled={!quantity} aria-label={`Remove one ${addon.name}`} className="flex h-9 w-9 items-center justify-center text-gos-blue-deep transition hover:bg-gos-off-white disabled:text-slate-300"><Minus size={15} /></button>
                              <span className="flex h-9 min-w-8 items-center justify-center border-x border-gos-border text-xs font-extrabold text-gos-blue-deep">{quantity}</span>
                              <button type="button" onClick={() => changeAddonQuantity(addon, 1)} disabled={quantity >= 10} aria-label={`Add one ${addon.name}`} className="flex h-9 w-9 items-center justify-center text-gos-turquoise transition hover:bg-gos-off-white disabled:text-slate-300"><Plus size={15} /></button>
                            </div>
                          </div>
                        )
                      }) : <p className="py-4 text-sm font-semibold text-gos-muted">No extras are needed for this service.</p>}
                    </div>
                  </StepCard>
                )}

                {currentStep === 4 && (
                  <StepCard number="04" title="Customer details" subtitle="Used for updates and technician communication">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input icon={User} placeholder="Full Name" value={customerName} onChange={setCustomerName} />
                      <Input
                        icon={Phone}
                        prefix={country === "US" ? "+1" : "+44"}
                        placeholder="Phone number"
                        value={customerPhone}
                        onChange={(value) => {
                          const digits = value.replace(/\D/g, "")
                          setCustomerPhone((country === "UK" ? digits.replace(/^0/, "") : digits).slice(0, 10))
                        }}
                        inputMode="numeric"
                        maxLength={10}
                      />
                      <Input icon={Mail} placeholder="Email Address" value={customerEmail} onChange={setCustomerEmail} />
                    </div>
                  </StepCard>
                )}

                {currentStep === 5 && (
                  <StepCard number="05" title="Service location" subtitle="Required for dispatch, tax, and regional pricing">
                    <button type="button" onClick={handleAutoLocation} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 text-sm font-black text-cyan-300">
                      <LocateFixed size={18} /> Use my current location
                    </button>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input icon={Home} placeholder="House / Apartment" value={houseAddress} onChange={setHouseAddress} />
                      <Input icon={MapPin} placeholder="Street / Area" value={streetAddress} onChange={setStreetAddress} />
                      <Input icon={MapPin} placeholder="City" value={city} onChange={setCity} />
                      <Input icon={MapPin} placeholder={country === "US" ? "State" : "County / Region"} value={stateRegion} onChange={setStateRegion} />
                      <div className="sm:col-span-2">
                        <Input
                          icon={MapPin}
                          placeholder={country === "US" ? "ZIP Code" : "Postcode"}
                          value={postalCode}
                          onChange={(value) => {
                            if (country === "US") {
                              const digits = value.replace(/\D/g, "").slice(0, 9)
                              setPostalCode(digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits)
                              return
                            }
                            const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7)
                            setPostalCode(compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact)
                          }}
                          inputMode={country === "US" ? "numeric" : "text"}
                          maxLength={country === "US" ? 10 : 8}
                        />
                      </div>
                    </div>

                    <textarea rows={5} value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="Describe your issue..." className="mt-5 w-full resize-none rounded-md border border-gos-border bg-gos-off-white p-4 text-sm font-semibold text-gos-charcoal outline-none transition placeholder:text-gos-muted focus:border-gos-turquoise focus:bg-white" />
                  </StepCard>
                )}

                {currentStep === 6 && (
                  <StepCard number="06" title="Preferred schedule" subtitle="Choose when you want support">
                    <BookingCalendar value={preferredDate} onChange={setPreferredDate} />

                    <fieldset className="mt-5">
                      <legend className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-gos-muted">Available time</legend>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {timeSlots.map(({ value, label }) => {
                          const active = preferredTime === value
                          return <button key={value} type="button" onClick={() => setPreferredTime(value)} aria-pressed={active} className={`flex h-10 items-center justify-center rounded-md border px-2 text-center text-[10px] font-extrabold leading-none transition ${active ? "border-gos-blue-deep bg-gos-blue-deep text-white" : "border-gos-border bg-white text-gos-blue-deep hover:border-gos-turquoise"}`}>{label}</button>
                        })}
                      </div>
                    </fieldset>

                    <div className="mt-5 flex gap-3 border-l-2 border-gos-gold bg-[#f7f4ea] px-4 py-3">
                      <Clock3 size={17} className="mt-0.5 shrink-0 text-gos-gold" />
                      <p className="text-xs font-semibold leading-5 text-gos-charcoal">Technician assignment begins after payment and usually takes 10-15 minutes.</p>
                    </div>
                  </StepCard>
                )}

                {currentStep === 7 && (
                  <StepCard number="07" title="Review & checkout" subtitle="Confirm everything before payment">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Review label="Services" value={types.length ? types.join(", ") : "Not selected"} />
                      <Review label="Support" value={supportMode || "Not selected"} />
                      <Review label="Device" value={model || "Not selected"} />
                      <Review label="Customer" value={customerName || "Not provided"} />
                      <Review label="Location" value={[city, stateRegion, postalCode, country].filter(Boolean).join(", ") || "Not provided"} />
                      <Review label="Schedule" value={preferredDate && preferredTime ? `${preferredDate} • ${preferredTime}` : "Not selected"} />
                    </div>

                    <TrustSection />

                    <div className="booking-review-price mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                      {selectedServiceItems.map((item) => <PriceLine key={`${item.category}-${item.name}`} label={item.name} value={`${symbol}${Number(item.price).toFixed(2)}`} />)}
                      <div className="mt-3 border-t border-gos-border pt-3"><PriceLine label="Services Subtotal" value={`${symbol}${baseAmount.toFixed(2)}`} /></div>
                      <PriceLine label="Optional Extras" value={`${symbol}${addonsTotal.toFixed(2)}`} />
                      <PriceLine label="Platform Fee" value={`${symbol}${platformFee.toFixed(2)}`} />
                  
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <PriceLine label="Total" value={`${symbol}${totalAmount.toFixed(2)}`} bold />
                      </div>
                    </div>

                    <label className="booking-review-terms mt-6 flex items-start gap-3 rounded-2xl border border-gos-border bg-gos-off-white p-5">
                      <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} className="mt-1 h-4 w-4 accent-cyan-400" />
                      <span className="text-sm font-semibold leading-6 text-gos-charcoal">I agree to GeekOnSites Terms, Privacy Policy, Refund Policy and service policies. Taxes, VAT, regulatory fees, or government charges may apply where legally required.</span>
                    </label>
                  </StepCard>
                )}
              </motion.div>
            </AnimatePresence>

            {currentStep === steps.length && submitError && <div role="alert" className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700">{submitError}</div>}
            <DesktopButtons currentStep={currentStep} loading={loading} onBack={prevStep} onNext={nextStep} onSubmit={handleSubmit} />
          </motion.div>

          <DesktopSummary
             country={country}
             currentStep={currentStep}
             symbol={symbol}
             baseAmount={baseAmount}
             platformFee={platformFee}
             totalAmount={totalAmount}
             service={types.length ? types.join(", ") : service}
             selectedAddons={selectedAddons}
             addonsCount={addonsCount}
             addonsTotal={addonsTotal}
      />
        </div>
      </section>

      <MobileWizardCTA currentStep={currentStep} loading={loading} submitError={submitError} total={`${symbol}${totalAmount.toFixed(2)}`} onBack={prevStep} onNext={nextStep} onSubmit={handleSubmit} />
    </main>
  )
}

function BookingCalendar({ value, onChange }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = value ? new Date(`${value}T00:00:00`) : null
  const [visibleMonth, setVisibleMonth] = useState(() => selected || today)
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const currentMonth = year === today.getFullYear() && month === today.getMonth()
  const toValue = (day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  return (
    <div className="booking-calendar w-full min-w-0 overflow-hidden rounded-md border border-[#dbe3e8] bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 border-b border-[#dbe3e8] pb-3">
        <button type="button" disabled={currentMonth} onClick={() => setVisibleMonth(new Date(year, month - 1, 1))} aria-label="Previous month" className="flex h-8 w-8 items-center justify-center rounded-md text-gos-blue-deep hover:bg-gos-off-white disabled:opacity-25"><ChevronLeft size={16} /></button>
        <div className="flex items-center gap-2"><CalendarDays size={16} className="text-gos-turquoise" /><span className="text-sm font-extrabold text-gos-blue-deep">{visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span></div>
        <button type="button" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))} aria-label="Next month" className="flex h-8 w-8 items-center justify-center rounded-md text-gos-blue-deep hover:bg-gos-off-white"><ChevronRight size={16} /></button>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[9px] font-extrabold uppercase text-gos-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`} className="py-1">{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, index) => <span key={`empty-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const date = new Date(year, month, day)
          const dateValue = toValue(day)
          const disabled = date < today
          const active = value === dateValue
          return <button key={day} type="button" disabled={disabled} onClick={() => onChange(dateValue)} aria-pressed={active} className={`aspect-square min-h-8 rounded-md text-[11px] font-extrabold transition ${active ? "bg-gos-blue-deep text-white" : disabled ? "text-gos-muted/35" : "text-gos-blue-deep hover:bg-[#eef8f7] hover:text-gos-turquoise"}`}>{day}</button>
        })}
      </div>
    </div>
  )
}

function Stepper({ currentStep, progressPercent }) {
  return (
    <div className="mb-5 border-b border-gos-border pb-4 sm:mb-8 sm:pb-6 lg:hidden">
      <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
        <div><p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gos-muted">Booking progress</p><p className="mt-1 text-sm font-extrabold text-gos-blue-deep">{steps[currentStep - 1]}</p></div>
        <p className="text-xs font-extrabold text-gos-turquoise">{String(currentStep).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</p>
      </div>
      <div className="h-1 overflow-hidden bg-gos-border">
        <div className="h-full bg-gos-turquoise transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-7 sm:mt-4">
        {steps.map((step, index) => (
          <div key={step} className={`relative border-l px-1 first:border-l-0 sm:px-2 ${currentStep >= index + 1 ? "border-gos-turquoise" : "border-gos-border"}`}>
            <div className={`text-[9px] font-extrabold ${currentStep >= index + 1 ? "text-gos-blue-deep" : "text-gos-muted"}`}>{String(index + 1).padStart(2, "0")}</div>
            <p className={`mt-1 hidden truncate text-[9px] font-bold sm:block ${currentStep === index + 1 ? "text-gos-turquoise" : "text-gos-muted"}`}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BookingRail({ currentStep }) {
  return (
    <aside className="hidden overflow-hidden rounded-lg border border-gos-border bg-white lg:sticky lg:top-28 lg:block">
      <div className="bg-gos-blue-deep px-4 py-4">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">GOS booking</p>
        <p className="mt-1 text-sm font-extrabold text-white">Your service journey</p>
      </div>
      <ol className="px-4 py-3">
        {steps.map((step, index) => {
          const number = index + 1
          const active = number === currentStep
          const complete = number < currentStep
          return (
            <li key={step} className={`relative flex min-h-12 items-center gap-3 border-l pl-4 ${complete || active ? "border-gos-turquoise" : "border-gos-border"}`}>
              <span className={`absolute -left-1.5 h-3 w-3 rounded-full border-2 border-white ${complete || active ? "bg-gos-turquoise" : "bg-gos-border"}`} />
              <span className={`text-[9px] font-extrabold ${active ? "text-gos-turquoise" : "text-gos-muted"}`}>{String(number).padStart(2, "0")}</span>
              <span className={`text-xs font-extrabold ${active ? "text-gos-blue-deep" : complete ? "text-gos-charcoal" : "text-gos-muted"}`}>{step}</span>
            </li>
          )
        })}
      </ol>
      <div className="border-t border-gos-border bg-gos-off-white px-4 py-3">
        <p className="flex items-center gap-2 text-[10px] font-bold text-gos-blue-deep"><ShieldCheck size={14} className="text-gos-turquoise" /> Secure checkout</p>
      </div>
    </aside>
  )
}

function StepCard({ number, title, subtitle, children }) {
  return (
    <section>
      <div className="mb-5 grid grid-cols-[2rem_minmax(0,1fr)] gap-2.5 border-b border-gos-border pb-4 sm:mb-7 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-4 sm:pb-5">
        <div className="text-sm font-extrabold text-gos-turquoise sm:text-xl">{number}</div>
        <div className="min-w-0">
          <h2 className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold leading-none text-gos-blue-deep sm:text-[2.35rem]">{title}</h2>
          <p className="mt-1.5 text-xs font-semibold leading-5 text-gos-muted sm:mt-2 sm:text-sm sm:leading-6">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function DesktopButtons({ currentStep, loading, onBack, onNext, onSubmit }) {
  return (
    <div className="mt-8 hidden items-center justify-between gap-4 lg:flex">
      <button onClick={onBack} disabled={currentStep === 1} className="flex min-h-12 items-center gap-2 rounded-md border border-gos-border bg-white px-6 py-3 text-sm font-extrabold text-gos-blue-deep transition hover:border-gos-blue disabled:opacity-40">
        <ArrowLeft size={18} /> Back
      </button>
      {currentStep < steps.length ? (
        <button onClick={onNext} className="flex min-h-12 items-center gap-3 rounded-md bg-gos-blue-deep px-8 py-3 text-sm font-extrabold text-white transition hover:bg-gos-blue">Continue <ArrowRight size={18} /></button>
      ) : (
        <button onClick={onSubmit} disabled={loading} className="flex min-h-12 items-center gap-3 rounded-md bg-gos-blue-deep px-8 py-3 text-sm font-extrabold text-white transition hover:bg-gos-blue disabled:opacity-60">
          <CreditCard size={19} /> {loading ? "Creating Booking..." : "Continue to Payment"}
        </button>
      )}
    </div>
  )
}

function MobileWizardCTA({
  currentStep,
  loading,
  submitError,
  total,
  onBack,
  onNext,
  onSubmit,
}) {
  const showPrice = currentStep >= 4

  return (
    <div className="gos-booking-mobile-bar fixed bottom-16 left-0 right-0 z-[9999] border-t border-white/15 bg-gos-blue-deep px-3 py-2 text-white backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        {currentStep > 1 && (
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-white/55">
            Step {currentStep} of {steps.length}
          </p>

          <p className="truncate text-sm font-extrabold text-white">
            {showPrice ? total : steps[currentStep - 1]}
          </p>

          {!showPrice && (
            <p className="text-[10px] text-white/55">
              Estimate updates after configuration
            </p>
          )}
        </div>

        {currentStep < steps.length ? (
          <button
            onClick={onNext}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gos-turquoise text-white shadow-sm"
            aria-label={`Continue to ${steps[currentStep]}`}
            title={`Continue to ${steps[currentStep]}`}
          >
            <ArrowRight size={17} />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={loading}
            className="booking-payment-button flex h-11 min-w-[9.25rem] shrink-0 items-center justify-center gap-2 rounded-md bg-gos-turquoise px-3 text-xs font-extrabold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Preparing..." : submitError ? "Try Again" : "Continue to Payment"} <ArrowRight size={15} />
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
  platformFee,
  totalAmount,
  service,
  selectedAddons,
  addonsCount,
  addonsTotal,
}) {
  const showPrice = currentStep >= 4

  return (
    <motion.aside
      initial={{ opacity: 0, x: 45 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden h-fit rounded-lg border border-gos-border bg-white p-5 lg:sticky lg:top-28 lg:block"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gos-border pb-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gos-turquoise">Live estimate</p><h2 className="mt-1 font-['Cormorant_Garamond'] text-2xl font-bold text-gos-blue-deep">Booking summary</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-md bg-gos-off-white text-gos-turquoise"><ShieldCheck size={18} /></span></div>

      <div className="mt-5 border-b border-gos-border pb-5">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-gos-muted">
          {showPrice ? "Estimated Total" : "Configure Your Service"}
        </p>

        <p className="mt-1 font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">
          {showPrice ? `${symbol}${totalAmount.toFixed(2)}` : "Price updates later"}
        </p>

        {!showPrice && (
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Select a service and any optional extras to see your complete estimate.
          </p>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <Preview label="Current Step" value={steps[currentStep - 1]} />
        <Preview label="Service" value={service || "Not selected"} />
        <Preview label="Extras" value={selectedAddons.length ? `${addonsCount} selected` : "None selected"} />
      </div>

      {showPrice && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <PriceLine label="Service Fee" value={`${symbol}${baseAmount.toFixed(2)}`} />
          {addonsTotal > 0 && <PriceLine label="Optional Extras" value={`${symbol}${addonsTotal.toFixed(2)}`} />}
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
        <div key={item} className="flex items-center gap-3 border-b border-gos-border px-0 py-3">
          <CheckCircle2 size={17} className="shrink-0 text-gos-turquoise" />
          <p className="text-sm font-bold text-gos-charcoal">{item}</p>
        </div>
      ))}
    </div>
  )
}

function HeroMini({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 border-l border-white/20 px-3 first:border-l-0">
      <Icon className="text-gos-gold" size={16} />
      <p className="text-xs font-extrabold text-white">{title}</p>
    </div>
  )
}

function SupportCard({ title, subtitle, icon: Icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`grid min-h-20 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2 rounded-md border p-2.5 text-left transition sm:min-h-28 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-3 sm:p-4 ${active ? "border-gos-turquoise bg-[#eef8f7]" : "border-gos-border bg-gos-off-white hover:border-gos-turquoise"}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-md sm:h-10 sm:w-10 ${active ? "bg-gos-turquoise text-white" : "bg-white text-gos-blue"}`}><Icon size={17} /></span>
      <span><span className="block text-[11px] font-extrabold leading-4 text-gos-blue-deep sm:text-sm">{title}</span><span className="mt-0.5 hidden text-xs font-semibold leading-5 text-gos-muted sm:block">{subtitle}</span></span>
    </button>
  )
}

function CustomDropdown({ label, value, placeholder, options, open, onToggle, onSelect, disabled }) {
  return (
    <div className="relative">
      <label className="mb-2 block text-[11px] font-extrabold text-gos-blue-deep sm:text-xs">{label}</label>
      <button type="button" onClick={onToggle} disabled={disabled} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-md border border-gos-border bg-white px-4 py-3 text-left transition hover:border-gos-turquoise disabled:bg-gos-off-white disabled:opacity-55 sm:min-h-12">
        <span className={`min-w-0 break-words text-sm leading-5 ${value ? "font-extrabold text-gos-blue-deep" : "font-semibold text-gos-muted"}`}>{value || placeholder}</span>
        <ChevronDown size={17} className={`shrink-0 text-gos-turquoise transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 4 }} exit={{ opacity: 0, y: 8 }} className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-md border border-gos-border bg-white shadow-xl">
            {options.map((option) => <button type="button" key={option} onClick={() => onSelect(option)} className="block min-h-12 w-full border-b border-gos-border px-4 py-3 text-left text-sm font-semibold leading-5 text-gos-blue-deep last:border-b-0 hover:bg-gos-off-white">{option}</button>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Input({ icon: Icon, prefix, placeholder, value, onChange, type = "text", inputMode, maxLength }) {
  return (
    <div className="flex min-h-12 items-center gap-3 border-b border-gos-border bg-transparent px-1 py-3 transition focus-within:border-gos-turquoise">
      <Icon size={18} className="shrink-0 text-cyan-300" />
      {prefix && <span className="shrink-0 border-r border-gos-border pr-2 text-sm font-extrabold text-gos-blue-deep">{prefix}</span>}
      <input type={type} inputMode={inputMode} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-semibold outline-none placeholder-gray-500" />
    </div>
  )
}

function Review({ label, value }) {
  return (
    <div className="border-b border-gos-border py-3">
      <p className="text-xs font-bold text-gos-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-extrabold leading-5 text-gos-blue-deep">{value}</p>
    </div>
  )
}

function PriceLine({ label, value, bold }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <p className={bold ? "text-lg font-black text-gos-blue-deep" : "min-w-0 text-sm font-bold leading-5 text-gos-charcoal"}>{label}</p>
      <p className={bold ? "shrink-0 text-2xl font-black text-gos-turquoise" : "shrink-0 font-black text-gos-blue-deep"}>{value}</p>
    </div>
  )
}

function Preview({ label, value }) {
  return (
    <div className="border-b border-gos-border py-3">
      <p className="text-xs font-bold text-gos-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-extrabold leading-5 text-gos-blue-deep">{value}</p>
    </div>
  )
}
