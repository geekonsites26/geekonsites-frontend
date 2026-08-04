import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import logo from "../assets/logo.png"
import { createTechnician } from "../services/technicianService"
import {
  ArrowLeft,
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
  UploadCloud,
  User,
  Wrench,
  X,
} from "lucide-react"

const steps = [
  "Personal Info",
  "Professional Info",
  "Service Skills",
  "HR Verification",
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

  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    fullName: "",
    personalEmail: "",
    phone: "",
    password: "",
    confirmPassword: "",

    country: "UK",
    countryCode: "+44",
    state: "",
    city: "",
    experience: "",
    availability: "",
    remoteSupport: "",

    skills: [],

    nationalInsurance: "",
    ssn: "",
    drivingLicense: "",
    profilePhoto: "",
    governmentId: "",
    drivingLicenseFile: "",

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
        !form.remoteSupport
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
      if (form.country === "UK" && !form.nationalInsurance) {
        alert("Please enter National Insurance Number.")
        return false
      }

      if (form.country === "US" && !form.ssn) {
        alert("Please enter SSN.")
        return false
      }

      if (
        !form.drivingLicense ||
        !form.profilePhoto ||
        !form.governmentId ||
        !form.drivingLicenseFile ||
        !form.backgroundConsent ||
        !form.contractorAgreement ||
        !form.terms
      ) {
        alert("Please complete all HR verification requirements.")
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

  try {
    const technicianData = {
      name: form.fullName,
      email: form.personalEmail,
      phone: `${form.countryCode}${form.phone}`,
      country: form.country,
      city: form.city,
      specialization: form.skills.join(", "),
      experienceYears: Number(form.experience.split("-")[0]) || 0,
    }

    await createTechnician(technicianData)

    setSubmitted(true)

    setTimeout(() => {
      navigate("/technician-login")
    }, 1200)
  } catch (error) {
    alert("Technician application failed. Please try again.")
  }
}

  return (
    <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">
      <div className="absolute top-20 left-5 md:left-20 w-72 h-72 bg-cyan-500/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-10 right-5 md:right-20 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full" />

      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 w-11 h-11 md:w-auto md:px-4 md:py-3 rounded-2xl bg-[#071122]/90 border border-cyan-500/20 flex items-center justify-center gap-2 text-cyan-300 hover:bg-cyan-500/10 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:block text-sm font-semibold">
          Back to Website
        </span>
      </button>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-10 min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-center">
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
          <div className="lg:hidden mb-8 text-center">
            <img
              src={logo}
              alt="GeekOnSites Logo"
              className="mx-auto h-20 w-auto object-contain"
            />

            <h1 className="mt-4 text-3xl font-black">GeekOnSites</h1>
            <p className="text-cyan-300 mt-1">Technician Application</p>
          </div>

          <div className="rounded-[32px] md:rounded-[38px] bg-[#071122]/95 border border-cyan-500/20 p-5 sm:p-7 md:p-9 shadow-2xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-3xl md:text-4xl font-black">
                  Apply as Technician
                </h2>
                <p className="mt-2 text-cyan-100/50 text-sm md:text-base">
                  Personal email now. Company mail after approval.
                </p>
              </div>

              <img
                src={logo}
                alt="GeekOnSites Logo"
                className="hidden sm:block h-14 w-auto object-contain"
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
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
                  Application submitted. Redirecting to technician login...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7">
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

                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-4 py-4">
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
                            className="bg-[#0b1628] text-white outline-none"
                          >
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
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
                            placeholder={
                              form.countryCode === "+1"
                                ? "5551234567"
                                : "7123456789"
                            }
                            className="w-full bg-transparent text-white outline-none placeholder:text-cyan-100/25"
                          />
                        </div>

                        <p className="mt-2 text-xs text-cyan-100/35">
                          {form.countryCode === "+1"
                            ? "US format: +1 5551234567"
                            : "UK format: +44 7123456789"}
                        </p>
                      </div>

                      <InputField
                        icon={Mail}
                        label="Personal Email Address"
                        type="email"
                        name="personalEmail"
                        value={form.personalEmail}
                        onChange={update}
                        placeholder="example@gmail.com"
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-2xl bg-[#0b1628] border border-white/10 p-4">
                        <Rule ok={passwordRules.length} text="8+ characters" />
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
                          options={["UK", "US"]}
                        />

                        <InputField
                          icon={MapPin}
                          label={form.country === "UK" ? "County / Region" : "State"}
                          name="state"
                          value={form.state}
                          onChange={update}
                          placeholder={form.country === "UK" ? "England" : "Texas"}
                        />
                      </div>

                      <InputField
                        icon={MapPin}
                        label="City / Service Area"
                        name="city"
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
                      {form.country === "UK" ? (
                        <InputField
                          icon={FileBadge2}
                          label="National Insurance Number"
                          name="nationalInsurance"
                          value={form.nationalInsurance}
                          onChange={update}
                          placeholder="Enter NI number"
                        />
                      ) : (
                        <InputField
                          icon={FileBadge2}
                          label="SSN"
                          name="ssn"
                          value={form.ssn}
                          onChange={update}
                          placeholder="Enter SSN"
                        />
                      )}

                      <InputField
                        icon={FileBadge2}
                        label="Driving License Number"
                        name="drivingLicense"
                        value={form.drivingLicense}
                        onChange={update}
                        placeholder="Enter license number"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <UploadBox label="Profile Photo" name="profilePhoto" value={form.profilePhoto} onChange={update} />
                        <UploadBox label="Government ID" name="governmentId" value={form.governmentId} onChange={update} />
                        <UploadBox label="Driving License" name="drivingLicenseFile" value={form.drivingLicenseFile} onChange={update} />
                      </div>

                      <CheckBox
                        name="backgroundConsent"
                        checked={form.backgroundConsent}
                        onChange={update}
                        label="I consent to GeekOnSites background check and identity verification."
                      />

                      <CheckBox
                        name="contractorAgreement"
                        checked={form.contractorAgreement}
                        onChange={update}
                        label="I accept the GeekOnSites contractor agreement."
                      />

                      <CheckBox
                        name="terms"
                        checked={form.terms}
                        onChange={update}
                        label="I agree to technician onboarding terms and conditions."
                      />
                    </>
                  )}

                  {step === 4 && (
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

              <div className="mt-8 flex gap-3">
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
                    disabled={submitted}
                    className={`${
                      step > 0 ? "w-2/3" : "w-full"
                    } bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-70 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 transition`}
                  >
                    {submitted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Submitted
                      </>
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

function SelectField({ label, options, ...props }) {
  return (
    <div>
      <label className="text-sm text-cyan-100/70">{label}</label>

      <div className="relative mt-2">
        <select
          {...props}
          required
          className="w-full appearance-none bg-[#0b1628] border border-white/10 focus:border-cyan-400/60 rounded-2xl px-4 py-4 text-white outline-none"
        >
        <option
  value=""
  style={{
    backgroundColor: "#0b1628",
    color: "#ffffff",
  }}
>
  Select
</option>

{options.map((option) => (
  <option
    key={option}
    value={option}
    style={{
      backgroundColor: "#0b1628",
      color: "#ffffff",
    }}
  >
    {option}
  </option>
))}
        </select>

        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/70" />
      </div>
    </div>
  )
}

function UploadBox({ label, name, value, onChange }) {
  return (
    <label className="cursor-pointer rounded-2xl bg-[#0b1628] border border-dashed border-cyan-500/20 p-4 text-center hover:border-cyan-400/50 transition">
      <input type="file" name={name} onChange={onChange} className="hidden" />

      <UploadCloud className="w-7 h-7 text-cyan-300 mx-auto" />
      <p className="mt-3 text-sm font-bold text-cyan-100/80">{label}</p>
      <p className="mt-1 text-xs text-cyan-100/35 truncate">
        {value || "Upload file"}
      </p>
    </label>
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
    <div className={`flex items-center gap-2 text-xs ${ok ? "text-cyan-300" : "text-cyan-100/35"}`}>
      {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {text}
    </div>
  )
}

function ReviewBlock({ title, children }) {
  return (
    <div className="rounded-2xl bg-[#0b1628] border border-white/10 p-4">
      <h3 className="font-bold text-cyan-100 mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Review({ label, value }) {
  return (
    <div>
      <p className="text-xs text-cyan-100/35">{label}</p>
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
    <div className="rounded-2xl bg-[#0b1628] border border-white/10 p-3 text-center">
      <p className="text-[11px] text-cyan-100/35">{label}</p>
      <h3 className="text-sm font-bold mt-1">{value}</h3>
    </div>
  )
}