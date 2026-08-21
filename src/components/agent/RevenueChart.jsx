import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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
      <p className="mt-1 text-sm font-bold text-gos-turquoise">£/${Number(payload[0].value).toFixed(2)}</p>
    </div>
  )
}

export default function RevenueChart({ bookings = [] }) {
  const data = useMemo(() => {
    const byDate = bookings.reduce((acc, booking) => {
      if (!booking.bookingDate) return acc
      const key = booking.bookingDate
      acc[key] = (acc[key] || 0) + Number(booking.paidAmount || 0)
      return acc
    }, {})

    return Object.entries(byDate)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7)
      .map(([day, revenue]) => ({ day, revenue: Number(revenue.toFixed(2)) }))
  }, [bookings])

  return (
    <div className="rounded-3xl border border-cyan-500/10 bg-[#071122] p-5 md:p-6">
      <h3 className="text-lg font-black md:text-xl">Revenue Trend</h3>
      <p className="mt-1 text-xs text-cyan-100/45">Paid amount collected per day, last 7 active days</p>

      {data.length ? (
        <ResponsiveContainer width="100%" height={260} className="mt-4">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#dce3e8" strokeDasharray="3 3" />
            <XAxis dataKey="day" tickFormatter={formatDate} tick={{ fill: "#66737f", fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: "#dce3e8" }} tickLine={false} />
            <YAxis tick={{ fill: "#66737f", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip cursor={{ fill: "rgba(32,184,176,0.08)" }} content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#20b8b0" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-cyan-100/40">
          Not enough paid bookings yet to chart revenue.
        </div>
      )}
    </div>
  )
}
