import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { DirectionsRenderer, GoogleMap, Marker, OverlayView, useLoadScript } from "@react-google-maps/api"
import { ArrowLeft, CheckCircle2, Clock3, MapPin, MessageCircle, Navigation, Phone, RefreshCcw, Share2 } from "lucide-react"
import customerHome from "../assets/map/customer-home.webp"
import { getBookingTracking, updateCustomerLocation } from "../services/bookingService"
import { geocodeServiceAddress } from "../services/locationService"
import { SkeletonList, SkeletonMapPanel } from "../components/ui/Skeleton"
import { formatLocalTime } from "../utils/dateTime"
import { isRemoteBooking, onsiteTrackingAction, toRealPosition } from "../utils/customerBookingAction"

const mapStyle = { width: "100%", height: "100%" }
const mapOptions = { disableDefaultUI: true, zoomControl: true, gestureHandling: "greedy", clickableIcons: false }
const ORDER = ["BOOKING_CONFIRMED", "TECHNICIAN_ASSIGNED", "TECHNICIAN_ACCEPTED", "TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED"]
const ALIASES = { PENDING: "BOOKING_CONFIRMED", PAYMENT_COMPLETED: "BOOKING_CONFIRMED", ASSIGNMENT_PENDING: "BOOKING_CONFIRMED", ASSIGNED: "TECHNICIAN_ASSIGNED", ACCEPTED: "TECHNICIAN_ACCEPTED", ON_THE_WAY: "TECHNICIAN_ON_THE_WAY", ARRIVED: "TECHNICIAN_ARRIVED", IN_PROGRESS: "SERVICE_STARTED", COMPLETED: "SERVICE_COMPLETED", FULLY_PAID: "SERVICE_COMPLETED", BOOKING_CLOSED: "SERVICE_COMPLETED" }
const STEPS = [["Booking confirmed", "BOOKING_CONFIRMED"], ["Technician assigned", "TECHNICIAN_ASSIGNED"], ["Technician accepted", "TECHNICIAN_ACCEPTED"], ["On the way", "TECHNICIAN_ON_THE_WAY"], ["Arrived", "TECHNICIAN_ARRIVED"], ["Service in progress", "SERVICE_STARTED"], ["Service completed", "SERVICE_COMPLETED"]]
const bookingStatus = (booking) => { const value = String(booking?.bookingStatus || booking?.status || "").toUpperCase(); return ALIASES[value] || value || "BOOKING_CONFIRMED" }
const customerIcon = () => ({ url: customerHome, scaledSize: new window.google.maps.Size(42, 42), anchor: new window.google.maps.Point(21, 21) })

