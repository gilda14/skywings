import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import ResultsPage from './pages/ResultsPage'
import DateTimePage from './pages/DateTimePage'
import BaggagePage from './pages/BaggagePage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes — no layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/booking/datetime" element={<DateTimePage />} />
            <Route path="/booking/baggage" element={<BaggagePage />} />
            <Route path="/booking/payment" element={<PaymentPage />} />
            <Route path="/booking/confirmed" element={<ConfirmationPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
