import { Outlet, Link } from 'react-router-dom'

const steps = [
  { label: 'Search',  path: '/search' },
  { label: 'Select',  path: '/results' },
  { label: 'Date/Time', path: '/booking/datetime' },
  { label: 'Baggage', path: '/booking/baggage' },
  { label: 'Payment', path: '/booking/payment' },
  { label: 'Confirm',  path: '/booking/confirmed' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/search" className="flex items-center gap-2">
            <span className="text-xl">✈</span>
            <span className="font-bold text-lg text-primary">SkyWings</span>
          </Link>
        </div>
      </header>

      {/* Step indicator */}
      <nav className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-5xl mx-auto flex justify-between py-2 text-xs font-medium text-gray-400">
          {steps.map(s => (
            <span key={s.label}>{s.label}</span>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
