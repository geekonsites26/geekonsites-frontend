import LegalPage from "../components/content/LegalPage"
import { useRegion } from "../utils/location"

const usaPolicy = {
  title: "United States Refund & Cancellation Policy",
  paragraphs: ["There is no general federal 14-day cooling-off period for online GeekOnSites bookings. This contractual policy applies subject to federal, state, and local consumer-protection law, card-network dispute rights, and other rights that cannot lawfully be limited."],
  items: [
    "Before technician assignment or before a remote session starts, you may request cancellation. Amounts paid for services not supplied will generally be refundable, subject only to clearly disclosed, reasonable, and legally permissible costs.",
    "After technician assignment but before travel begins, a full or partial refund may be available depending on reasonable costs already incurred.",
    "After a technician starts travelling, reasonable dispatch, travel, or cancellation costs actually incurred may be deducted where legally permitted and disclosed.",
    "After arrival or service commencement, you remain responsible for services actually performed and approved parts or materials. An unused or unperformed portion may be refundable where appropriate.",
    "Remote support may be cancelled before the session begins. After work begins, charges may reflect service already supplied. A satisfactory completed service is not automatically refundable solely because a customer changes their mind.",
  ],
}

const ukPolicy = {
  title: "United Kingdom Refund & Cancellation Policy",
  paragraphs: ["For UK consumer bookings made online, you generally have 14 days from conclusion of the distance service contract to cancel, subject to applicable UK consumer law and any lawful exceptions."],
  items: [
    "If you expressly ask GeekOnSites to begin service during the 14-day cancellation period and later cancel within that period, you may need to pay a proportionate amount for service supplied up to cancellation.",
    "If a service is fully performed during the cancellation period, the cancellation right may be lost only where legally valid and after the required express request, consent, and acknowledgment have been obtained.",
    "Services must be supplied with reasonable care and skill. Depending on the circumstances, legal remedies may include repeat performance, an appropriate price reduction, or a partial or full refund.",
    "Where a statutory refund is due, it will be made without undue delay and, where applicable, within 14 days after agreement or notification establishing entitlement. It will normally use the original payment method unless otherwise agreed.",
    "GeekOnSites will not impose a prohibited refund fee. Any lawful deduction or cancellation charge must be reasonable and must not restrict statutory rights.",
  ],
}

const sharedSections = [
  { title: "How to request cancellation or a refund", paragraphs: ["Email support@geekonsites.com and include the booking ID, customer name, booking email, and reason for the request. Do not send card details by email. Requests are reviewed; no refund is issued automatically merely because a request is submitted."] },
  { title: "If GeekOnSites cancels", paragraphs: ["If GeekOnSites or the assigned provider cancels and you are not at fault, we will notify you and refund amounts paid for services not provided. We will not retain an arbitrary cancellation fee. This includes operational cancellation, no available technician, inability to provide the service, or a confirmed duplicate booking or payment."] },
  { title: "Problems with your service", paragraphs: ["If service was not delivered as agreed, was materially incomplete, or has another valid quality problem, contact support@geekonsites.com. We may review the booking, technician or service records, payments, and supporting information before deciding the appropriate resolution."], items: ["Possible resolutions may include completing or correcting the service, repeat performance where appropriate, a partial refund, or a full refund where justified.", "A complaint does not create an automatic refund, and nothing in this review process removes mandatory consumer remedies."] },
  { title: "Parts and materials", paragraphs: ["Service and labour charges are considered separately from physical parts. Approved parts that have been installed or used may have separate return or manufacturer-warranty limitations. Faulty or misdescribed goods retain all applicable statutory and legal rights."] },
  { title: "Platform and booking fee", paragraphs: ["The currently displayed platform/service fee is $12 for US bookings and £12 for UK bookings. It must be disclosed before payment. It is not automatically non-refundable: GeekOnSites considers whether the associated service was supplied and will refund it where required by law or where GeekOnSites cancels without customer fault."] },
  { title: "Refund processing", paragraphs: ["An approved refund will normally be returned through Stripe to the original payment method where practical. Your bank or card provider may take additional business days to post the funds after GeekOnSites processes the refund. We do not ask customers to email card details."] },
  { title: "Statutory rights and contact", paragraphs: ["This policy does not exclude, waive, or restrict statutory consumer rights or remedies that cannot lawfully be excluded. GeekOnSites is a service by ASI TECH INC. Questions and requests may be sent to support@geekonsites.com."] },
]

export default function RefundPolicy() {
  const region = useRegion()
  const countrySections = region.code === "UK" ? [ukPolicy, usaPolicy] : [usaPolicy, ukPolicy]
  return <LegalPage eyebrow={`${region.country} policy highlighted`} title="Refund & Cancellation Policy" description="Country-specific cancellation, refund, service-quality, parts, and payment information for GeekOnSites customers in the United States and United Kingdom." sections={[...countrySections, ...sharedSections]} seoTitle="Refund & Cancellation Policy | GeekOnSites" dateLabel="Last updated: 21 August 2026" relatedLinks={[{ label: "Terms & Conditions", to: "/terms" }, { label: "Privacy Policy", to: "/privacy" }]} />
}
