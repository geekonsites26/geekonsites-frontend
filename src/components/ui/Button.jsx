import { forwardRef } from "react"
import { Link } from "react-router-dom"

const variants = {
  primary: "border-gos-blue bg-gos-blue text-white hover:border-gos-blue-deep hover:bg-gos-blue-deep",
  secondary: "border-white bg-white text-gos-blue hover:border-gos-off-white hover:bg-gos-off-white",
  outline: "border-gos-blue bg-transparent text-gos-blue hover:border-gos-turquoise hover:text-gos-blue-deep",
}

const Button = forwardRef(function Button({ variant = "primary", to, className = "", children, ...props }, ref) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 active:translate-y-px active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`
  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{children}</Link>
  return <button ref={ref} className={classes} {...props}>{children}</button>
})

export default Button
