



// src/pages/CartPage.jsx
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
  const setTableTokenStore = useCartStore((s) => s.setTableToken)
  const clear = useCartStore((s) => s.clear)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  async function placeOrder() {
    setError('')
    setPlacing(true)
    try {
      let tokenToUse = tableToken
      if (!tokenToUse) {
        try { tokenToUse = localStorage.getItem('tableToken') || '' } catch {}
        if (tokenToUse) setTableTokenStore(tokenToUse)
      }

      if (!tokenToUse) {
        setError('Table not linked. Please open menu via QR again (missing tableToken).')
        return
      }
      if (!items || items.length === 0) {
        setError('Your cart is empty.')
        return
      }

      const ordered_items = items.map((i) => ({
        itemId: i.item._id,
        quantity: i.quantity
      }))

      const { data: order } = await api.post('/orders', { tableToken: tokenToUse, ordered_items })
      const { data: paymentData } = await api.post(`/orders/${order._id}/pay`)

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: 'Patrika Café',
        description: 'Order Payment',
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            })
            clear()
            navigate('/success')
          } catch (err) {
            console.error('Verification error:', err?.response?.data || err?.message)
            setError('Payment verification failed')
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: { color: '#f97316' } // orange
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        console.error('Razorpay payment failed:', resp?.error)
        setError(resp?.error?.description || 'Payment failed, please try again.')
      })
      rzp.open()
    } catch (e) {
      console.error('Order placement error:', e?.response?.data || e?.message)
      setError(
        e?.response?.data?.message
          ? `Failed: ${e.response.data.message}`
          : 'Failed to place order'
      )
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-6">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.jpg" alt="Patrika Cafe" className="h-16 w-16 rounded-full border-2 border-orange-500 shadow-md mb-2" />
          <h1 className="text-2xl font-bold text-orange-500">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-gray-400 text-center">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {items.map((i) => (
              <div
                key={i.item._id}
                className="flex items-center justify-between bg-[#1a1a1a] border border-orange-500 rounded-lg p-4 shadow-md"
              >
                <div>
                  <div className="font-semibold text-lg text-orange-400">{i.item.name}</div>
                  <div className="text-sm text-gray-400">₹{i.item.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 border border-gray-600 rounded text-white hover:bg-orange-600 transition"
                    onClick={() => setQuantity(i.item._id, i.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{i.quantity}</span>
                  <button
                    className="px-2 py-1 border border-gray-600 rounded text-white hover:bg-orange-600 transition"
                    onClick={() => setQuantity(i.item._id, i.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="px-3 py-1 text-red-500 hover:text-red-400"
                    onClick={() => removeItem(i.item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <div className="text-lg font-semibold">Total</div>
              <div className="text-lg font-semibold text-orange-400">₹{total}</div>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            {/* Button */}
            <button
              disabled={placing}
              onClick={placeOrder}
              className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-black font-bold disabled:opacity-50"
            >
              {placing ? 'Processing...' : 'Pay & Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


