import { useState } from "react"
import { sendContactMessage } from "../services/contactService"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, ShieldCheck } from "lucide-react"

import babyGirl from "../assets/baby-girl-tech.png"
import babyBoy from "../assets/baby-boy-tech.png"
import electronicsBoard from "../assets/electronics-board.png"

export default function Contact() {
  const [loading, setLoading] = useState(false)

const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
  country: "",
  subject: "",
  message: "",
})

const handleChange = (e) => {
  const { name, value } = e.target

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }))

  if (name === "country") {
    const region = value === "United States" ? "US" : "UK"

    localStorage.setItem("gos_location", region)
    localStorage.setItem("gos_country", value)
    localStorage.setItem("gos_currency", region === "US" ? "USD" : "GBP")
    localStorage.setItem("gos_symbol", region === "US" ? "$" : "£")

    window.dispatchEvent(new Event("gos-location-changed"))
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  
  try {
    await sendContactMessage(formData)

alert("Thank you! Your message has been sent successfully. Our team will contact you soon.")
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      country: "",
      subject: "",
      message: "",
    })
  } catch (error) {
    console.error("Error sending contact message:", error)
  } finally {
    setLoading(false)
  }
}
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B12] pt-28 sm:pt-32 lg:pt-44 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_right,rgba(212,175,55,0.12),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />

    <section className="relative mx-auto max-w-7xl px-5 sm:px-6 pb-10 lg:pb-24">
        <div className="mb-14 text-center">
          <p className="text-lg font-bold tracking-[0.3em] text-cyan-400">
            CONTACT GOS
          </p>

          <h1 className="mt-5 text-3xl font-bold sm:text-5xl lg:text-6xl">
            <ContactTypewriter />
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm text-gray-400 sm:text-base">
            Reach our support team for laptop repair, printer setup, WiFi, CCTV
            and business IT.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          {/* LEFT CARTOON VISUAL */}
          <div className="relative hidden min-h-[660px] overflow-hidden lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.22),transparent_50%)]" />

            {/* Girl - front left, no shaking */}
            <motion.img
              src={babyGirl}
              alt="Baby Girl Technician"
              initial={{ x: -420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute left-[-5%] top-[1%] z-20 w-[245px] drop-shadow-[0_0_35px_rgba(14,165,233,0.38)]"
            />

            {/* Boy - top/right, no shaking */}
            <motion.img
              src={babyBoy}
              alt="Baby Boy Technician"
              initial={{ y: -420, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute right-[8%] top-[5%] z-30 w-[235px] drop-shadow-[0_0_35px_rgba(14,165,233,0.38)]"
            />

            {/* Electronics Board - behind characters */}
            <motion.img
              src={electronicsBoard}
              alt="Electronics Board"
              initial={{ opacity: 0, scale: 0.8, y: 55 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="absolute left-1/2 top-[46%] z-40 w-[500px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_45px_rgba(14,165,233,0.45)]"
            />

            {/* Center repair glow */}
            <motion.div
              animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.9, 1.18, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute left-1/2 top-[57%] z-40 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/45 blur-xl"
            />

            <div className="absolute bottom-10 left-1/2 h-8 w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-2xl" />
          </div>

          {/* RIGHT FORM */}
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            className="rounded-[2.5rem] border border-white/10 bg-[#0A1020]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                <ShieldCheck size={16} />
                Secure Contact
              </div>

              <h2 className="text-3xl font-bold">Send a Message</h2>

              <p className="mt-2 text-sm text-gray-400">
                Our support team will contact you quickly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                name="fullName"
                placeholder="Your Name"
                value={formData.fullName}
                onChange={handleChange}
              />
             
             <Input
  name="email"
  type="email"
  placeholder="Email Address"
  value={formData.email}
  onChange={handleChange}
/>

<Input
  name="phone"
  placeholder="Phone Number"
  value={formData.phone}
  onChange={handleChange}
/>

              <div className="grid gap-5 sm:grid-cols-2">
                <Select
  name="country"
  label="Country"
  value={formData.country}
  onChange={handleChange}
  options={[
    "United States",
    "United Kingdom",
  ]}
/>

                <Select
  name="subject"
  value={formData.subject}
  onChange={handleChange}
  label="Service Type"
  options={[
    "Laptop Repair",
    "Printer Setup",
    "WiFi Setup",
    "CCTV Installation",
    "Business IT",
  ]}
/>
                 
              </div>

              <textarea
  name="message"
  value={formData.message}
  onChange={handleChange}
  rows={5}
  placeholder="Write your message..."
  className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-400/40"
/>

           <motion.button
  type="submit"
  disabled={loading}
  whileHover={{
    scale: 1.03,
    boxShadow: "0 0 30px rgba(14,165,233,0.35)",
  }}
  whileTap={{ scale: 0.97 }}
  className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-semibold disabled:opacity-60"
>
  {loading ? "Sending..." : "Send Message"}
  <Send size={19} />
</motion.button>

            </form>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MiniInfo icon={Mail} text="support@gos.com" />
              <MiniInfo icon={Phone} text="+1 (818) 934-4380" />
              <MiniInfo icon={MapPin} text="US & UK" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
function ContactTypewriter() {
  const text = "Premium Tech Support"

  return (
    <div className="flex items-center justify-center overflow-hidden">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            times: [
              0,
              (index + 1) / text.length,
              0.82,
              1,
            ],
            ease: "linear",
          }}
          className="inline-block bg-gradient-to-r from-white via-cyan-200 to-[#F7E7A1] bg-clip-text text-transparent"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}

      {/* Cursor */}
      <motion.span
        animate={{
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 0.7,
          repeat: Infinity,
        }}
        className="ml-1 text-cyan-300"
      >
        |
      </motion.span>
    </div>
  )
}
 function Input({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}){
  return (
    <input
    name={name}
value={value}
onChange={onChange}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-400/40"
    />
  )
}

 function Select({
  name,
  value,
  onChange,
  label,
  options,
 }){
  return (
    <select
  name={name}
  value={value}
  onChange={onChange}
  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-gray-300 outline-none transition focus:border-cyan-400/40"
>
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
}

function MiniInfo({ icon: Icon, text }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center"
    >
      <Icon size={18} className="mx-auto text-cyan-300" />
      <p className="mt-2 text-[11px] text-gray-400">{text}</p>
    </motion.div>
  )
}