import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchFlights } from '../api/flights'
import AirportInput from '../components/AirportInput'
import type { Flight } from '../types/flight'

const cabinClasses = ['economy', 'business']
type TripType = 'oneway' | 'multicity'

function dateStr(daysOffset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState<TripType>('oneway')

  const [from1, setFrom1] = useState('')
  const [to1, setTo1] = useState('')
  const [date1, setDate1] = useState(dateStr(0))

  const [from2, setFrom2] = useState('')
  const [to2, setTo2] = useState('')
  const [date2, setDate2] = useState(dateStr(3))

  const [passengers, setPassengers] = useState(1)
  const [cabinClass, setCabinClass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const swap1 = useCallback(() => {
    setFrom1(prev => { const next = to1; setTo1(prev); return next })
  }, [to1])

  const swap2 = useCallback(() => {
    setFrom2(prev => { const next = to2; setTo2(prev); return next })
  }, [to2])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (from1 === to1 || from1.length !== 3 || to1.length !== 3) {
      setError('Enter valid 3-letter airport codes for the first leg')
      return
    }
    if (tripType === 'multicity') {
      if (from2 === to2 || from2.length !== 3 || to2.length !== 3) {
        setError('Enter valid 3-letter airport codes for the second leg')
        return
      }
    }

    setLoading(true)
    try {
      const leg1: Flight[] = await searchFlights({
        from_code: from1,
        to_code: to1,
        departure_date: date1,
        passengers,
        ...(cabinClass ? { cabin_class: cabinClass } : {}),
      })

      let leg2: Flight[] = []
      if (tripType === 'multicity') {
        leg2 = await searchFlights({
          from_code: from2,
          to_code: to2,
          departure_date: date2,
          passengers,
          ...(cabinClass ? { cabin_class: cabinClass } : {}),
        })
      }

      navigate('/results', { state: { flights: leg1, leg2, tripType } })
    } catch {
      setError('Failed to search flights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getMinDate = () => new Date().toISOString().slice(0, 10)

  const FromToRow = ({
    leg,
    from,
    to,
    date,
    setFrom,
    setTo,
    setDate,
    swapFn,
    excludeFrom,
    excludeTo,
  }: {
    leg: string
    from: string
    to: string
    date: string
    setFrom: (v: string) => void
    setTo: (v: string) => void
    setDate: (v: string) => void
    swapFn: () => void
    excludeFrom?: string
    excludeTo?: string
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {leg === '1' ? 'From' : 'From'}
        </label>
        <AirportInput
          id={`from${leg}`}
          value={from}
          onChange={setFrom}
          placeholder="e.g. JFK"
          excludeCode={excludeFrom}
        />
      </div>
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {leg === '1' ? 'To' : 'To'}
        </label>
        <AirportInput
          id={`to${leg}`}
          value={to}
          onChange={setTo}
          placeholder="e.g. LAX"
          excludeCode={excludeTo}
        />
        <button
          type="button"
          onClick={swapFn}
          className="absolute top-1/2 -right-3 translate-y-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm hover:bg-primary-dark transition-colors shadow"
          title="Swap airports"
        >
          ⇄
        </button>
      </div>
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
      {leg === '1' ? (
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
      ) : (
        <div />
      )}
    </div>
  )

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

          {/* Trip type toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setTripType('oneway')}
              className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                tripType === 'oneway'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              One Way
            </button>
            <button
              type="button"
              onClick={() => setTripType('multicity')}
              className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                tripType === 'multicity'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Multi-City
            </button>
          </div>

          {/* Leg 1 */}
          {tripType === 'oneway' ? (
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Trip</div>
          ) : (
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Leg 1</div>
          )}
          <FromToRow
            leg="1"
            from={from1} to={to1} date={date1}
            setFrom={setFrom1} setTo={setTo1} setDate={setDate1}
            swapFn={swap1}
            excludeFrom={to2 || undefined}
            excludeTo={from2 || undefined}
          />

          {/* Leg 2 (multi-city only) */}
          {tripType === 'multicity' && (
            <>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide pt-2">Leg 2</div>
              <FromToRow
                leg="2"
                from={from2} to={to2} date={date2}
                setFrom={setFrom2} setTo={setTo2} setDate={setDate2}
                swapFn={swap2}
                excludeFrom={to1 || undefined}
                excludeTo={from1 || undefined}
              />
            </>
          )}

          {/* Cabin class */}
          <div className="flex items-center gap-4 pt-1">
            <div className="w-48">
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
            {loading ? 'Searching…' : `Search ${tripType === 'multicity' ? 'Multi-City ' : ''}Flights`}
          </button>
        </form>
      </div>
    </div>
  )
}
