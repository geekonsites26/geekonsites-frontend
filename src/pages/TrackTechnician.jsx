import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import gosVan from "../assets/map/gos-van.webp"
import customerHome from "../assets/map/customer-home.webp"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import {
  GoogleMap,
Marker,
DirectionsRenderer,
OverlayView,
useLoadScript,
} from "@react-google-maps/api"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  Navigation,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Star,
  Video,
  Wrench,
  MessageCircle,
  Share2,
  Car,
  Zap,
} from "lucide-react"
import { getBookingTracking } from "../services/bookingService"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 51.5072,
  lng: -0.1276,
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,

  gestureHandling: "greedy",
  draggable: true,
  scrollwheel: true,

  clickableIcons: false,
  keyboardShortcuts: false,

  rotateControl: false,
  tilt: 0,

  mapTypeId: "roadmap",
}

const carGosIcon = (heading = 0) => ({
  url: gosVan,
  scaledSize: new window.google.maps.Size(70, 70),
  anchor: new window.google.maps.Point(35, 35),
  rotation: heading,
})

const customerHomeIcon = () => ({
  url: customerHome,
  scaledSize: new window.google.maps.Size(65, 65),
  anchor: new window.google.maps.Point(32, 32),
})

const statusLabel = {
  PENDING: "Pending",
  PAYMENT_COMPLETED: "Payment Completed",
  ASSIGNMENT_PENDING: "Assignment Pending",
  TECHNICIAN_ASSIGNED: "Technician Assigned",
  TECHNICIAN_ACCEPTED: "Technician Accepted",
  TECHNICIAN_ON_THE_WAY: "Technician On The Way",
  TECHNICIAN_ARRIVED: "Technician Arrived",
  SERVICE_STARTED: "Service Started",
  REMOTE_SESSION_STARTED: "Remote Session Started",
  SERVICE_COMPLETED: "Service Completed",
  REMAINING_PAYMENT_PENDING: "Payment Pending",
  FULLY_PAID: "Fully Paid",
  BOOKING_CLOSED: "Booking Closed",
  CANCELLED: "Cancelled",
}

