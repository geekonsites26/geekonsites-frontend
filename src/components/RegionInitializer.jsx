import { useEffect } from "react"
import { initializeUserRegion } from "../services/locationService"

export default function RegionInitializer() {
  useEffect(() => {
    initializeUserRegion()
  }, [])

  return null
}
