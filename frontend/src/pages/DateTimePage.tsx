import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { searchFlights } from '../api/flights'
import type { Flight } from '../types/flight'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export default function DateTimePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const preselected = (location.state as { flight?: Flight })?.flight

  const [selected, setSelected] = useState<Flight | null>(preselected || null)
  const [alternatives, setAlternatives] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (preselected) {
      setLoading(true)
      searchFlights({
        from_code: preselected.from_code,
        to_code: preselected.to_code,
        departure_date: preselected.departure.slice(0, 10),
        passengers: 1,
      })
        .then((flights) => setAlternatives(flights.filter(f => f.id !== preselected.id)))
        .catch(() => setAlternatives([]))
        .finally(() => setLoading(false))
    }
  }, [preselected])

  if (!preselected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">No flight selected</p>
        <Link to="/search" className="text-primary font-medium hover:underline">Go to search</Link>
      </div>
    )
  }

  const flight = selected || preselected

  const handleContinue = () => {
    navigate('/booking/baggage', { state: { flight: selected || preselected } })
  }

  const handleBack = () => {
    navigate('/results', { state: { flights: [preselected, ...alternatives] } })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Date & Time</h2>
          <p className="text-gray-500 text-sm mt-1">Review your travel date and time</p>
        </div>
      </div>

      {/* Selected flight summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
        <div className="text-xs text-primary font-semibold uppercase tracking-wide mb-3">Selected Flight</div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-bold">{flight.from_code}</span>
          <span className="text-gray-400">→</span>
          <span className="text-lg font-bold">{flight.to_code}</span>
        </div>
        <div className="text-sm text-gray-600 mb-1">
          {flight.airline} · {flight.flight_number} · {flight.cabin_class}
        </div>
        <div className="text-2xl font-bold text-gray-800 mb-3">{formatDate(flight.departure)}</div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Departure </span>
            <span className="font-semibold">{formatTime(flight.departure)}</span>
          </div>
          <div className="text-gray-300">|</div>
          <div>
            <span className="text-gray-500">Arrival </span>
            <span className="font-semibold">{formatTime(flight.arrival)}</span>
          </div>
          <div className="text-gray-300">|</div>
          <div>
            <span className="text-gray-500">Duration </span>
            <span className="font-semibold">{formatDuration(flight.duration_min)}</span>
          </div>
        </div>
      </div>

      {/* Alternative times */}
      {loading && (
        <div className="text-center py-4 text-gray-400 text-sm">Loading available times…</div>
      )}
      {!loading && alternatives.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Other Available Times
          </h3>
          <div className="space-y-2">
            {alternatives.map(f => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selected?.id === f.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold">{formatTime(f.departure)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold">{formatTime(f.arrival)}</span>
                    <span className="text-gray-400">{formatDuration(f.duration_min)}</span>
                    {f.stops > 0 && (
                      <span className="text-xs text-orange-500">{f.stops} stop{f.stops > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">${f.base_price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleBack}
          className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Continue to Baggage
        </button>
      </div>
    </div>
  )
}
