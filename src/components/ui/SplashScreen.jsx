import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { motionEase } from "../../styles/motion"
import BrandLogo from "../common/BrandLogo"

const MAX_SPLASH_DURATION = 7000
const FALLBACK_DURATION = 2750

export default function SplashScreen({ onComplete }) {
  const reduceMotion = useReducedMotion()
  const videoRef = useRef(null)
  const completedRef = useRef(false)
  const fallbackTimerRef = useRef(null)
  const expectedDurationRef = useRef(MAX_SPLASH_DURATION)
  const [progress, setProgress] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  const completeSplash = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setProgress(100)
    onComplete()
  }, [onComplete])

  const handleVideoError = useCallback(() => {
    if (completedRef.current || videoFailed) return
    setVideoFailed(true)
    setVideoReady(false)
    fallbackTimerRef.current = window.setTimeout(completeSplash, FALLBACK_DURATION)
  }, [completeSplash, videoFailed])

  useEffect(() => {
    const startedAt = performance.now()
    const progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      setProgress(Math.min(99, Math.round((elapsed / expectedDurationRef.current) * 100)))
    }, reduceMotion ? 100 : 40)
    const safetyTimer = window.setTimeout(completeSplash, MAX_SPLASH_DURATION)

    videoRef.current?.play().catch(() => {})

    return () => {
      window.clearInterval(progressTimer)
      window.clearTimeout(safetyTimer)
      window.clearTimeout(fallbackTimerRef.current)
    }
  }, [completeSplash, reduceMotion])

  return (
    <motion.div
      role="status"
      aria-label="GeekOnSites is starting"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.015 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: motionEase }}
      className="fixed inset-0 z-[1000000] min-h-[100dvh] overflow-hidden bg-[#07182f] text-white [font-family:Manrope,sans-serif]"
    >
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${videoReady && !videoFailed ? "opacity-100" : "opacity-0"}`}
        src="/videos/gos-opening.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        onLoadedMetadata={(event) => {
          const videoDuration = Number(event.currentTarget.duration) * 1000
          if (Number.isFinite(videoDuration) && videoDuration > 0) expectedDurationRef.current = Math.min(videoDuration, MAX_SPLASH_DURATION)
        }}
        onEnded={completeSplash}
        onError={handleVideoError}
        aria-hidden="true"
      />
      {(!videoReady || videoFailed) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#07182f] px-8" aria-hidden="true">
          <div className="relative flex items-center justify-center">
            <span className="absolute h-24 w-[115%] rounded-full bg-white/35 blur-3xl" />
            <BrandLogo className="relative h-auto w-56 max-w-[75vw] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] sm:w-72" />
          </div>
        </div>
      )}
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
          <div className="relative flex items-center justify-center">
            <span className="absolute h-14 w-[110%] rounded-full bg-white/30 blur-2xl" aria-hidden="true" />
            <BrandLogo className="relative h-auto w-36 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] sm:w-48" />
          </div>
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
