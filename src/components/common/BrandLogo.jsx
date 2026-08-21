import logo from "../../assets/geekonsites-logo.png"

export default function BrandLogo({ className = "", alt = "GeekOnSites — Experts at Your Doorstep" }) {
  return <img src={logo} alt={alt} className={`block max-w-full object-contain ${className}`} />
}
