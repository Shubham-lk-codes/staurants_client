import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useCartStore } from '../store/cart'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function MenuPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const query = useQuery()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const setTableToken = useCartStore((s) => s.setTableToken)
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))

  useEffect(() => {
    const token = query.get('table') || query.get('table_id')
    if (token) setTableToken(token)
  }, [query, setTableToken])

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/menu')
        setItems(res.data)
      } catch (e) {
        setError('Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const by = items.reduce((acc, it) => {
      acc[it.category] = acc[it.category] || []
      acc[it.category].push(it)
      return acc
    }, {})
    const order = ['Starters', 'Main Course', 'Drinks', 'Desserts']
    return order.filter((c) => by[c]?.length).map((c) => ({ category: c, items: by[c] }))
  }, [items])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">Restaurant Menu</h1>
          <button onClick={() => navigate('/cart')} className="relative px-4 py-2 rounded-md bg-emerald-600 text-white">
            Cart
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-sm bg-white text-emerald-700 rounded-full px-2">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-8">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="text-lg font-bold mb-3">{group.category}</h2>
            <div className="grid grid-cols-1 gap-4">
              {group.items.map((it) => (
                <div key={it._id} className="flex gap-4 border rounded-lg p-3">
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt={it.name} className="w-24 h-24 object-cover rounded" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{it.name}</h3>
                        <p className="text-sm text-gray-600">{it.description}</p>
                      </div>
                      <div className="text-right font-medium">₹{it.price}</div>
                    </div>
                    <div className="mt-3">
                      <button onClick={() => addItem(it)} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white">Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
