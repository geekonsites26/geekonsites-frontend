import { FaFacebookF, FaGlobe, FaInstagram, FaLinkedinIn } from "react-icons/fa"
import { Mail } from "lucide-react"
import { Link } from "react-router-dom"
import Container from "./Container"
import BrandLogo from "../common/BrandLogo"

const navigation = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Book service", to: "/book-service" },
]

const social = [
  { icon: FaGlobe, href: "https://geekonsites.com", label: "Website" },
  { icon: FaInstagram, href: "https://www.instagram.com/geekonsites", label: "Instagram" },
  { icon: FaFacebookF, href: "https://www.facebook.com/geekonsites", label: "Facebook" },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/geekonsites", label: "LinkedIn" },
]

export default function Footer() {
  return (
    <footer className="hidden border-t-2 border-gos-turquoise/35 bg-[#f4f7f9] text-gos-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_-8px_24px_rgba(3,13,29,0.04)] lg:block">
      <Container>
        <div className="py-9 sm:py-10">
          <div className="flex flex-col gap-6 border-b border-gos-border pb-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link to="/" aria-label="GeekOnSites home" className="inline-flex">
                <BrandLogo className="h-auto w-60 xl:w-64" />
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-extrabold uppercase tracking-[0.14em]"><span className="text-gos-gold">A service by ASI TECH INC</span><span className="text-gos-muted">United States and United Kingdom</span></div>
            </div>

            <nav className="grid grid-cols-2 gap-x-5 sm:flex sm:flex-wrap sm:gap-y-1" aria-label="Footer navigation">
              {navigation.map((item) => <Link key={item.to} to={item.to} className="flex min-h-10 items-center text-xs font-bold text-gos-muted transition hover:text-gos-blue">{item.label}</Link>)}
            </nav>
          </div>

          <div className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <a href="mailto:support@geekonsites.com" className="flex min-h-11 items-center gap-2 text-sm font-bold text-gos-blue-deep transition hover:text-gos-blue"><Mail size={17} className="text-gos-turquoise" /> support@geekonsites.com</a>
            </div>
            <div className="flex gap-1.5">
              {social.map(({ icon: Icon, href, label }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-md text-gos-blue transition hover:bg-gos-off-white hover:text-gos-turquoise"><Icon size={15} /></a>)}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-gos-border pt-5 text-[10px] font-semibold text-gos-muted sm:flex-row sm:items-center sm:justify-between sm:text-xs">
            <p>&copy; 2026 GeekOnSites. All rights reserved.</p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal and support"><Link className="transition hover:text-gos-turquoise" to="/privacy">Privacy</Link><Link className="transition hover:text-gos-turquoise" to="/terms">Terms & Conditions</Link><Link className="transition hover:text-gos-turquoise" to="/support">Support</Link></nav>
          </div>
        </div>
      </Container>
    </footer>
  )
}
