import { Eye, UserCheck } from "lucide-react"

export default function RecentBookings() {
  const bookings = [
    {
      id: "GOS1025",
      customer: "John Smith",
      service: "Laptop Repair",
      location: "New York",
      status: "Pending",
    },
    {
      id: "GOS1026",
      customer: "David Lee",
      service: "WiFi Setup",
      location: "London",
      status: "Assigned",
    },
    {
      id: "GOS1027",
      customer: "Sarah Jones",
      service: "Printer Setup",
      location: "Manchester",
      status: "Completed",
    },
  ]

  return (
    <div className="bg-[#071122] border border-cyan-500/10 rounded-3xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Recent Bookings
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="pb-4">Booking ID</th>
              <th className="pb-4">Customer</th>
              <th className="pb-4">Service</th>
              <th className="pb-4">Location</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-white/5"
              >
                <td className="py-4 font-semibold text-cyan-300">
                  {booking.id}
                </td>

                <td>{booking.customer}</td>

                <td>{booking.service}</td>

                <td>{booking.location}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : booking.status === "Assigned"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>

                <td>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20">
                      <Eye className="w-4 h-4" />
                    </button>

                    <button className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20">
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}