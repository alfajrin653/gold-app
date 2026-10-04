import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import SalesDashboard from './pages/SalesDashboard'
import TransactionForm from './pages/TransactionForm'
import ManagementDashboard from './pages/ManagementDashboard'
import Tracking from './pages/Tracking'
import AuditLog from './pages/AuditLog'

const home = (u) => (u ? (u.role === 'MANAGEMENT' ? '/management' : '/sales') : '/login')
const Protected = ({ role }) => { const { user } = useAuth(); return user?.role === role ? <Outlet /> : <Navigate to={home(user)} replace /> }

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home(user)} replace /> : <Login />} />
      <Route element={<Layout />}>
        <Route element={<Protected role="SALES" />}>
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/sales/beli" element={<TransactionForm type="BELI" />} />
          <Route path="/sales/jual" element={<TransactionForm type="JUAL" />} />
        </Route>
        <Route element={<Protected role="MANAGEMENT" />}>
          <Route path="/management" element={<ManagementDashboard />} />
          <Route path="/management/tracking" element={<Tracking />} />
          <Route path="/management/audit" element={<AuditLog />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={home(user)} replace />} />
    </Routes>
  )
}
