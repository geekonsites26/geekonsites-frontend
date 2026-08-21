import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { motionEase } from "../../styles/motion"
import BrandLogo from "../common/BrandLogo"

const SPLASH_DURATION = 1650

export default function SplashScreen({ onComplete }) {
  const reduceMotion = useReducedMotion()
  const videoRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = reduceMotion ? 600 : SPLASH_DURATION
    const startedAt = performance.now()
    const progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      setProgress(Math.min(100, Math.round((elapsed / duration) * 100)))
    }, reduceMotion ? 100 : 40)
    const completeTimer = window.setTimeout(() => {
      setProgress(100)
      onComplete()
    }, duration)

    videoRef.current?.play().catch(() => {})

    return () => {
      window.clearInterval(progressTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete, reduceMotion])

  return (
    <motion.div
      role="status"
      aria-label="GeekOnSites is starting"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.015 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.25, ease: motionEase }}
      className="fixed inset-0 z-[1000000] min-h-[100dvh] overflow-hidden bg-[#07182f] text-white [font-family:Manrope,sans-serif]"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/gos-opening.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,13,29,0.16)_0%,rgba(3,13,29,0.08)_40%,rgba(3,13,29,0.84)_100%)]" aria-hidden="true" />

      <div
        className="relative flex min-h-[100dvh] flex-col justify-between px-5 py-6 sm:px-8 sm:py-8"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: motionEase }}
          className="flex items-center justify-between gap-4"
        >
          <BrandLogo className="h-auto w-36 sm:w-48" />
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/75 sm:text-[10px]">
            Technology support
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.3, ease: motionEase }}
          className="mx-auto w-full max-w-md"
        >
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gos-turquoise sm:text-[10px]">Preparing your experience</p>
              <p className="mt-1 text-sm font-semibold text-white/80">Remote expertise. On-site confidence.</p>
            </div>
            <p className="min-w-[6.5rem] text-right text-5xl font-semibold leading-none tracking-normal [font-family:'Cormorant_Garamond',serif] [font-variant-numeric:tabular-nums] sm:text-6xl" aria-live="polite">
              {String(progress).padStart(3, "0")}<span className="ml-1 text-lg text-gos-turquoise">%</span>
            </p>
          </div>
          <div className="mt-4 h-1 overflow-hidden bg-white/20">
            <motion.div className="h-full origin-left bg-gos-turquoise" animate={{ scaleX: progress / 100 }} transition={{ duration: 0.08, ease: "linear" }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