export default function TrackTechnician() {
  const navigate = useNavigate()
  const { bookingId } = useParams()
  const { state } = useLocation()
  const [booking, setBooking] = useState(state?.booking || null)
  const [marker, setMarker] = useState(null)
  const [directions, setDirections] = useState(null)
  const [distance, setDistance] = useState("Not available yet")
  const [eta, setEta] = useState("Not available yet")
  const [loading, setLoading] = useState(!state?.booking)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null)
  const [recoveredCustomerPosition, setRecoveredCustomerPosition] = useState(null)
  const mapRef = useRef(null)
  const animationRef = useRef(null)
  const markerRef = useRef(null)
  const recoveryBookingRef = useRef(null)
  const trackingId = bookingId || booking?.id
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY })
  const storedCustomerPosition = useMemo(() => toRealPosition(booking?.customerLatitude, booking?.customerLongitude), [booking?.customerLatitude, booking?.customerLongitude])
  const customerPosition = storedCustomerPosition || recoveredCustomerPosition
  const technicianPosition = useMemo(() => toRealPosition(booking?.technicianLatitude, booking?.technicianLongitude), [booking?.technicianLatitude, booking?.technicianLongitude])
  const status = bookingStatus(booking)
  const statusIndex = Math.max(0, ORDER.indexOf(status))
  const action = onsiteTrackingAction(booking)
  const journeyLive = ["TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED"].includes(status)

  const loadTracking = useCallback(async (showLoader = true) => {
    if (!trackingId) return
    try {
      if (showLoader) setLoading(true)
      setError("")
      const data = await getBookingTracking(trackingId)
      if (isRemoteBooking(data)) {
        navigate("/remote-session", { replace: true, state: { booking: data } })
        return
      }
      setBooking(data)
      setLastUpdated(new Date())
    } catch (requestError) {
      setError(requestError?.code === "TIMEOUT" ? "Updating live location…" : requestError?.message || "Tracking information is temporarily unavailable.")
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [navigate, trackingId])

  useEffect(() => {
    if (isRemoteBooking(booking)) {
      navigate("/remote-session", { replace: true, state: { booking } })
    }
  }, [booking, navigate])

  useEffect(() => {
    loadTracking()
    const timer = window.setInterval(() => loadTracking(false), 5000)
    const onVisible = () => document.visibilityState === "visible" && loadTracking(false)
    document.addEventListener("visibilitychange", onVisible)
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible) }
  }, [loadTracking])

  useEffect(() => {
    if (storedCustomerPosition || recoveredCustomerPosition || !booking?.id || isRemoteBooking(booking) || recoveryBookingRef.current === booking.id) return
    const address = [booking.address, booking.city, booking.state, booking.postalCode, booking.country].filter(Boolean).join(", ")
    if (!address) return
    recoveryBookingRef.current = booking.id
    let active = true
    geocodeServiceAddress(address, booking.country)
      .then(async (position) => {
        if (!active) return
        setRecoveredCustomerPosition({ lat: position.latitude, lng: position.longitude })
        await updateCustomerLocation(booking.id, position.latitude, position.longitude)
      })
      .catch(() => { recoveryBookingRef.current = null })
    return () => { active = false }
  }, [booking, recoveredCustomerPosition, storedCustomerPosition])

  useEffect(() => {
    if (!technicianPosition) return
    if (!markerRef.current) { markerRef.current = technicianPosition; setMarker(technicianPosition); return }
    if (markerRef.current.lat === technicianPosition.lat && markerRef.current.lng === technicianPosition.lng) return
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    const start = markerRef.current
    const startedAt = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - startedAt) / 1500, 1)
      const nextMarker = { lat: start.lat + (technicianPosition.lat - start.lat) * progress, lng: start.lng + (technicianPosition.lng - start.lng) * progress }
      markerRef.current = nextMarker
      setMarker(nextMarker)
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => animationRef.current && cancelAnimationFrame(animationRef.current)
  }, [technicianPosition])

  useEffect(() => {
    if (!isLoaded || !journeyLive || !technicianPosition || !customerPosition) {
      setDirections(null); setDistance("Not available yet"); setEta("Not available yet"); return
    }
    new window.google.maps.DirectionsService().route({ origin: technicianPosition, destination: customerPosition, travelMode: window.google.maps.TravelMode.DRIVING }, (result, resultStatus) => {
      if (resultStatus === window.google.maps.DirectionsStatus.OK && result) {
        const leg = result.routes?.[0]?.legs?.[0]
        setDirections(result); setDistance(leg?.distance?.text || "Not available yet"); setEta(leg?.duration?.text || "Not available yet")
      } else { setDirections(null); setDistance("Not available yet"); setEta("Not available yet") }
    })
  }, [customerPosition, isLoaded, journeyLive, technicianPosition])

  useEffect(() => {
    if (!mapRef.current || !window.google || !customerPosition) return
    if (!marker) { mapRef.current.panTo(customerPosition); return }
    const bounds = new window.google.maps.LatLngBounds(); bounds.extend(customerPosition); bounds.extend(marker); mapRef.current.fitBounds(bounds, 70)
  }, [customerPosition, marker])

  const viewerIsTechnician = String(localStorage.getItem("gos_role") || "").toUpperCase() === "TECHNICIAN"
  const technicianPhone = viewerIsTechnician ? null : booking?.technicianPhone || booking?.technicianMobile
  const call = () => technicianPhone && (window.location.href = `tel:${technicianPhone}`)
  const message = () => technicianPhone && (window.location.href = `sms:${technicianPhone}?body=${encodeURIComponent(`Hello, I am contacting you about GeekOnSites booking GOS-${trackingId}.`)}`)
  const share = async () => { const data = { title: "GeekOnSites tracking", text: `Track booking GOS-${trackingId}`, url: window.location.href }; if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(data.url) }

  if (loading && !booking) return <Loading />
  return <main className="min-h-screen bg-gos-off-white pb-24 text-gos-blue-deep">
    <header className="sticky top-0 z-50 border-b border-gos-border bg-white/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between">
      <button type="button" onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gos-border bg-white" aria-label="Go back"><ArrowLeft size={19} /></button>
      <div className="text-center"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gos-turquoise">Onsite service</p><h1 className="text-base font-black">Track Technician</h1><p className="text-[10px] font-bold text-gos-muted">GOS-{booking?.id || trackingId}</p></div>
      <button type="button" onClick={() => loadTracking()} disabled={loading} className="flex h-10 w-10 items-center justify-center rounded-full border border-gos-border bg-white disabled:opacity-50" aria-label="Refresh tracking"><RefreshCcw size={17} className={loading ? "animate-spin" : ""} /></button>
    </div></header>
    <div className="mx-auto grid max-w-6xl gap-4 p-3 sm:p-4 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="overflow-hidden rounded-2xl border border-gos-border bg-white shadow-sm"><div className="h-[46vh] min-h-80 max-h-[560px]">
        {loadError ? <MapMessage text="Google Maps could not load." /> : !customerPosition ? <MapMessage text="The service location is not available yet." /> : isLoaded ? <GoogleMap onLoad={(map) => { mapRef.current = map }} mapContainerStyle={mapStyle} center={marker || customerPosition} zoom={marker ? 14 : 15} options={mapOptions}>
          <Marker position={customerPosition} icon={customerIcon()} />
          {marker && <OverlayView position={marker} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}><div className="relative -translate-x-1/2 -translate-y-1/2"><span className="absolute inset-1 animate-ping rounded-full bg-gos-turquoise/20" /><div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gos-blue-deep shadow-lg" title="Technician location" role="img" aria-label="Technician's current location"><Navigation size={15} className="text-gos-turquoise" style={{ transform: `rotate(${Number(booking?.technicianHeading) || 0}deg)` }} /></div></div></OverlayView>}
          {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: "#0b9e9a", strokeWeight: 5, strokeOpacity: 0.9 } }} />}
        </GoogleMap> : <MapMessage text="Loading map…" />}
      </div><div className="grid grid-cols-2 border-t border-gos-border"><Metric icon={Clock3} label="Estimated arrival" value={journeyLive ? eta : "Journey not started"} /><Metric icon={Navigation} label="Distance" value={journeyLive ? distance : "Journey not started"} border /></div></section>
      <div className="space-y-4">
        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{error}</div>}
        <section className="rounded-2xl border border-gos-border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gos-turquoise">Current status</p><h2 className="mt-1 text-lg font-black">{action.label}</h2></div>{journeyLive && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">LIVE</span>}</div>
          <p className="mt-2 text-xs font-semibold text-gos-muted">Status updates come from your assigned technician. This page refreshes automatically.</p>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-gos-off-white p-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-black shadow-sm">{booking?.technicianName?.charAt(0) || "T"}</div><div className="min-w-0"><p className="truncate text-sm font-black">{booking?.technicianName || "Technician assignment in progress"}</p><p className="text-[11px] font-semibold text-gos-muted">{booking?.technicianName ? "Verified GeekOnSites professional" : "We’ll show details once assigned"}</p></div></div>
          <div className="mt-3 grid grid-cols-3 gap-2"><Contact icon={Phone} label="Call" onClick={call} disabled={!technicianPhone} /><Contact icon={MessageCircle} label="Message" onClick={message} disabled={!technicianPhone} /><Contact icon={Share2} label="Share" onClick={share} /></div>
        </section>
        <section className="rounded-2xl border border-gos-border bg-white p-4 shadow-sm"><h2 className="text-sm font-black">Service progress</h2><div className="mt-3 space-y-1">{STEPS.map(([label, value], index) => <Step key={value} label={label} complete={statusIndex >= index} current={statusIndex === index} />)}</div>{lastUpdated && <p className="mt-3 border-t border-gos-border pt-3 text-[10px] font-semibold text-gos-muted">Last updated {formatLocalTime(lastUpdated, booking)}</p>}</section>
        <div className="rounded-xl border border-gos-border bg-white p-3 text-xs font-semibold text-gos-muted"><MapPin size={15} className="mr-2 inline text-gos-turquoise" />Location and ETA appear only when real booking and technician coordinates are available.</div>
      </div>
    </div>
  </main>
}

