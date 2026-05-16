import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import type { Flight } from '../types/flight'

type BaggageOption = 'carryon' | 'checked1' | 'checked2'

const baggageOptions: { value: BaggageOption; label: string; desc: string; price: number }[] = [
  { value: 'carryon', label: 'Carry-on Only', desc: '1 personal item + 1 carry-on (7 kg)', price: 0 },
  { value: 'checked1', label: '1 Checked Bag', desc: 'Carry-on + 1 checked bag (23 kg)', price: 35 },
  { value: 'checked2', label: '2 Checked Bags', desc: 'Carry-on + 2 checked bags (23 kg each)', price: 65 },
]

export default function BaggagePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const flight = (location.state as { flight?: Flight })?.flight

  const [selected, setSelected] = useState<BaggageOption>('carryon')

  if (!flight) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">No flight selected</p>
        <Link to="/search" className="text-primary font-medium hover:underline">Go to search</Link>
      </div>
    )
  }

  const bag = baggageOptions.find(b => b.value === selected)!

  const handleContinue = () => {
    navigate('/booking/payment', {
      state: {
        flight,
        baggage: { type: selected, price: bag.price },
      },
    })
  }

  const handleBack = () => {
    navigate('/booking/datetime', { state: { flight } })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Baggage</h2>
        <p className="text-gray-500 text-sm mt-1">Choose your baggage allowance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Flight</div>
        <div className="font-semibold">{flight.from_city} → {flight.to_city}</div>
        <div className="text-sm text-gray-500">{flight.airline} · {flight.flight_number} · {flight.cabin_class}</div>
      </div>

      <div className="space-y-3 mb-8">
        {baggageOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
              selected === opt.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">{opt.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">{opt.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {opt.price === 0 ? 'Free' : `$${opt.price}`}
                </div>
                <div className="text-xs text-gray-400">per passenger</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Flight ({flight.flight_number})</span>
          <span className="text-gray-700">${flight.base_price}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-500">Baggage ({bag.label})</span>
          <span className="text-gray-700">{bag.price === 0 ? 'Free' : `$${bag.price}`}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${flight.base_price + bag.price}</span>
        </div>
      </div>

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
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
