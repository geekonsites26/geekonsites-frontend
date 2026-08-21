export default function SectionHeading({ eyebrow, title, description, align = "left", inverse = false, className = "" }) {
  const centered = align === "center"
  return (
    <div className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}>
      {eyebrow && <p className={`mb-4 text-xs font-extrabold uppercase tracking-[0.16em] ${inverse ? "text-gos-turquoise" : "text-gos-blue"}`}>{eyebrow}</p>}
      <h2 className={`gos-section-title ${inverse ? "text-white" : "text-gos-blue-deep"}`}>{title}</h2>
      {description && <p className={`mt-5 text-base leading-7 sm:text-lg ${inverse ? "text-white/70" : "text-gos-muted"}`}>{description}</p>}
    </div>
  )
}