function Loading() { return <main className="min-h-screen bg-gos-off-white px-4 pb-10 pt-24"><div className="mx-auto max-w-md space-y-3"><p className="text-center text-sm font-extrabold text-gos-blue-deep">Loading onsite tracking…</p><SkeletonMapPanel /><SkeletonList count={2} /></div></main> }
function MapMessage({ text }) { return <div className="flex h-full items-center justify-center bg-slate-100 p-6 text-center text-sm font-bold text-gos-muted">{text}</div> }
function Metric({ icon: Icon, label, value, border }) { return <div className={`p-3 ${border ? "border-l border-gos-border" : ""}`}><p className="flex items-center gap-1.5 text-[10px] font-bold text-gos-muted"><Icon size={13} className="text-gos-turquoise" />{label}</p><p className="mt-1 text-sm font-black">{value}</p></div> }
function Contact({ icon: Icon, label, onClick, disabled }) { return <button type="button" onClick={onClick} disabled={disabled} className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-gos-border bg-white text-[11px] font-extrabold text-gos-blue disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><Icon size={14} />{label}</button> }
function Step({ label, complete, current }) { return <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${current ? "bg-teal-50" : ""}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${complete ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>{complete ? <CheckCircle2 size={14} /> : <span className="h-2 w-2 rounded-full bg-current" />}</span><p className={`text-xs ${current ? "font-black text-gos-blue-deep" : complete ? "font-bold text-slate-700" : "font-semibold text-slate-400"}`}>{label}</p></div> }
