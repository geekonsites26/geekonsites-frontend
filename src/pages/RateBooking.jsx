import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Star } from "lucide-react"
import BrandLogo from "../components/common/BrandLogo"
import DashboardLoader from "../components/ui/DashboardLoader"
import { getBookingById, submitBookingRating } from "../services/bookingService"
import { getDashboardPathForRole } from "../utils/authRouting"

export default function RateBooking() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => { getBookingById(bookingId).then(setBooking).catch((e) => setError(e.message || "Booking could not be loaded.")).finally(() => setLoading(false)) }, [bookingId])
  if (loading) return <DashboardLoader />
  const existingRating = booking?.customerRating ?? booking?.rating
  const submit = async () => {
    if (!rating || saving) return
    try {
      setSaving(true); setError("")
      await submitBookingRating(bookingId, rating, review.trim())
      navigate(`${getDashboardPathForRole("CUSTOMER")}?view=bookings`, { replace: true, state: { ratingSubmitted: true } })
    } catch (e) { setError(e.message || "Rating could not be submitted.") } finally { setSaving(false) }
  }
  return <main className="min-h-screen bg-gos-off-white px-4 pb-20 pt-[max(20px,env(safe-area-inset-top))]"><header className="mx-auto flex max-w-lg justify-center"><BrandLogo className="h-9 w-auto" /></header><section className="mx-auto mt-6 max-w-lg rounded-2xl border border-gos-border bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-wider text-gos-turquoise">Completed service</p><h1 className="mt-2 text-2xl font-black text-gos-blue-deep">Rate your technician</h1><p className="mt-2 text-sm font-semibold text-gos-muted">GOS-{bookingId} · {booking?.technicianName || "GeekOnSites technician"}</p>{existingRating != null ? <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Your rating: {existingRating} / 5</div> : <><div className="mt-6 flex justify-center gap-2" aria-label="Rating out of five">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} className="p-1"><Star size={34} className={value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} /></button>)}</div><label className="mt-6 block text-xs font-black text-gos-blue-deep">Review (optional)<textarea value={review} onChange={(e) => setReview(e.target.value)} maxLength={1000} className="mt-2 min-h-28 w-full rounded-xl border border-gos-border p-3 text-sm font-semibold outline-none focus:border-gos-turquoise" placeholder="Tell us about your service" /></label>{error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}<button type="button" onClick={submit} disabled={!rating || saving} className="mt-5 min-h-11 w-full rounded-xl bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-45">{saving ? "Submitting…" : "Submit rating"}</button></>}<button type="button" onClick={() => navigate(`${getDashboardPathForRole("CUSTOMER")}?view=bookings`)} className="mt-3 min-h-10 w-full text-xs font-black text-gos-blue">Back to bookings</button></section></main>
}
