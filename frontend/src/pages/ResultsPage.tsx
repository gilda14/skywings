import { useLocation, useNavigate, Link } from 'react-router-dom'
import type { Flight } from '../types/flight'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

function FlightCard({ flight }: { flight: Flight }) {
  const navigate = useNavigate()

  const handleSelect = () => {
    navigate('/booking/datetime', { state: { flight } })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">{flight.airline}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{flight.flight_number}</span>
        </div>
        <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
          {flight.cabin_class}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold">{formatTime(flight.departure)}</div>
          <div className="text-xs text-gray-500">{flight.from_code}</div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-1">{formatDuration(flight.duration_min)}</div>
          <div className="w-full h-px bg-gray-300 relative">
            {flight.stops > 0 && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 text-[10px] text-orange-500 bg-white px-1">
                {flight.stops} stop{flight.stops > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{flight.stops === 0 ? 'Nonstop' : 'Connecting'}</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold">{formatTime(flight.arrival)}</div>
          <div className="text-xs text-gray-500">{flight.to_code}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <span className="text-2xl font-bold text-primary">${flight.base_price}</span>
          <span className="text-sm text-gray-400"> / person</span>
        </div>
        <button
          onClick={handleSelect}
          className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  )
}

function FlightList({ flights, label }: { flights: Flight[]; label: string }) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-400 text-sm">No flights found for {label}</p>
      </div>
    )
  }

  const [from, to] = [flights[0].from_city, flights[0].to_city]

  return (
    <div>
      <div className="mb-3">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <h3 className="text-lg font-bold">{from} → {to}</h3>
          <span className="text-sm text-gray-400">· {flights.length} flight{flights.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="space-y-3">
        {flights.map(flight => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { flights?: Flight[]; leg2?: Flight[] } | null
  const flights = state?.flights
  const leg2 = state?.leg2

  if (!flights) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">No search results found</p>
        <Link to="/search" className="text-primary font-medium hover:underline">Back to search</Link>
      </div>
    )
  }

  const totalFlights = flights.length + (leg2?.length || 0)

  if (totalFlights === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-500 text-lg mb-2">No flights found</p>
        <p className="text-gray-400 text-sm mb-6">Try different dates or destinations</p>
        <button onClick={() => navigate('/search')} className="text-primary font-medium hover:underline">
          Modify search
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Available Flights</h2>
          <p className="text-gray-500 text-sm mt-1">{leg2 ? 'Multi-city results' : `${flights[0].from_city} → ${flights[0].to_city}`}</p>
        </div>
        <button onClick={() => navigate('/search')} className="text-sm text-primary font-medium hover:underline">
          Modify search
        </button>
      </div>

      <div className={leg2 ? 'space-y-8' : undefined}>
        {leg2 ? (
          <>
            <FlightList flights={flights} label="Leg 1" />
            <FlightList flights={leg2} label="Leg 2" />
          </>
        ) : (
          flights.map(flight => <FlightCard key={flight.id} flight={flight} />)
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/search')}
          className="border border-gray-300 text-gray-700 font-semibold px-8 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          ← Back to Search
        </button>
      </div>
    </div>
  )
}
