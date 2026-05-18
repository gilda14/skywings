import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const steps = [
  { label: 'Search',  path: '/search' },
  { label: 'Select',  path: '/results' },
  { label: 'Date/Time', path: '/booking/datetime' },
  { label: 'Baggage', path: '/booking/baggage' },
  { label: 'Payment', path: '/booking/payment' },
  { label: 'Confirm',  path: '/booking/confirmed' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const activeIndex = steps.findIndex(s => location.pathname === s.path)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/search" className="flex items-center gap-2">
            <span className="text-xl">✈</span>
            <span className="font-bold text-lg text-primary">SkyWings</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">{user.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <nav className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-5xl mx-auto py-3">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const isActive = i === activeIndex
              const isPast = i < activeIndex
              return (
                <div key={s.label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : isPast
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isPast ? '✓' : i + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold mt-1.5 uppercase tracking-wide whitespace-nowrap ${
                        isActive ? 'text-primary' : isPast ? 'text-primary/70' : 'text-gray-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 -mt-5">
                      <div className={`h-full rounded transition-colors ${i < activeIndex ? 'bg-primary' : 'bg-gray-200'}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
