const US_STATE_ZONES = {
  CT: "America/New_York", DE: "America/New_York", FL: "America/New_York", GA: "America/New_York",
  IN: "America/New_York", KY: "America/New_York", MA: "America/New_York", MD: "America/New_York",
  ME: "America/New_York", MI: "America/New_York", NC: "America/New_York", NH: "America/New_York",
  NJ: "America/New_York", NY: "America/New_York", OH: "America/New_York", PA: "America/New_York",
  RI: "America/New_York", SC: "America/New_York", VA: "America/New_York", VT: "America/New_York",
  WV: "America/New_York", AL: "America/Chicago", AR: "America/Chicago", IA: "America/Chicago",
  IL: "America/Chicago", KS: "America/Chicago", LA: "America/Chicago", MN: "America/Chicago",
  MO: "America/Chicago", MS: "America/Chicago", ND: "America/Chicago", NE: "America/Chicago",
  OK: "America/Chicago", SD: "America/Chicago", TN: "America/Chicago", TX: "America/Chicago",
  WI: "America/Chicago", CO: "America/Denver", MT: "America/Denver", NM: "America/Denver",
  UT: "America/Denver", WY: "America/Denver", AZ: "America/Phoenix", CA: "America/Los_Angeles",
  NV: "America/Los_Angeles", OR: "America/Los_Angeles", WA: "America/Los_Angeles",
  AK: "America/Anchorage", HI: "Pacific/Honolulu",
}

const STATE_NAMES = {
  CONNECTICUT: "CT", DELAWARE: "DE", FLORIDA: "FL", GEORGIA: "GA", INDIANA: "IN",
  KENTUCKY: "KY", MASSACHUSETTS: "MA", MARYLAND: "MD", MAINE: "ME", MICHIGAN: "MI",
  "NORTH CAROLINA": "NC", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ", "NEW YORK": "NY",
  OHIO: "OH", PENNSYLVANIA: "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
  VIRGINIA: "VA", VERMONT: "VT", "WEST VIRGINIA": "WV", ALABAMA: "AL", ARKANSAS: "AR",
  IOWA: "IA", ILLINOIS: "IL", KANSAS: "KS", LOUISIANA: "LA", MINNESOTA: "MN",
  MISSOURI: "MO", MISSISSIPPI: "MS", "NORTH DAKOTA": "ND", NEBRASKA: "NE",
  OKLAHOMA: "OK", "SOUTH DAKOTA": "SD", TENNESSEE: "TN", TEXAS: "TX", WISCONSIN: "WI",
  COLORADO: "CO", MONTANA: "MT", "NEW MEXICO": "NM", UTAH: "UT", WYOMING: "WY",
  ARIZONA: "AZ", CALIFORNIA: "CA", NEVADA: "NV", OREGON: "OR", WASHINGTON: "WA",
  ALASKA: "AK", HAWAII: "HI",
}

const validZone = (zone) => {
  if (!zone) return null
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone }).format(0)
    return zone
  } catch {
    return null
  }
}

const explicitZone = (source = {}) => validZone(
  source.bookingTimezone || source.bookingTimeZone || source.serviceTimezone ||
  source.serviceTimeZone || source.timezone || source.timeZone
)

const countryCode = (source = {}) => String(source.country || source.region || "").trim().toUpperCase()

const zoneFromCoordinates = (source = {}) => {
  const longitude = Number(source.customerLongitude ?? source.longitude ?? source.lng)
  const latitude = Number(source.customerLatitude ?? source.latitude ?? source.lat)
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null
  const country = countryCode(source)
  if (country === "UK" || country === "GB" || country === "UNITED KINGDOM") return "Europe/London"
  if (country && !["US", "USA", "UNITED STATES"].includes(country)) return null
  if (longitude <= -115) return "America/Los_Angeles"
  if (longitude <= -101) return "America/Denver"
  if (longitude <= -87) return "America/Chicago"
  return "America/New_York"
}

const zoneFromState = (source = {}) => {
  const raw = String(source.state || source.stateCode || "").trim().toUpperCase()
  return US_STATE_ZONES[raw] || US_STATE_ZONES[STATE_NAMES[raw]] || null
}

const countryFallback = (source = {}) => {
  const country = countryCode(source)
  if (["UK", "GB", "UNITED KINGDOM"].includes(country)) return "Europe/London"
  if (["US", "USA", "UNITED STATES"].includes(country)) return "America/New_York"
  return null
}

export const resolveTimeZone = (booking = {}, user = {}) =>
  explicitZone(booking) || zoneFromCoordinates(booking) || zoneFromState(booking) ||
  explicitZone(user) || zoneFromCoordinates(user) || zoneFromState(user) ||
  countryFallback(booking) || countryFallback(user) || "UTC"

export const parseUtcTimestamp = (value) => {
  if (value instanceof Date) return new Date(value.getTime())
  if (typeof value !== "string") return new Date(value)
  const text = value.trim()
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)
  return new Date(hasZone || !text.includes("T") ? text : `${text}Z`)
}

export const savedUserTimeContext = () => {
  try {
    return JSON.parse(globalThis.localStorage?.getItem("gos_user") || "{}")
  } catch {
    return {}
  }
}

export const formatLocalDateTime = (value, booking = {}, user = savedUserTimeContext()) => {
  if (!value) return "—"
  const date = parseUtcTimestamp(value)
  if (Number.isNaN(date.getTime())) return "—"
  const timeZone = resolveTimeZone(booking, user)
  const uk = timeZone === "Europe/London"
  const parts = new Intl.DateTimeFormat(uk ? "en-GB" : "en-US", {
    timeZone, day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: !uk, timeZoneName: "short",
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {})
  const day = uk ? `${parts.day} ${parts.month} ${parts.year}` : `${parts.month} ${parts.day}, ${parts.year}`
  return `${day} · ${parts.hour}:${parts.minute}${uk ? "" : ` ${parts.dayPeriod}`} ${parts.timeZoneName}`
}

export const formatLocalTime = (value, booking = {}, user = savedUserTimeContext()) => {
  if (!value) return ""
  const date = parseUtcTimestamp(value)
  if (Number.isNaN(date.getTime())) return ""
  const timeZone = resolveTimeZone(booking, user)
  return new Intl.DateTimeFormat(timeZone === "Europe/London" ? "en-GB" : "en-US", {
    timeZone, hour: "numeric", minute: "2-digit", hour12: timeZone !== "Europe/London", timeZoneName: "short",
  }).format(date)
}

export const formatNotificationTime = (value, booking = {}, user = savedUserTimeContext(), now = new Date()) => {
  if (!value) return ""
  const date = parseUtcTimestamp(value)
  if (Number.isNaN(date.getTime())) return ""
  const seconds = Math.max(0, Math.floor((new Date(now).getTime() - date.getTime()) / 1000))
  if (seconds < 5) return "Just now"
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return formatLocalDateTime(date, booking, user)
}