export default function TrackTechnician() {
  const navigate = useNavigate()
  const { bookingId } = useParams()
  const { state } = useLocation()

  const [booking, setBooking] = useState(state?.booking || null)
  const [animatedTechnicianPosition, setAnimatedTechnicianPosition] = useState(null)

  const animationDuration = 6000
  const [directions, setDirections] = useState(null)
  const [loading, setLoading] = useState(false)
  const [distanceText, setDistanceText] = useState("Calculating...")
  const [etaText, setEtaText] = useState("Calculating...")
  const [lastUpdated, setLastUpdated] = useState(null)
  const mapRef = useRef(null)
  const lastRoutePointRef = useRef(null)
  const stompClientRef = useRef(null)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  const trackingId = bookingId || booking?.id

  const customerPosition = useMemo(() => {
    if (booking?.customerLatitude && booking?.customerLongitude) {
      return {
        lat: Number(booking.customerLatitude),
        lng: Number(booking.customerLongitude),
      }
    }

    return defaultCenter
  }, [booking])

  const technicianPosition = useMemo(() => {
    if (booking?.technicianLatitude && booking?.technicianLongitude) {
      return {
        lat: Number(booking.technicianLatitude),
        lng: Number(booking.technicianLongitude),
      }
    }

    return null
  }, [booking])

  useEffect(() => {
  if (!technicianPosition) return

  if (!animatedTechnicianPosition) {
    setAnimatedTechnicianPosition(technicianPosition)
    return
  }

  const startLat = animatedTechnicianPosition.lat
  const startLng = animatedTechnicianPosition.lng
  const endLat = technicianPosition.lat
  const endLng = technicianPosition.lng

  const startTime = performance.now()

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / animationDuration, 1)

    const lat = startLat + (endLat - startLat) * progress
    const lng = startLng + (endLng - startLng) * progress

    setAnimatedTechnicianPosition({ lat, lng })

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}, [technicianPosition])

  const isRemote =
    booking?.serviceMode === "REMOTE" ||
    booking?.remoteSessionRequired ||
    booking?.supportType === "remote"

  const readableStatus =
    statusLabel[booking?.bookingStatus] ||
    booking?.status ||
    "Tracking Booking"

  useEffect(() => {
  if (!trackingId) return

  loadTracking()

const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`)

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(`/topic/tracking/${trackingId}`, (message) => {
        const liveBooking = JSON.parse(message.body)
        setBooking(liveBooking)
        setLastUpdated(new Date())
      })
    },
  })

  client.activate()
  stompClientRef.current = client

  return () => {
    client.deactivate()
  }
}, [trackingId])

 useEffect(() => {
  if (
    !isLoaded ||
    !window.google ||
    !animatedTechnicianPosition ||
    !customerPosition ||
    isRemote
  ) {
    return
  }

  const last = lastRoutePointRef.current

  if (last) {
    const moved =
      Math.abs(last.lat - animatedTechnicianPosition.lat) +
      Math.abs(last.lng - animatedTechnicianPosition.lng)

    if (moved < 0.0008) {
      return
    }
  }

  lastRoutePointRef.current = animatedTechnicianPosition

  const directionsService = new window.google.maps.DirectionsService()

  directionsService.route(
    {
      origin: animatedTechnicianPosition,
      destination: customerPosition,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
    },
    (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK && result) {
  setDirections(result)

  const leg = result.routes?.[0]?.legs?.[0]

  if (leg) {
    setDistanceText(leg.distance?.text || "Distance unavailable")
    setEtaText(leg.duration?.text || "ETA unavailable")
  } else {
    setDistanceText("Distance unavailable")
    setEtaText("ETA unavailable")
  }
} else {
  setDistanceText("Distance unavailable")
  setEtaText("ETA unavailable")
}
    }
  )
}, [isLoaded, animatedTechnicianPosition, customerPosition, isRemote])

useEffect(() => {
  if (
    !mapRef.current ||
    !animatedTechnicianPosition ||
    !customerPosition ||
    isRemote
  ) {
    return
  }

  const bounds = new window.google.maps.LatLngBounds()

  bounds.extend(animatedTechnicianPosition)
  bounds.extend(customerPosition)

  mapRef.current.fitBounds(bounds, 90)

  setTimeout(() => {
    if (mapRef.current && mapRef.current.getZoom() < 14) {
      mapRef.current.setZoom(14)
    }
  }, 400)
}, [animatedTechnicianPosition, customerPosition, isRemote])

  const loadTracking = async (showLoader = true) => {
    if (!trackingId) return

    try {
      if (showLoader) setLoading(true)

      const data = await getBookingTracking(trackingId)
      setBooking(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error(error)
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  const openGoogleNavigation = () => {
    if (!technicianPosition || !customerPosition) return

    const url = `https://www.google.com/maps/dir/?api=1&origin=${technicianPosition.lat},${technicianPosition.lng}&destination=${customerPosition.lat},${customerPosition.lng}&travelmode=driving`

    window.open(url, "_blank")
  }
  
  const progressPercent = isRemote
  ? booking?.bookingStatus === "SERVICE_COMPLETED"
    ? 100
    : 65
  : booking?.bookingStatus === "TECHNICIAN_ACCEPTED"
  ? 40
  : booking?.bookingStatus === "TECHNICIAN_ON_THE_WAY"
  ? 65
  : booking?.bookingStatus === "TECHNICIAN_ARRIVED"
  ? 80
  : booking?.bookingStatus === "SERVICE_STARTED"
  ? 90
  : booking?.bookingStatus === "SERVICE_COMPLETED"
  ? 100
  : 45

const liveMessage = isRemote
  ? "Remote technician is preparing your session"
  : booking?.bookingStatus === "TECHNICIAN_ON_THE_WAY"
  ? "Your technician is on the way"
  : booking?.bookingStatus === "TECHNICIAN_ARRIVED"
  ? "Your technician has arrived"
  : booking?.bookingStatus === "SERVICE_STARTED"
  ? "Service has started"
  : booking?.bookingStatus === "SERVICE_COMPLETED"
  ? "Service completed"
  : "Technician assignment is active"

const shareTracking = async () => {
  const trackingUrl = window.location.href

  if (navigator.share) {
    await navigator.share({
      title: "GeekOnSites Live Tracking",
      text: `Track my GeekOnSites technician for booking #${trackingId}`,
      url: trackingUrl,
    })
  } else {
    await navigator.clipboard.writeText(trackingUrl)
    alert("Tracking link copied.")
  }
}

  if (loading && !booking) {
    return (
      <main className="min-h-screen bg-[#020817] px-4 pt-36 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[#071122] p-8 text-center">
          <p className="font-black text-cyan-300">Loading live tracking...</p>
        </div>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#020817] px-4 pt-36 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center">
          <p className="font-black text-red-300">Google Maps failed to load.</p>
        </div>
      </main>
    )
  }

  return (
  <main className="relative min-h-screen max-w-full overflow-x-hidden bg-[#020817] pb-28 text-white lg:pb-8">
      <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#071122]/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">

  <div className="flex items-center justify-center gap-2">

    <span className="h-3 w-3 animate-pulse rounded-full bg-green-400"></span>

    <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
      LIVE TRACKING
    </p>

  </div>

  <h1 className="mt-1 text-lg font-black">
    Booking #{booking?.id}
  </h1>

</div>

          <button
            onClick={() => loadTracking()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[#071122] shadow-2xl shadow-cyan-500/10">
        <div className="relative h-[72vh] min-h-[600px] lg:h-[calc(100vh-120px)]">
           {isLoaded ? (
  <>
    <GoogleMap
    onLoad={(map) => {
      mapRef.current = map
    }}
    
      mapContainerStyle={mapContainerStyle}
      center={animatedTechnicianPosition || customerPosition}
      zoom={15}
      options={mapOptions}
    >
      {customerPosition && (
        <Marker
          position={customerPosition}
          icon={customerHomeIcon()}
        />
      )}

     {animatedTechnicianPosition && (
  <OverlayView
    position={animatedTechnicianPosition}
    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
  >
    <div className="relative">
      <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-cyan-400/30" />

      <img
  src={gosVan}
  alt="GOS"
  style={{
    width: "120px",
    height: "120px",
    transform: `translate(-50%, -50%) rotate(${booking?.technicianHeading || 0}deg)`,
  }}
/>
    </div>
  </OverlayView>
)}

      {directions && !isRemote && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#06b6d4",
              strokeWeight: 6,
              strokeOpacity: 0.95,
            },
          }}
        />
      )}
    </GoogleMap>

   <div className="absolute left-5 top-5 z-30 rounded-[1.5rem] border border-white/10 bg-[#071122]/95 px-5 py-4 shadow-2xl backdrop-blur-xl">
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-black">
      <Zap size={20} />
    </div>

    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
        {isRemote ? "Remote Ready" : "Arriving In"}
      </p>

      <h3 className="text-2xl font-black">
        {isRemote ? "Now" : etaText}
      </h3>
    </div>
  </div>
</div>

<div className="absolute left-5 top-28 z-30 animate-bounce rounded-2xl bg-green-500 px-4 py-3 shadow-xl">
  <p className="text-xs font-black text-black">
  {
    booking?.bookingStatus === "TECHNICIAN_ASSIGNED"
      ? "👨‍🔧 Technician assigned"
      : booking?.bookingStatus === "TECHNICIAN_ON_THE_WAY"
      ? "🚗 Technician is on the way"
      : booking?.bookingStatus === "TECHNICIAN_ARRIVED"
      ? "📍 Technician has arrived"
      : booking?.bookingStatus === "SERVICE_STARTED"
      ? "🛠️ Service has started"
      : booking?.bookingStatus === "SERVICE_COMPLETED"
      ? "✅ Service completed"
      : "📦 Booking confirmed"
  }
</p>
</div>
    
    {/* Floating Actions */}

    <div className="absolute right-5 top-24 z-30 flex flex-col gap-3">

      <a
        href={
  booking?.technicianPhone
    ? `tel:${booking.technicianPhone}`
    : booking?.technicianMobile
    ? `tel:${booking.technicianMobile}`
    : undefined
}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-2xl transition hover:scale-110"
      >
        <Phone className="h-6 w-6 text-black" />
      </a>

      <button
        onClick={() =>
          alert("Secure chat will open here. For urgent help, please call the technician.")
        }
        className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 shadow-2xl transition hover:scale-110"
      >
        <MessageCircle className="h-6 w-6 text-black" />
      </button>

      {!isRemote && (
  <button
    onClick={openGoogleNavigation}
    className="rounded-2xl bg-white py-3 text-sm font-black text-black"
  >
    Route
  </button>
)}

    </div>

  </>
) : (
              <div className="flex h-full items-center justify-center">
                <p className="font-black text-cyan-300">Loading map...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2.5rem] border border-cyan-500/20 bg-[#071122]/95 p-6 shadow-2xl backdrop-blur-xl">

  <div className="flex items-center gap-4">

    <div className="relative">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 text-3xl font-black text-cyan-300">
        {booking?.technicianName?.charAt(0) || "T"}
      </div>

      <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-[#071122] bg-green-400 animate-bounce"/>
    </div>

    <div className="flex-1">

      <p className="text-xs font-black tracking-[0.25em] text-cyan-300 uppercase">
        TECHNICIAN
      </p>

      <h2 className="text-2xl font-black">
        {booking?.technicianName || "Assigning..."}
      </h2>

      <p className="mt-1 text-sm text-slate-400">
  {booking?.technicianVerificationStatus === "APPROVED"
    ? "Verified GeekOnSites Professional"
    : "GeekOnSites Technician"}
</p>

<div className="mt-2 flex items-center gap-2">
  ⭐{" "}
  <span className="font-bold">
    {booking?.technicianRating ?? "New"}
  </span>

  <span className="text-slate-500">•</span>

  <span>
    {booking?.technicianCompletedJobs ?? 0} Jobs
  </span>
</div>

    </div>

  </div>

  <div className="mt-6 grid grid-cols-2 gap-4">

    <Info
      icon={Clock3}
      label="ETA"
      value={isRemote ? "Ready" : etaText}
    />

    <Info
      icon={Navigation}
      label="Distance"
      value={isRemote ? "Remote" : distanceText}
    />

  </div>

  <div className="mt-6 rounded-3xl bg-cyan-500/10 p-5">

    <p className="text-xs font-black tracking-[0.18em] uppercase text-cyan-300">
      LIVE STATUS
    </p>

    <h3 className="mt-2 text-xl font-black">
      {liveMessage}
    </h3>

    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">

      <div
        className="h-full rounded-full bg-cyan-400 transition-all duration-700"
        style={{
          width: `${progressPercent}%`,
        }}
      />

    </div>

    <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">

  <span>Booked</span>

  <span>Assigned</span>

  <span>Accepted</span>

  <span>Journey</span>

  <span>Arrived</span>

  <span>Service</span>

  <span>Done</span>

</div>

  </div>

  <div className="mt-6 grid grid-cols-4 gap-3">

    <a
      href={booking?.technicianPhone ? `tel:${booking.technicianPhone}` : undefined}
      className="rounded-2xl bg-green-500 py-3 text-center text-sm font-black text-black"
    >
      Call
    </a>

    <button
      className="rounded-2xl bg-cyan-400 py-3 text-sm font-black text-black"
    >
      Chat
    </button>

    <button
      onClick={shareTracking}
      className="rounded-2xl border border-white/10 py-3 text-sm font-black"
    >
      Share
    </button>

    <button
      onClick={openGoogleNavigation}
      className="rounded-2xl bg-white py-3 text-sm font-black text-black"
    >
      Route
    </button>

  </div>

</div>

          <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-5">
            <h3 className="text-lg font-black">Live Status</h3>

            <div className="mt-4 space-y-3">
              <Step active title="Booking Confirmed" />
              <Step
                active={[
                 [
                  "PAYMENT_COMPLETED",
                  "ASSIGNMENT_PENDING",
                  "TECHNICIAN_ASSIGNED",
                 "TECHNICIAN_ACCEPTED",
                 "TECHNICIAN_ON_THE_WAY",
                 "TECHNICIAN_ARRIVED",
                 "SERVICE_STARTED",
                 "REMOTE_SESSION_STARTED",
                 "SERVICE_COMPLETED",
                ]
                ].includes(booking?.bookingStatus)}
                title="Payment Verified"
              />
              <Step
                active={[
                  [
                    "TECHNICIAN_ASSIGNED",
                    "TECHNICIAN_ACCEPTED",
                    "TECHNICIAN_ON_THE_WAY",
                    "TECHNICIAN_ARRIVED",
                    "SERVICE_STARTED",
                    "REMOTE_SESSION_STARTED",
                    "SERVICE_COMPLETED",
                  ]
                ].includes(booking?.bookingStatus)}
                title="Technician Assigned"
              />
              <Step
                active={[
                  [
                   "TECHNICIAN_ACCEPTED",
                   "TECHNICIAN_ON_THE_WAY",
                   "TECHNICIAN_ARRIVED",
                   "SERVICE_STARTED",
                   "REMOTE_SESSION_STARTED",
                   "SERVICE_COMPLETED",
                  ]
                ].includes(booking?.bookingStatus)}
                title="Technician Accepted"
              />
              <Step
                active={[
                  [
                  "TECHNICIAN_ON_THE_WAY",
                  "TECHNICIAN_ARRIVED",
                  "SERVICE_STARTED",
                  "REMOTE_SESSION_STARTED",
                  "SERVICE_COMPLETED",
                ]
                ].includes(booking?.bookingStatus)}
                title={isRemote ? "Remote Session Ready" : "Technician On The Way"}
              />
              <Step
                active={[
                  [
                    "TECHNICIAN_ARRIVED",
                    "SERVICE_STARTED",
                    "REMOTE_SESSION_STARTED",
                    "SERVICE_COMPLETED",
                  ]
                ].includes(booking?.bookingStatus)}
                title="Technician Arrived"
              />
              <Step
                active={[
                  "SERVICE_STARTED",
                  "REMOTE_SESSION_STARTED",
                  "SERVICE_COMPLETED",
                ].includes(booking?.bookingStatus)}
                title="Service Started"
              />
              <Step
                active={booking?.bookingStatus === "SERVICE_COMPLETED"}
                title="Service Completed"
              />
            </div>

            {lastUpdated && (
              <p className="mt-4 text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-500/10 bg-[#071122]/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate("/my-bookings")}
            className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 py-3 text-xs font-black"
          >
            <Home size={15} />
            Bookings
          </button>

          <button
            onClick={() => loadTracking()}
            className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 py-3 text-xs font-black"
          >
            <RefreshCcw size={15} />
            Refresh
          </button>

          <button
            onClick={isRemote ? undefined : openGoogleNavigation}
            className="flex items-center justify-center gap-1 rounded-2xl bg-cyan-400 py-3 text-xs font-black text-black"
          >
            <Navigation size={15} />
            {isRemote ? "Remote" : "Route"}
          </button>
        </div>
      </div>
    </main>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <Icon className="mb-2 h-5 w-5 text-cyan-300" />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  )
}

function Step({ active, title }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          active ? "bg-green-400 text-black" : "bg-white/10 text-slate-500"
        }`}
      >
        {active && <CheckCircle2 size={15} />}
      </div>
      <p className={active ? "font-black text-white" : "font-bold text-slate-500"}>
        {title}
      </p>
    </div>
  )
}