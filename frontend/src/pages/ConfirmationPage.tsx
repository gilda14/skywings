import { useLocation, useNavigate, Link } from 'react-router-dom'

interface Booking {
  id: string
  booking_reference: string
  status: string
  flight_number: string
  airline: string
  from_code: string
  from_city: string
  to_code: string
  to_city: string
  departure: string
  arrival: string
  cabin_class: string
  passengers: number
  baggage_type: string
  flight_price: number
  baggage_price: number
  total_price: number
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

const baggageLabels: Record<string, string> = {
  carryon: 'Carry-on Only',
  checked1: '1 Checked Bag',
  checked2: '2 Checked Bags',
}

export default function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const booking = (location.state as { booking?: Booking })?.booking

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">No booking found</p>
        <Link to="/search" className="text-primary font-medium hover:underline">Book a flight</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-1">Your booking reference is <span className="font-bold text-primary text-lg">{booking.booking_reference}</span></p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 divide-y divide-gray-100">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Flight Details</h3>
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <div className="text-lg font-bold">{booking.from_code}</div>
              <div className="text-xs text-gray-500">{booking.from_city}</div>
            </div>
            <div className="flex-1 mx-4">
              <div className="w-full h-px bg-gray-300" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{booking.to_code}</div>
              <div className="text-xs text-gray-500">{booking.to_city}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Airline </span>
              <span className="font-medium">{booking.airline}</span>
            </div>
            <div>
              <span className="text-gray-500">Flight </span>
              <span className="font-medium">{booking.flight_number}</span>
            </div>
            <div>
              <span className="text-gray-500">Date </span>
              <span className="font-medium">{formatDate(booking.departure)}</span>
            </div>
            <div>
              <span className="text-gray-500">Cabin </span>
              <span className="font-medium capitalize">{booking.cabin_class}</span>
            </div>
            <div>
              <span className="text-gray-500">Departure </span>
              <span className="font-medium">{formatTime(booking.departure)}</span>
            </div>
            <div>
              <span className="text-gray-500">Arrival </span>
              <span className="font-medium">{formatTime(booking.arrival)}</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Booking Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Passengers</span>
              <span className="font-medium">{booking.passengers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Baggage</span>
              <span className="font-medium">{baggageLabels[booking.baggage_type] || booking.baggage_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-green-600 capitalize">{booking.status}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Flight</span>
              <span>${booking.flight_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Baggage</span>
              <span>{booking.baggage_price === 0 ? 'Free' : `$${booking.baggage_price}`}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
              <span>Total Paid</span>
              <span>${booking.total_price}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/search')}
          className="bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Book Another Flight
        </button>
      </div>
    </div>
  )
}
