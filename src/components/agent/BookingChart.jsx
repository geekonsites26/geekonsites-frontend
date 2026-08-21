import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const formatDate = (value) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gos-border bg-white px-3 py-2 shadow-[var(--gos-shadow-sm)]">
      <p className="text-xs font-extrabold text-gos-blue-deep">{formatDate(label)}</p>
      <p className="mt-1 text-sm font-bold text-gos-turquoise">{payload[0].value} booking{payload[0].value === 1 ? "" : "s"}</p>
    </div>
  )
}

export default function BookingChart({ bookings = [] }) {
  const data = useMemo(() => {
    const byDate = bookings.reduce((acc, booking) => {
      if (!booking.bookingDate) return acc
      acc[booking.bookingDate] = (acc[booking.bookingDate] || 0) + 1
      return acc
    }, {})

    return Object.entries(byDate)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7)
      .map(([day, count]) => ({ day, bookings: count }))
  }, [bookings])

  return (
    <div className="rounded-3xl border border-cyan-500/10 bg-[#071122] p-5 md:p-6">
      <h3 className="text-lg font-black md:text-xl">Bookings Trend</h3>
      <p className="mt-1 text-xs text-cyan-100/45">Booking volume per day, last 7 active days</p>

      {data.length ? (
        <ResponsiveContainer width="100%" height={260} className="mt-4">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#dce3e8" strokeDasharray="3 3" />
            <XAxis dataKey="day" tickFormatter={formatDate} tick={{ fill: "#66737f", fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: "#dce3e8" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#66737f", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip cursor={{ stroke: "#20b8b0", strokeWidth: 1, strokeDasharray: "3 3" }} content={<CustomTooltip />} />
            <Line type="monotone" dataKey="bookings" stroke="#20b8b0" strokeWidth={2.5} dot={{ r: 4, fill: "#20b8b0", strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-cyan-100/40">
          Not enough bookings yet to chart volume.
        </div>
      )}
    </div>
  )
}
