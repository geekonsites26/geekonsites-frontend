import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

export default function ViewportVideo({ className = "", ...props }) {
  const videoRef = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const video = videoRef.current
    if (!video || reduceMotion) {
      video?.pause()
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && document.visibilityState === "visible") {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }, { threshold: 0.08 })

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") video.pause()
      else if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) video.play().catch(() => {})
    }

    observer.observe(video)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [reduceMotion])

  return <video ref={videoRef} className={className} muted loop playsInline preload="metadata" aria-hidden="true" {...props} />
}
