import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function HistoryOfOrders() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('admin_token')
        const res = await api.get('/orders?includeServed=true', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        // सिर्फ served वाले filter कर दिए
        const servedOrders = (Array.isArray(res.data) ? res.data : []).filter(
          (o) => o.status === 'served'
        )
        setHistory(servedOrders)
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">History of Orders</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-gray-500">No served orders yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {history.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-xl shadow hover:shadow-md transition p-5 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">
                  Table {o.table?.number || '—'}
                </div>
                <div className="text-sm text-gray-500">
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleString()
                    : '—'}
                </div>
              </div>

              <ul className="mt-3 text-sm text-gray-700 space-y-1">
                {(o.items || []).map((it, idx) => (
                  <li key={it.item?._id || idx}>
                    {it.quantity} × {it.item?.name || 'Unknown'} — ₹
                    {it.item?.price || 0}
                  </li>
                ))}
              </ul>

              {/* ✅ Total दिखा दिया */}
              <div className="mt-2 text-right text-sm font-semibold text-gray-800">
                Total: ₹
                {(o.items || []).reduce(
                  (sum, it) =>
                    sum + it.quantity * (it.item?.price || 0),
                  0
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
