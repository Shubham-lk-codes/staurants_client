

// import { useEffect, useState } from 'react'
// import { api } from '../lib/api'
// import { Calendar } from 'lucide-react' // calendar icon

// export default function HistoryOfOrders() {
//   const [history, setHistory] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selectedDate, setSelectedDate] = useState('')

//   useEffect(() => {
//     async function load() {
//       try {
//         const token = localStorage.getItem('admin_token')
//         const res = await api.get('/orders?includeServed=true', {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         })
//         // सिर्फ served वाले filter कर दिए
//         const servedOrders = (Array.isArray(res.data) ? res.data : []).filter(
//           (o) => o.status === 'served'
//         )
//         setHistory(servedOrders)
//       } catch (err) {
//         console.error('Failed to fetch history:', err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [])

//   // ✅ Date filter apply
//   const filteredOrders = selectedDate
//     ? history.filter((o) => {
//         if (!o.createdAt) return false
//         const orderDate = new Date(o.createdAt).toISOString().split('T')[0]
//         return orderDate === selectedDate
//       })
//     : history

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">History of Orders</h1>

//         {/* Calendar button + hidden input */}
//         <div className="relative">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <Calendar className="w-6 h-6 text-gray-600 hover:text-black" />
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="absolute inset-0 opacity-0 cursor-pointer"
//             />
//           </label>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-gray-500">Loading...</div>
//       ) : filteredOrders.length === 0 ? (
//         <div className="text-gray-500">No served orders yet</div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//           {filteredOrders.map((o) => (
//             <div
//               key={o._id}
//               className="bg-white rounded-xl shadow hover:shadow-md transition p-5 border border-gray-100"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="font-semibold text-lg">
//                   Table {o.table?.number || '—'}
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   {o.createdAt
//                     ? new Date(o.createdAt).toLocaleString()
//                     : '—'}
//                 </div>
//               </div>

//               <ul className="mt-3 text-sm text-gray-700 space-y-1">
//                 {(o.items || []).map((it, idx) => (
//                   <li key={it.item?._id || idx}>
//                     {it.quantity} × {it.item?.name || 'Unknown'} — ₹
//                     {it.item?.price || 0}
//                   </li>
//                 ))}
//               </ul>

//               {/* ✅ Total दिखा दिया */}
//               <div className="mt-2 text-right text-sm font-semibold text-gray-800">
//                 Total: ₹
//                 {(o.items || []).reduce(
//                   (sum, it) => sum + it.quantity * (it.item?.price || 0),
//                   0
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Calendar } from 'lucide-react' // calendar icon

export default function HistoryOfOrders() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [revenueFilter, setRevenueFilter] = useState('all')

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

  // ✅ Date filter apply
  const filteredOrders = selectedDate
    ? history.filter((o) => {
        if (!o.createdAt) return false
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0]
        return orderDate === selectedDate
      })
    : history

  // ✅ Revenue filter apply
  const now = new Date()
  const revenueOrders = history.filter((o) => {
    if (!o.createdAt) return false
    const orderDate = new Date(o.createdAt)

    if (revenueFilter === 'day') {
      return (
        orderDate.toDateString() === now.toDateString()
      )
    }
    if (revenueFilter === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // sunday
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      return orderDate >= startOfWeek && orderDate < endOfWeek
    }
    if (revenueFilter === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      )
    }
    if (revenueFilter === 'year') {
      return orderDate.getFullYear() === now.getFullYear()
    }
    return true // all
  })

  const totalRevenue = revenueOrders.reduce(
    (sum, o) =>
      sum +
      (o.items || []).reduce(
        (s, it) => s + it.quantity * (it.item?.price || 0),
        0
      ),
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">History of Orders</h1>

        <div className="flex items-center gap-4">
          {/* Calendar + Clear Filter */}
          <div className="relative">
            <label className="flex items-center gap-2 cursor-pointer">
              <Calendar className="w-6 h-6 text-gray-600 hover:text-black" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Clear Filter
            </button>
          )}

          {/* Total Revenue + filter */}
          <div className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-lg border">
            <span className="font-semibold text-gray-800">
              Revenue: ₹{totalRevenue}
            </span>
            <select
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
              className="ml-2 border rounded p-1 text-sm"
            >
              <option value="all">All</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-gray-500">No served orders yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((o) => (
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
                  (sum, it) => sum + it.quantity * (it.item?.price || 0),
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
