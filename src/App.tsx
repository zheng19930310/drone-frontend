import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ToastProvider } from '@/components/ui/toast'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import WhitelistPage from '@/pages/WhitelistPage'
import DepartmentPage from '@/pages/DepartmentPage'
import EquipmentPage from '@/pages/EquipmentPage'
import StaffPage from '@/pages/StaffPage'
import TaskPage from '@/pages/TaskPage'
import SchedulePage from '@/pages/SchedulePage'
import AlarmPage from '@/pages/AlarmPage'
import ViolationPage from '@/pages/ViolationPage'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/whitelist"
        element={
          <ProtectedRoute>
            <Layout><WhitelistPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/department"
        element={
          <ProtectedRoute>
            <Layout><DepartmentPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment"
        element={
          <ProtectedRoute>
            <Layout><EquipmentPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <Layout><StaffPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/task"
        element={
          <ProtectedRoute>
            <Layout><TaskPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Layout><SchedulePage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alarm"
        element={
          <ProtectedRoute>
            <Layout><AlarmPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/violation"
        element={
          <ProtectedRoute>
            <Layout><ViolationPage /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
