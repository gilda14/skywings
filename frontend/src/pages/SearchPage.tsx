import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchFlights } from '../api/flights'
import type { Flight } from '../types/flight'

const airports = [
  { code: 'JFK', city: 'New York' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'MIA', city: 'Miami' },
]

const cabinClasses = ['economy', 'business']

export default function SearchPage() {
  const navigate = useNavigate()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [passengers, setPassengers] = useState(1)
  const [cabinClass, setCabinClass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const swap = useCallback(() => {
    setFrom(prev => { const next = to; setTo(prev); return next })
  }, [to])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (from === to) {
      setError('Origin and destination must be different')
      return
    }
    setLoading(true)
    try {
      const results: Flight[] = await searchFlights({
        from_code: from,
        to_code: to,
        departure_date: date,
        passengers,
        ...(cabinClass ? { cabin_class: cabinClass } : {}),
      })
      navigate('/results', { state: { flights: results } })
    } catch {
      setError('Failed to search flights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getMinDate = () => new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Find Your Flight</h2>
        <p className="text-gray-500 mt-1">Search flights to destinations worldwide</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">From</label>
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select origin</option>
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">To</label>
              <select
                value={to}
                onChange={e => setTo(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select destination</option>
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={swap}
                className="absolute top-1/2 -right-3 translate-y-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm hover:bg-primary-dark transition-colors shadow"
                title="Swap airports"
              >
                ⇄
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={getMinDate()}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Passengers</label>
              <select
                value={passengers}
                onChange={e => setPassengers(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cabin</label>
              <select
                value={cabinClass}
                onChange={e => setCabinClass(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Any cabin</option>
                {cabinClasses.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching…' : 'Search Flights'}
          </button>
        </form>
      </div>
    </div>
  )
}
