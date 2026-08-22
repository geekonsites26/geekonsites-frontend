import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { createTechnician } from "../services/technicianService"
import { getLocation } from "../utils/location"
import AuthHeader from "../components/auth/AuthHeader"
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileBadge2,
  FileText,
  Laptop,
  Lock,
  Mail,
  MapPin,
  MonitorCog,
  Phone,
  Printer,
  Router,
  ShieldCheck,
  Star,
  User,
  Wrench,
  X,
} from "lucide-react"

const steps = [
  "Personal Info",
  "Professional Info",
  "Service Skills",
  "Identity Verification",
  "Compliance",
  "Review",
]

const serviceSkills = [
  { title: "Laptop Repair", icon: Laptop },
  { title: "Desktop Repair", icon: MonitorCog },
  { title: "Printer Services", icon: Printer },
  { title: "WiFi & Networking", icon: Router },
  { title: "CCTV & Security", icon: Camera },
  { title: "Software Support", icon: Wrench },
  { title: "Business IT Support", icon: BriefcaseBusiness },
  { title: "Data Recovery", icon: FileText },
  { title: "Virus Removal", icon: ShieldCheck },
]

export default function TechnicianRegister() {
  const navigate = useNavigate()
  const initialRegion = getLocation()

  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSlowSubmission, setIsSlowSubmission] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [form, setForm] = useState({
    fullName: "",
    personalEmail: "",
    phone: "",
    password: "",
    confirmPassword: "",

    country: initialRegion.code,
    countryCode: initialRegion.dialCode,
    state: "",
    city: "",
    experience: "",
    availability: "",
    remoteSupport: "",
    employmentType: "INDEPENDENT_CONTRACTOR",
    serviceMode: "",
    citizenshipStatus: "",
    identityDocumentType: "",
    identityDocumentName: "",
    identityDocumentData: "",
    livePhotoData: "",
    workAuthorizationType: "",
    workAuthorizationExpiry: "",
    workAuthorizationDocumentName: "",
    workAuthorizationDocumentData: "",
    addressHistory: "",
    addressProofName: "",
    addressProofData: "",
    drivingLicenseName: "",
    drivingLicenseData: "",
    vehicleInsuranceName: "",
    vehicleInsuranceData: "",
    publicLiabilityName: "",
    publicLiabilityData: "",

    skills: [],

    backgroundConsent: false,
    contractorAgreement: false,
    terms: false,
  })

  const passwordRules = useMemo(
    () => ({
      length: form.password.length >= 8,
      upper: /[A-Z]/.test(form.password),
      lower: /[a-z]/.test(form.password),
      number: /[0-9]/.test(form.password),
      special: /[^A-Za-z0-9]/.test(form.password),
      match:
        form.password.length > 0 &&
        form.confirmPassword.length > 0 &&
        form.password === form.confirmPassword,
    }),
    [form.password, form.confirmPassword]
  )

  const update = (e) => {
    const { name, value, type, checked, files } = e.target

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0]?.name || ""
          : value,
      ...(name === "country"
        ? { countryCode: value === "US" ? "+1" : "+44", phone: "" }
        : {}),
    }))
  }

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((item) => item !== skill)
        : [...prev.skills, skill],
    }))
  }

  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("The selected file could not be read."))
    reader.readAsDataURL(file)
  })

  const optimizeEvidenceImage = async (file) => {
    const originalDataUrl = await readAsDataUrl(file)
    if (!file.type.startsWith("image/")) return originalDataUrl

    const image = await new Promise((resolve, reject) => {
      const preview = new Image()
      preview.onload = () => resolve(preview)
      preview.onerror = () => reject(new Error("The selected image could not be processed."))
      preview.src = originalDataUrl
    })
    const maxDimension = 1600
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height)
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"
    const optimizedDataUrl = canvas.toDataURL(outputType, 0.82)
    return optimizedDataUrl.length < originalDataUrl.length ? optimizedDataUrl : originalDataUrl
  }

  const handleIdentityDocument = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Upload a JPG, PNG, or PDF identity document.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Identity document must be 5 MB or smaller.")
      return
    }
    try {
      const dataUrl = await optimizeEvidenceImage(file)
      setForm((current) => ({
        ...current,
        identityDocumentName: file.name,
        identityDocumentData: dataUrl,
      }))
    } catch (error) {
      alert(error.message)
    }
  }

  const handleEvidenceFile = async (event, nameField, dataField) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Upload a JPG, PNG, or PDF document.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Document must be 5 MB or smaller.")
      return
    }
    try {
      const dataUrl = await optimizeEvidenceImage(file)
      setForm((current) => ({ ...current, [nameField]: file.name, [dataField]: dataUrl }))
    } catch (error) {
      alert(error.message)
    }
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName || !form.personalEmail || !form.phone) {
        alert("Please complete personal information.")
        return false
      }

      if (!isValidEmail(form.personalEmail)) {
        alert("Please enter a valid personal email address.")
        return false
      }

      if (!/^\d{10}$/.test(form.phone)) {
        alert(
          form.country === "US"
            ? "US mobile number must contain 10 digits"
            : "UK mobile number must contain 10 digits"
        )
        return false
      }

      if (!Object.values(passwordRules).every(Boolean)) {
        alert("Please complete all password requirements.")
        return false
      }
    }

    if (step === 1) {
      if (
        !form.country ||
        !form.state ||
        !form.city ||
        !form.experience ||
        !form.availability ||
        !form.remoteSupport ||
        !form.serviceMode
      ) {
        alert("Please complete professional information.")
        return false
      }
    }

    if (step === 2 && form.skills.length === 0) {
      alert("Please select at least one service skill.")
      return false
    }

    if (step === 3) {
      if (
        !form.citizenshipStatus ||
        !form.identityDocumentType ||
        !form.identityDocumentData ||
        !form.livePhotoData
      ) {
        alert("Please complete all HR verification requirements.")
        return false
      }
    }

    if (step === 4) {
      const onsiteRequired = form.serviceMode !== "REMOTE_ONLY"
      if (!form.workAuthorizationType || !form.addressHistory || !form.addressProofData ||
          (form.citizenshipStatus === "FOREIGN_NATIONAL" && !form.workAuthorizationDocumentData) ||
          (onsiteRequired && (!form.drivingLicenseData || !form.vehicleInsuranceData || !form.publicLiabilityData)) ||
          !form.backgroundConsent || !form.contractorAgreement || !form.terms) {
        alert("Please complete all compliance requirements.")
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep((prev) => Math.min(prev + 1, steps.length - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  if (isSubmitting || submitted) return

  setSubmitError("")
  setIsSubmitting(true)
  setIsSlowSubmission(false)
  const slowSubmissionTimer = window.setTimeout(() => {
    setIsSlowSubmission(true)
  }, 7000)

  try {
    const technicianData = {
      name: form.fullName,
      email: form.personalEmail,
      password: form.password,
      phone: `${form.countryCode}${form.phone}`,
      country: form.country,
      city: form.city,
      specialization: form.skills.join(", "),
      experienceYears: Number(form.experience.split("-")[0]) || 0,
      citizenshipStatus: form.citizenshipStatus,
      identityDocumentType: form.identityDocumentType,
      identityDocumentName: form.identityDocumentName,
      identityDocumentData: form.identityDocumentData,
      livePhotoData: form.livePhotoData,
      employmentType: form.employmentType,
      serviceMode: form.serviceMode,
      workAuthorizationType: form.workAuthorizationType,
      workAuthorizationExpiry: form.workAuthorizationExpiry,
      workAuthorizationDocumentName: form.workAuthorizationDocumentName,
      workAuthorizationDocumentData: form.workAuthorizationDocumentData,
      addressHistory: form.addressHistory,
      addressProofName: form.addressProofName,
      addressProofData: form.addressProofData,
      drivingLicenseName: form.drivingLicenseName,
      drivingLicenseData: form.drivingLicenseData,
      vehicleInsuranceName: form.vehicleInsuranceName,
      vehicleInsuranceData: form.vehicleInsuranceData,
      publicLiabilityName: form.publicLiabilityName,
      publicLiabilityData: form.publicLiabilityData,
    }

    await createTechnician(technicianData)

    setSubmitError("")
    setSubmitted(true)

    setTimeout(() => {
      navigate("/technician-login")
    }, 1200)
  } catch (error) {
    const isConnectivityFailure =
      error?.name === "TypeError" ||
      error?.message === "The server is taking too long to respond. Please try again."
    setSubmitError(
      isConnectivityFailure
        ? "We couldn't submit your application right now. Please try again."
        : error?.message || "We couldn't submit your application right now. Please try again."
    )
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  } finally {
    window.clearTimeout(slowSubmissionTimer)
    setIsSlowSubmission(false)
    setIsSubmitting(false)
  }
}

  return (
    <div className="gos-technician-auth gos-technician-register min-h-screen bg-[#020817] text-white relative overflow-hidden">
      <AuthHeader />
      <div className="absolute top-20 left-5 md:left-20 w-72 h-72 bg-cyan-500/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-10 right-5 md:right-20 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 min-h-[calc(100dvh-3.75rem)] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-center">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden lg:block"
        >
          <div className="rounded-[38px] bg-[#071122]/90 border border-cyan-500/20 p-9 xl:p-11 shadow-2xl overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-cyan-300 text-sm font-semibold">
                <ShieldCheck className="w-5 h-5" />
                Technician HR Application
              </div>

              <h1 className="mt-8 text-5xl xl:text-6xl font-black leading-tight">
                Join the
                <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text">
                  GOS Network
                </span>
              </h1>

              <p className="mt-6 text-cyan-100/60 text-lg leading-relaxed max-w-2xl">
                Apply with your personal email. After HR approval, GeekOnSites
                will assign your official @gos.com technician account and enable
                dashboard access.
              </p>

              <div className="mt-9 rounded-[32px] bg-[#020817] border border-white/10 p-6 relative overflow-hidden">
                <div className="relative grid grid-cols-2 gap-5">
                  <FeatureCard icon={BriefcaseBusiness} title="HR Review" value="Required" />
                  <FeatureCard icon={Laptop} title="Remote Jobs" value="Supported" />
                  <FeatureCard icon={MapPin} title="Service Area" value="US & UK" />
                  <FeatureCard icon={Star} title="Approval" value="@gos.com" />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-4">
                <StatCard title="Step 1" value="Apply" />
                <StatCard title="Step 2" value="Review" />
                <StatCard title="Step 3" value="Approve" />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="w-full"
        >
          <div className="rounded-[32px] md:rounded-[38px] bg-[#071122]/95 border border-cyan-500/20 p-5 sm:p-7 md:p-9 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-cyan-300">Technician portal</p>
                <h2 className="text-3xl md:text-4xl font-black">
                  Apply as technician.
                </h2>
                <p className="mt-2 text-cyan-100/50 text-sm md:text-base">
                  Personal email now. Company mail after approval.
                </p>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-3 gap-0 border-y border-gos-border">
              <SmallInfo label="Status" value="Pending" />
              <SmallInfo label="Region" value="US/UK" />
              <SmallInfo label="Mail" value="After HR" />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                  Step {step + 1} of {steps.length}
                </p>

                <p className="text-sm font-semibold text-cyan-100/60">
                  {steps[step]}
                </p>
              </div>

              <div className="mt-3 h-2 rounded-full bg-[#0b1628] border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {submitted && (
              <div className="mt-6 rounded-2xl bg-green-500/10 border border-green-500/20 p-4 flex gap-3 text-green-300">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                  Status: HR Review Pending. Official GeekOnSites company mail
                  will be assigned only after admin approval.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off" className="mt-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {step === 0 && (
                    <>
                      <InputField
                        icon={User}
                        label="Full Legal Name"
                        name="fullName"
                        value={form.fullName}
                        onChange={update}
                        placeholder="Enter full name"
                      />

                      <div>
                        <label className="text-sm text-cyan-100/70">
                          Mobile Number
                        </label>

                        <div className="tech-phone-field mt-2 flex items-center rounded-2xl border border-white/10 bg-[#0b1628]">
                          <Phone className="w-5 h-5 text-cyan-300/70 shrink-0" />

                          <select
                            value={form.countryCode}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                countryCode: e.target.value,
                                country: e.target.value === "+1" ? "US" : "UK",
                                phone: "",
                              })
                            }
                            aria-label="Country calling code"
                            className="tech-dial-code bg-[#0b1628] text-white outline-none"
                          >
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                          </select>

                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={form.phone}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                phone: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            placeholder="Mobile number"
                            aria-label="Mobile number"
                            className="tech-phone-number min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-cyan-100/25"
                          />
                        </div>

                      </div>

                      <InputField
                        icon={Mail}
                        label="Personal Email Address"
                        type="email"
                        name="personalEmail"
                        value={form.personalEmail}
                        onChange={update}
                        placeholder="Enter personal email"
                      />

                      <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4 flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
                        <p className="text-sm text-cyan-100/60 leading-relaxed">
                          Official GeekOnSites technician email will be created
                          only after HR approval.
                        </p>
                      </div>

                      <PasswordField
                        label="Create Password"
                        name="password"
                        value={form.password}
                        onChange={update}
                        show={showPassword}
                        setShow={setShowPassword}
                      />

                      <PasswordField
                        label="Confirm Password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={update}
                        show={showConfirmPassword}
                        setShow={setShowConfirmPassword}
                      />

                      <div className="tech-password-rules grid grid-cols-2 gap-x-3 gap-y-2 px-1">
                        <Rule ok={passwordRules.length} text="8 or more characters" />
                        <Rule ok={passwordRules.upper} text="Uppercase letter" />
                        <Rule ok={passwordRules.lower} text="Lowercase letter" />
                        <Rule ok={passwordRules.number} text="Number" />
                        <Rule ok={passwordRules.special} text="Special character" />
                        <Rule ok={passwordRules.match} text="Passwords match" />
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <SelectField
                          label="Country"
                          name="country"
                          value={form.country}
                          onChange={update}
                          options={[
                            { value: "UK", label: "United Kingdom" },
                            { value: "US", label: "United States" },
                          ]}
                        />

                        <InputField
                          icon={MapPin}
                          label={form.country === "UK" ? "County / Region" : "State"}
                          name="state"
                          autoComplete="off"
                          data-form-type="other"
                          value={form.state}
                          onChange={update}
                          placeholder={form.country === "UK" ? "Enter county or region" : "Enter state"}
                        />
                      </div>

                      <InputField
                        icon={MapPin}
                        label="City / Service Area"
                        name="city"
                        autoComplete="off"
                        data-form-type="other"
                        value={form.city}
                        onChange={update}
                        placeholder="Enter city"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <SelectField
                          label="Years of Experience"
                          name="experience"
                          value={form.experience}
                          onChange={update}
                          options={["0-1 Years", "1-3 Years", "3-5 Years", "5+ Years"]}
                        />

                        <SelectField
                          label="Availability"
                          name="availability"
                          value={form.availability}
                          onChange={update}
                          options={["Full Time", "Part Time", "Weekends"]}
                        />
                      </div>

                      <SelectField
                        label="Remote Support Capable"
                        name="remoteSupport"
                        value={form.remoteSupport}
                        onChange={update}
                        options={["Yes", "No"]}
                      />

                      <SelectField
                        label="Service delivery"
                        name="serviceMode"
                        value={form.serviceMode}
                        onChange={update}
                        options={[
                          { value: "REMOTE_ONLY", label: "Remote support only" },
                          { value: "ONSITE_ONLY", label: "On-site service only" },
                          { value: "REMOTE_AND_ONSITE", label: "Remote and on-site service" },
                        ]}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <p className="text-sm text-cyan-100/50 leading-relaxed">
                        Select the services this technician can professionally
                        handle for GeekOnSites customers.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[430px] overflow-y-auto pr-1">
                        {serviceSkills.map(({ title, icon: Icon }) => {
                          const active = form.skills.includes(title)

                          return (
                            <button
                              key={title}
                              type="button"
                              onClick={() => toggleSkill(title)}
                              className={`rounded-3xl border p-4 text-left transition flex items-center justify-between gap-4 ${
                                active
                                  ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-200"
                                  : "bg-[#0b1628] border-white/10 text-cyan-100/70 hover:border-cyan-500/30"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <span className="w-11 h-11 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-cyan-300" />
                                </span>
                                <span className="font-bold text-sm">{title}</span>
                              </span>

                              {active && <CheckCircle2 className="w-5 h-5 text-cyan-300" />}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <SelectField
                        label="Citizenship status"
                        name="citizenshipStatus"
                        value={form.citizenshipStatus}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          citizenshipStatus: event.target.value,
                          identityDocumentType: event.target.value === "FOREIGN_NATIONAL" ? "PASSPORT" : "",
                          identityDocumentName: "",
                          identityDocumentData: "",
                        }))}
                        options={[
                          { value: "LOCAL_CITIZEN", label: `Citizen of ${form.country === "US" ? "the United States" : "the United Kingdom"}` },
                          { value: "FOREIGN_NATIONAL", label: "Foreign national" },
                        ]}
                      />

                      {form.citizenshipStatus && (
                        <SelectField
                          label="Identity document"
                          name="identityDocumentType"
                          value={form.identityDocumentType}
                          onChange={update}
                          options={form.citizenshipStatus === "FOREIGN_NATIONAL"
                            ? [{ value: "PASSPORT", label: "Passport" }]
                            : [
                                { value: "DRIVING_LICENSE", label: "Driving licence" },
                                { value: "STATE_ID", label: "State or government identity card" },
                                { value: "PASSPORT", label: "Passport" },
                              ]}
                        />
                      )}

                      {form.identityDocumentType && (
                        <label className="tech-verification-upload block cursor-pointer rounded-lg border border-dashed border-gos-border bg-white p-4">
                          <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleIdentityDocument} className="hidden" />
                          <span className="flex items-center gap-3">
                            <FileBadge2 className="h-5 w-5 text-gos-turquoise" />
                            <span><strong className="block text-sm text-gos-blue-deep">Upload {form.identityDocumentType === "PASSPORT" ? "passport" : "government ID"}</strong><span className="text-xs text-gos-muted">{form.identityDocumentName || "JPG, PNG, or PDF up to 5 MB"}</span></span>
                          </span>
                        </label>
                      )}

                      <LivePhotoCapture
                        value={form.livePhotoData}
                        onCapture={(photo) => setForm((current) => ({ ...current, livePhotoData: photo }))}
                      />

                    </>
                  )}

                  {step === 4 && (
                    <>
                      <SelectField
                        label="Engagement type"
                        name="employmentType"
                        value={form.employmentType}
                        onChange={update}
                        options={[{ value: "INDEPENDENT_CONTRACTOR", label: "Independent contractor" }, { value: "EMPLOYEE", label: "Employee" }]}
                      />
                      <SelectField
                        label="Right to work verification"
                        name="workAuthorizationType"
                        value={form.workAuthorizationType}
                        onChange={update}
                        options={form.country === "US"
                          ? (form.citizenshipStatus === "LOCAL_CITIZEN"
                              ? [{ value: "US_CITIZEN_I9", label: "US citizen - I-9 verification" }]
                              : [{ value: "PERMANENT_RESIDENT", label: "Permanent Resident Card" }, { value: "EMPLOYMENT_AUTHORIZATION", label: "Employment Authorization Document" }, { value: "FOREIGN_PASSPORT_I94", label: "Foreign passport with valid I-94/status" }])
                          : (form.citizenshipStatus === "LOCAL_CITIZEN"
                              ? [{ value: "BRITISH_IRISH_DOCUMENT", label: "British or Irish passport/document check" }]
                              : [{ value: "HOME_OFFICE_SHARE_CODE", label: "Home Office share code / eVisa" }, { value: "EMPLOYER_CHECKING_SERVICE", label: "Employer Checking Service verification" }])}
                      />
                      {form.citizenshipStatus === "FOREIGN_NATIONAL" && <>
                        <InputField label="Work permission expiry" name="workAuthorizationExpiry" type="date" value={form.workAuthorizationExpiry} onChange={update} />
                        <EvidenceUpload label="Work authorisation evidence" value={form.workAuthorizationDocumentName} onChange={(event) => handleEvidenceFile(event, "workAuthorizationDocumentName", "workAuthorizationDocumentData")} />
                      </>}
                      <div><label className="text-sm text-cyan-100/70">Address history for the last 5 years</label><textarea name="addressHistory" value={form.addressHistory} onChange={update} rows={4} placeholder="Enter each address and the dates lived there" className="mt-2 w-full rounded-lg border border-gos-border bg-white p-3 text-sm text-gos-charcoal outline-none" /></div>
                      <EvidenceUpload label="Proof of current address" value={form.addressProofName} onChange={(event) => handleEvidenceFile(event, "addressProofName", "addressProofData")} />
                      {form.serviceMode !== "REMOTE_ONLY" && <>
                        <p className="text-xs font-bold uppercase text-gos-turquoise">Required for on-site service</p>
                        <EvidenceUpload label="Driving licence" value={form.drivingLicenseName} onChange={(event) => handleEvidenceFile(event, "drivingLicenseName", "drivingLicenseData")} />
                        <EvidenceUpload label="Vehicle insurance with business use" value={form.vehicleInsuranceName} onChange={(event) => handleEvidenceFile(event, "vehicleInsuranceName", "vehicleInsuranceData")} />
                        <EvidenceUpload label="Public liability insurance" value={form.publicLiabilityName} onChange={(event) => handleEvidenceFile(event, "publicLiabilityName", "publicLiabilityData")} />
                      </>}
                      <CheckBox name="backgroundConsent" checked={form.backgroundConsent} onChange={update} label="I consent to identity and legally permitted background checks." />
                      <CheckBox name="contractorAgreement" checked={form.contractorAgreement} onChange={update} label="I accept the applicable technician services agreement." />
                      <CheckBox name="terms" checked={form.terms} onChange={update} label="I agree to the technician onboarding terms and privacy notice." />
                    </>
                  )}

                  {step === 5 && (
                    <>
                      <ReviewBlock title="Personal Information">
                        <Review label="Name" value={form.fullName} />
                        <Review label="Personal Email" value={form.personalEmail} />
                        <Review label="Phone" value={`${form.countryCode}${form.phone}`} />
                      </ReviewBlock>

                      <ReviewBlock title="Professional Information">
                        <Review label="Country" value={form.country} />
                        <Review label="City" value={form.city} />
                        <Review label="Experience" value={form.experience} />
                        <Review label="Availability" value={form.availability} />
                      </ReviewBlock>

                      <ReviewBlock title="Service Skills">
                        <div className="flex flex-wrap gap-2">
                          {form.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs text-cyan-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </ReviewBlock>

                      <ReviewBlock title="Identity Verification">
                        <Review label="Citizenship" value={form.citizenshipStatus?.replaceAll("_", " ")} />
                        <Review label="Document" value={form.identityDocumentType?.replaceAll("_", " ")} />
                        <Review label="Document upload" value={form.identityDocumentName} />
                        <Review label="Live photo" value={form.livePhotoData ? "Captured" : "Required"} />
                      </ReviewBlock>

                      <ReviewBlock title="Compliance">
                        <Review label="Engagement" value={form.employmentType?.replaceAll("_", " ")} />
                        <Review label="Service delivery" value={form.serviceMode?.replaceAll("_", " ")} />
                        <Review label="Right to work" value={form.workAuthorizationType?.replaceAll("_", " ")} />
                        <Review label="Address proof" value={form.addressProofName} />
                      </ReviewBlock>

                      <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4 flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
                        <p className="text-sm text-cyan-100/60 leading-relaxed">
                          Status: HR Review Pending. Official GeekOnSites
                          company mail will be assigned only after admin
                          approval.
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-wrap gap-3">
                {submitError && (
                  <div className="w-full basis-full rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                    {submitError === "An account already exists for this email"
                      ? "This email is already registered. Use a different technician email or sign in to the existing account."
                      : submitError}
                  </div>
                )}
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-1/3 rounded-2xl bg-[#0b1628] border border-white/10 text-cyan-100/70 font-bold py-4 hover:border-cyan-500/30 transition"
                  >
                    Back
                  </button>
                )}

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`${
                      step > 0 ? "w-2/3" : "w-full"
                    } bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 transition`}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || submitted}
                    className={`${
                      step > 0 ? "w-2/3" : "w-full"
                    } bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-70 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 transition`}
                  >
                    {submitted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Submitted
                      </>
                    ) : isSubmitting ? (
                      <span className="px-2 text-center text-sm sm:text-base">
                        {isSlowSubmission
                          ? "We're securely processing your technician application. This may take a moment."
                          : "Submitting your application..."}
                      </span>
                    ) : (
                      <>
                        Submit for HR Review
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            <p className="text-center text-cyan-100/45 mt-7 text-sm">
              Already approved?{" "}
              <Link
                to="/technician-login"
                className="text-cyan-300 font-semibold hover:text-cyan-200"
              >
                Login with @gos.com
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

function InputField({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="text-sm text-cyan-100/70">{label}</label>

      <div className="relative mt-2">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />
        )}

        <input
          {...props}
          required
          className={`w-full bg-[#0b1628] border border-white/10 focus:border-cyan-400/60 rounded-2xl ${
            Icon ? "pl-12" : "pl-4"
          } pr-4 py-4 text-white outline-none placeholder:text-cyan-100/25`}
        />
      </div>
    </div>
  )
}

function PasswordField({ label, show, setShow, ...props }) {
  return (
    <div>
      <label className="text-sm text-cyan-100/70">{label}</label>

      <div className="relative mt-2">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />

        <input
          {...props}
          required
          type={show ? "text" : "password"}
          placeholder="Enter password"
          className="w-full bg-[#0b1628] border border-white/10 focus:border-cyan-400/60 rounded-2xl pl-12 pr-12 py-4 text-white outline-none placeholder:text-cyan-100/25"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}

function SelectField({ label, options, name, value, onChange }) {
  const [open, setOpen] = useState(false)
  const selectRef = useRef(null)
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  )
  const selected = normalizedOptions.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutsidePress = (event) => {
      if (!selectRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener("pointerdown", closeOnOutsidePress)
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress)
  }, [open])

  const chooseOption = (nextValue) => {
    onChange({ target: { name, value: nextValue, type: "select-one" } })
    setOpen(false)
  }

  return (
    <div ref={selectRef} className="tech-custom-select">
      <label className="text-sm text-cyan-100/70">{label}</label>

      <div className="relative mt-2">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-[#0b1628] px-4 py-3 text-left ${open ? "border-cyan-400" : "border-white/10"}`}
        >
          <span className={selected ? "text-gos-charcoal" : "text-gos-muted"}>
            {selected?.label || `Select ${label.toLowerCase()}`}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-gos-turquoise transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div role="listbox" className="tech-select-menu absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-56 overflow-y-auto rounded-lg border border-gos-border bg-white p-1 shadow-xl">
            {normalizedOptions.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                key={option.value}
                onClick={() => chooseOption(option.value)}
                className={`flex min-h-11 w-full items-center rounded-md px-3 py-2 text-left text-sm font-semibold ${option.value === value ? "bg-gos-blue-deep text-white" : "text-gos-charcoal hover:bg-gos-off-white"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EvidenceUpload({ label, value, onChange }) {
  return (
    <label className="tech-verification-upload block cursor-pointer rounded-lg border border-dashed border-gos-border bg-white p-4">
      <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={onChange} className="hidden" />
      <span className="flex items-center gap-3"><FileBadge2 className="h-5 w-5 text-gos-turquoise" /><span><strong className="block text-sm text-gos-blue-deep">{label}</strong><span className="text-xs text-gos-muted">{value || "JPG, PNG, or PDF up to 5 MB"}</span></span>{value && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-600" />}</span>
    </label>
  )
}

function LivePhotoCapture({ value, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [cameraReady, setCameraReady] = useState(false)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
    setCameraReady(false)
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), [])

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return
    videoRef.current.srcObject = streamRef.current
    videoRef.current.play().catch(() => setCameraError("Camera opened but the preview could not start. Tap retry."))
  }, [cameraOpen])

  const openCamera = async () => {
    try {
      setCameraError("")
      setCameraReady(false)
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access requires the installed app or a secure HTTPS website. It is blocked on an unsecured network address.")
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      streamRef.current = stream
      setCameraOpen(true)
    } catch (error) {
      if (error?.name === "NotAllowedError") setCameraError("Camera permission is blocked. Allow Camera for this site or app in device settings, then retry.")
      else if (error?.name === "NotFoundError") setCameraError("No front camera was found on this device.")
      else if (error?.name === "NotReadableError") setCameraError("The camera is being used by another app. Close it there and retry.")
      else setCameraError("The camera could not start. Check camera permission and retry.")
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video?.videoWidth) {
      setCameraError("Wait for the camera preview to become ready, then capture.")
      return
    }
    const canvas = document.createElement("canvas")
    const width = 640
    canvas.width = width
    canvas.height = Math.round((video.videoHeight / video.videoWidth) * width)
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)
    onCapture(canvas.toDataURL("image/jpeg", 0.82))
    stopCamera()
  }

  return (
    <div className="tech-live-photo rounded-lg border border-gos-border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-sm font-bold text-gos-blue-deep">Live photo verification</p><p className="mt-1 text-xs text-gos-muted">Use the front camera. Gallery uploads are not accepted.</p></div>
        {value && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
      </div>
      {cameraOpen && <video ref={videoRef} playsInline muted onLoadedMetadata={() => setCameraReady(true)} className="mt-3 aspect-[4/3] w-full rounded-md bg-slate-950 object-cover" />}
      {value && !cameraOpen && <img src={value} alt="Captured live verification" className="mt-3 h-28 w-28 rounded-md object-cover" />}
      {cameraError && <p className="mt-2 text-xs font-semibold leading-5 text-red-700">{cameraError}</p>}
      <div className="mt-3 flex gap-2">
        {!cameraOpen ? <button type="button" onClick={openCamera} className="tech-camera-button flex min-h-10 items-center gap-2 rounded-md bg-gos-blue-deep px-4 text-xs font-bold text-white"><Camera className="h-4 w-4" />{cameraError ? "Retry camera" : value ? "Retake live photo" : "Open camera"}</button> : <><button type="button" onClick={capturePhoto} disabled={!cameraReady} className="min-h-10 rounded-md bg-gos-turquoise px-4 text-xs font-bold text-gos-blue-deep disabled:cursor-wait disabled:opacity-50">{cameraReady ? "Capture photo" : "Starting camera..."}</button><button type="button" onClick={stopCamera} className="min-h-10 rounded-md border border-gos-border px-4 text-xs font-bold text-gos-blue-deep">Cancel</button></>}
      </div>
    </div>
  )
}

function CheckBox({ label, ...props }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl bg-[#0b1628] border border-white/10 p-4 text-sm text-cyan-100/60">
      <input type="checkbox" {...props} className="mt-1 w-4 h-4 accent-cyan-400" />
      <span>{label}</span>
    </label>
  )
}

function Rule({ ok, text }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 text-[11px] ${ok ? "text-emerald-700" : "text-cyan-100/35"}`}>
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${ok ? "border-emerald-600 bg-emerald-50" : "border-slate-300 bg-white"}`}>
        {ok ? <Check className="h-2.5 w-2.5" /> : null}
      </span>
      <span className="leading-4">{text}</span>
    </div>
  )
}

function ReviewBlock({ title, children }) {
  return (
    <div className="tech-review-block rounded-2xl bg-[#0b1628] border border-white/10 p-4">
      <h3 className="mb-3 font-bold text-gos-blue-deep">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Review({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-gos-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-cyan-100/80">
        {value || "Not provided"}
      </p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-3xl bg-[#071122]/90 border border-white/10 p-5">
      <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-cyan-300" />
      </div>
      <p className="mt-4 text-cyan-100/45 text-sm">{title}</p>
      <h3 className="mt-1 font-bold">{value}</h3>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-[#0b1628] border border-white/10 p-4">
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="text-xs text-cyan-100/40 mt-1">{title}</p>
    </div>
  )
}

function SmallInfo({ label, value }) {
  return (
    <div className="border-l border-gos-border p-3 text-center first:border-l-0">
      <p className="text-[11px] text-cyan-100/35">{label}</p>
      <h3 className="text-sm font-bold mt-1">{value}</h3>
    </div>
  )
}
