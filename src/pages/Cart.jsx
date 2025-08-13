import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useCartStore } from '../store/cart'
import { useState } from 'react'

export default function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = useCartStore((s) => s.total())
  const tableToken = useCartStore((s) => s.tableToken)
  const clear = useCartStore((s) => s.clear)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  async function placeOrder() {
    setError('')
    setPlacing(true)
    try {
      const ordered_items = items.map((i) => ({ itemId: i.item._id, quantity: i.quantity }))
      await api.post('/orders', { tableToken, ordered_items })
      clear()
      navigate('/success')
    } catch (e) {
      setError('Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">Your Cart</h1>
        {items.length === 0 ? (
          <div className="text-gray-600">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {items.map((i) => (
              <div key={i.item._id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-medium">{i.item.name}</div>
                  <div className="text-sm text-gray-600">₹{i.item.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => setQuantity(i.item._id, i.quantity - 1)}>-</button>
                  <span className="w-8 text-center">{i.quantity}</span>
                  <button className="px-2 py-1 border rounded" onClick={() => setQuantity(i.item._id, i.quantity + 1)}>+</button>
                  <button className="px-3 py-1 text-red-600" onClick={() => removeItem(i.item._id)}>Remove</button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-lg font-semibold">Total</div>
              <div className="text-lg font-semibold">₹{total}</div>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <button disabled={placing} onClick={placeOrder} className="w-full py-3 rounded-md bg-emerald-600 text-white disabled:opacity-50">
              {placing ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


