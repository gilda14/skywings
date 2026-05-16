import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import client from '../api/client'
import type { Flight } from '../types/flight'

interface BaggageSelection {
  type: string
  price: number
}

interface BookingResponse {
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

const paymentMethods = [
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🅿' },
  { value: 'applepay', label: 'Apple Pay', icon: '🍎' },
]

export default function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { flight?: Flight; baggage?: BaggageSelection } | null
  const flight = state?.flight
  const baggage = state?.baggage

  const [method, setMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!flight || !baggage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">No booking details found</p>
        <Link to="/search" className="text-primary font-medium hover:underline">Go to search</Link>
      </div>
    )
  }

  const total = flight.base_price + baggage.price

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post<BookingResponse>('/bookings', {
        flight_id: flight.id,
        passengers: 1,
        baggage_type: baggage.type,
        baggage_price: baggage.price,
        payment_method: method,
      })
      navigate('/booking/confirmed', { state: { booking: data } })
    } catch {
      setError('Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/booking/baggage', { state: { flight } })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Payment</h2>
        <p className="text-gray-500 text-sm mt-1">Complete your booking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                {paymentMethods.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      method === m.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{m.icon}</span>
                    <span className="font-medium text-sm">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {method === 'card' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Card Details</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="123"
                      value={cvc}
                      onChange={e => setCvc(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing…' : `Pay $${total}`}
              </button>
            </div>
          </form>
        </div>

        {/* Order summary sidebar */}
        <div className="bg-gray-50 rounded-xl p-5 h-fit">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
          <div className="text-sm font-semibold text-gray-800 mb-2">
            {flight.from_city} → {flight.to_city}
          </div>
          <div className="text-xs text-gray-500 mb-4">
            {flight.airline} · {flight.flight_number} · {flight.cabin_class}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Flight</span>
              <span className="text-gray-700">${flight.base_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Baggage</span>
              <span className="text-gray-700">{baggage.price === 0 ? 'Free' : `$${baggage.price}`}</span>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
