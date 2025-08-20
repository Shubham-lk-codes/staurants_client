import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MenuPage from './pages/Menu'
import CartPage from './pages/Cart'
import SuccessPage from './pages/Success'
import AdminLoginPage from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminTables from './pages/AdminTables'
import UpdateMenu from './components/UpdateMenu'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tables" element={<AdminTables />} />
        <Route path="/admin/update" element={<UpdateMenu />} />
        
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center">404</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
