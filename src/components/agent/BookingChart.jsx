import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

const data = [
  { day: "Mon", bookings: 12 },
  { day: "Tue", bookings: 18 },
  { day: "Wed", bookings: 24 },
  { day: "Thu", bookings: 15 },
  { day: "Fri", bookings: 28 },
  { day: "Sat", bookings: 22 },
  { day: "Sun", bookings: 30 },
]

export default function BookingChart() {
  return (
    <div className="bg-[#071122] rounded-3xl p-6 border border-cyan-500/10">
      <h3 className="text-xl font-bold mb-4">Bookings Trend</h3>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#22d3ee"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}