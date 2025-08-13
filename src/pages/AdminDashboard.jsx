import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { api } from '../lib/api'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function load() {
      const res = await api.get('/orders', { headers: { ...(localStorage.getItem('admin_token') ? { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } : {}) } })
      setOrders(res.data)
    }
    load()
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
    socket.on('order:new', (order) => setOrders((prev) => [...prev, order]))
    socket.on('order:update', (order) => setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o))))
    socket.on('order:archive', ({ id }) => setOrders((prev) => prev.filter((o) => o._id !== id)))
    return () => socket.disconnect()
  }, [])

  async function updateStatus(id, status) {
    const token = localStorage.getItem('admin_token')
    await api.put(`/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Table {o.table?.number || '—'}</div>
                <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleTimeString()}</div>
              </div>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                {o.items.map((it) => (
                  <li key={it.item._id}>
                    {it.quantity} × {it.item.name} — ₹{it.item.price}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between">
                <div className={`text-sm px-2 py-1 rounded ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : o.status === 'preparing' ? 'bg-blue-100 text-blue-800' : o.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{o.status}</div>
                <div className="flex gap-2">
                  {o.status !== 'preparing' && <button onClick={() => updateStatus(o._id, 'preparing')} className="px-3 py-1 border rounded">Preparing</button>}
                  {o.status !== 'ready' && <button onClick={() => updateStatus(o._id, 'ready')} className="px-3 py-1 border rounded">Ready</button>}
                  {o.status !== 'served' && <button onClick={() => updateStatus(o._id, 'served')} className="px-3 py-1 border rounded">Served</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


