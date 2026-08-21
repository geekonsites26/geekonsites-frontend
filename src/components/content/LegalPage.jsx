import { Mail, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import Container from "../layout/Container"
import SEO from "../common/SEO"
import DashboardReturnLink from "../customer/DashboardReturnLink"

export default function LegalPage({ eyebrow, title, description, sections, seoTitle }) {
  return (
    <main className="min-h-screen bg-gos-off-white pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top))] text-gos-charcoal lg:pb-0 sm:pt-[calc(4rem+env(safe-area-inset-top))]">
      <SEO title={seoTitle} description={description} />

      <header className="border-b border-gos-border bg-white">
        <Container className="pb-7 pt-2 sm:pb-10">
          <DashboardReturnLink force to="/" className="-ml-2 mb-2" />
          <div className="max-w-3xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gos-gold">{eyebrow}</p>
            <h1 className="mt-3 font-['Cormorant_Garamond'] text-5xl font-bold leading-[0.92] text-gos-blue-deep sm:text-6xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-gos-charcoal sm:text-base">{description}</p>
            <p className="mt-4 text-xs font-bold text-gos-muted">Effective date: 14 August 2026</p>
          </div>
        </Container>
      </header>

      <Container className="grid gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:py-12">
        <article className="min-w-0 overflow-hidden rounded-lg border border-gos-border bg-white shadow-[var(--gos-shadow-sm)]">
          {sections.map(({ title: sectionTitle, paragraphs, items }, index) => (
            <section key={sectionTitle} className={`p-5 sm:p-7 ${index ? "border-t border-gos-border" : ""}`}>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-gos-turquoise">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 font-['Cormorant_Garamond'] text-3xl font-bold leading-none text-gos-blue-deep">{sectionTitle}</h2>
              {paragraphs?.map((paragraph) => <p key={paragraph} className="mt-3 text-sm font-semibold leading-7 text-gos-charcoal">{paragraph}</p>)}
              {items && <ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-gos-charcoal"><ShieldCheck size={15} className="mt-1 shrink-0 text-gos-turquoise" />{item}</li>)}</ul>}
            </section>
          ))}
        </article>

        <aside className="rounded-lg bg-gos-blue-deep p-5 text-white lg:sticky lg:top-28">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gos-gold">Questions</p>
          <h2 className="mt-2 font-['Cormorant_Garamond'] text-3xl font-bold leading-none">Contact GOS support.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/70">Ask about these terms, your information, or a support request.</p>
          <Link to="/support" className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-xs font-extrabold text-gos-blue-deep"><Mail size={15} /> Contact support</Link>
        </aside>
      </Container>
    </main>
  )
}
