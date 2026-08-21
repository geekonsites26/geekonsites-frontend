import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { staggerItem, tapMotion } from "../../styles/motion"

export default function ServiceCard({ title, description, icon: Icon, image, index, lead = false, to = "/services", state }) {
  return (
    <motion.article variants={staggerItem} whileHover={{ y: -4 }} whileTap={tapMotion} transition={{ duration: 0.22 }} className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-gos-border bg-white shadow-[var(--gos-shadow-sm)] transition duration-300 hover:border-gos-turquoise hover:shadow-[var(--gos-shadow-md)] ${lead ? "sm:col-span-2 lg:row-span-2" : ""}`}>
      <div className={`relative overflow-hidden bg-gos-blue-deep ${lead ? "aspect-[16/9] lg:aspect-[16/10]" : "aspect-[4/3]"}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" loading="lazy" />
        <span className="absolute left-4 top-4 text-[10px] font-extrabold tracking-[0.16em] text-white drop-shadow-md">{String(index).padStart(2, "0")}</span>
      </div>
      <div className={`flex flex-1 flex-col ${lead ? "p-6 sm:p-7" : "p-5"}`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className={`${lead ? "text-2xl sm:text-3xl" : "text-lg"} font-bold leading-tight text-gos-blue-deep`}>{title}</h3>
          <Icon size={lead ? 23 : 19} strokeWidth={1.8} className="mt-0.5 shrink-0 text-gos-turquoise" />
        </div>
        <p className="mt-3 text-sm leading-6 text-gos-muted">{description}</p>
        <Link to={to} state={state} className="mt-auto inline-flex min-h-11 items-end gap-2 pt-4 text-sm font-bold text-gos-blue transition group-hover:text-gos-turquoise">
          View service <ArrowUpRight size={16} className="mb-0.5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>
    </motion.article>
  )
}
