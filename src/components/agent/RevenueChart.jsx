import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const data = [
  { day: "Mon", revenue: 800 },
  { day: "Tue", revenue: 1200 },
  { day: "Wed", revenue: 1600 },
  { day: "Thu", revenue: 1100 },
  { day: "Fri", revenue: 2200 },
  { day: "Sat", revenue: 1800 },
  { day: "Sun", revenue: 2600 },
]

export default function RevenueChart() {
  return (
    <div className="bg-[#071122] rounded-3xl p-6 border border-cyan-500/10">
      <h3 className="text-xl font-bold mb-4">Revenue Trend</h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}