// import { useNavigate } from 'react-router-dom'
// import { api } from '../lib/api'
// import { useCartStore } from '../store/cart'
// import { useState } from 'react'

// export default function CartPage() {
//   const navigate = useNavigate()
//   const items = useCartStore((s) => s.items)
//   const setQuantity = useCartStore((s) => s.setQuantity)
//   const removeItem = useCartStore((s) => s.removeItem)
//   const total = useCartStore((s) => s.total())
//   const tableToken = useCartStore((s) => s.tableToken)
//   const clear = useCartStore((s) => s.clear)
//   const [placing, setPlacing] = useState(false)
//   const [error, setError] = useState('')

//   async function placeOrder() {
//     setError('')
//     setPlacing(true)
//     try {
//       const ordered_items = items.map((i) => ({ itemId: i.item._id, quantity: i.quantity }))
//       await api.post('/orders', { tableToken, ordered_items })
//       clear()
//       navigate('/success')
//     } catch (e) {
//       setError('Failed to place order')
//     } finally {
//       setPlacing(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-3xl mx-auto p-4">
//         <h1 className="text-xl font-semibold mb-4">Your Cart</h1>
//         {items.length === 0 ? (
//           <div className="text-gray-600">Your cart is empty.</div>
//         ) : (
//           <div className="space-y-4">
//             {items.map((i) => (
//               <div key={i.item._id} className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <div className="font-medium">{i.item.name}</div>
//                   <div className="text-sm text-gray-600">₹{i.item.price}</div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button className="px-2 py-1 border rounded" onClick={() => setQuantity(i.item._id, i.quantity - 1)}>-</button>
//                   <span className="w-8 text-center">{i.quantity}</span>
//                   <button className="px-2 py-1 border rounded" onClick={() => setQuantity(i.item._id, i.quantity + 1)}>+</button>
//                   <button className="px-3 py-1 text-red-600" onClick={() => removeItem(i.item._id)}>Remove</button>
//                 </div>
//               </div>
//             ))}
//             <div className="flex items-center justify-between border-t pt-4">
//               <div className="text-lg font-semibold">Total</div>
//               <div className="text-lg font-semibold">₹{total}</div>
//             </div>
//             {error && <div className="text-red-600">{error}</div>}
//             <button disabled={placing} onClick={placeOrder} className="w-full py-3 rounded-md bg-emerald-600 text-white disabled:opacity-50">
//               {placing ? 'Placing...' : 'Place Order'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


// import { useNavigate } from 'react-router-dom'
// import { api } from '../lib/api'
// import { useCartStore } from '../store/cart'
// import { useState } from 'react'

// export default function CartPage() {
//   const navigate = useNavigate()
//   const items = useCartStore((s) => s.items)
//   const setQuantity = useCartStore((s) => s.setQuantity)
//   const removeItem = useCartStore((s) => s.removeItem)
//   const total = useCartStore((s) => s.total())
//   const tableToken = useCartStore((s) => s.tableToken)
//   const setTableTokenStore = useCartStore((s) => s.setTableToken) // 🔸 added to sync from localStorage
//   const clear = useCartStore((s) => s.clear)
//   const [placing, setPlacing] = useState(false)
//   const [error, setError] = useState('')

//   async function placeOrder() {
//     setError('')
//     setPlacing(true)
//     try {
//       // 🔸 fallback: if not in store, try localStorage (QR opened earlier)
//       let tokenToUse = tableToken
//       if (!tokenToUse) {
//         try { tokenToUse = localStorage.getItem('tableToken') || '' } catch {}
//         if (tokenToUse) setTableTokenStore(tokenToUse)
//       }

//       if (!tokenToUse) {
//         setError('Table not linked. Please open menu via QR again (missing tableToken).')
//         return
//       }
//       if (!items || items.length === 0) {
//         setError('Your cart is empty.')
//         return
//       }

//       // backend expected shape: { tableToken, ordered_items: [{ itemId, quantity }] }
//       const ordered_items = items.map((i) => ({
//         itemId: i.item._id,
//         quantity: i.quantity
//       }))

//       console.log('Placing order with payload:', { tableToken: tokenToUse, ordered_items })

//       // 1) Create order in DB
//       const { data: order } = await api.post('/orders', { tableToken: tokenToUse, ordered_items })

//       // 2) Create Razorpay order for payment
//       const { data: paymentData } = await api.post(`/orders/${order._id}/pay`)

//       // 3) Open Razorpay Checkout
//       const options = {
//         key: paymentData.key,
//         amount: paymentData.amount,
//         currency: paymentData.currency,
//         order_id: paymentData.orderId,
//         name: 'Restaurant',
//         description: 'Order Payment',
//         handler: async function (response) {
//           try {
//             // 4) Verify payment on backend
//             await api.post('/payments/verify', {
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               orderId: order._id
//             })
//             clear()
//             navigate('/success')
//           } catch (err) {
//             console.error('Verification error:', err?.response?.data || err?.message)
//             setError('Payment verification failed')
//           }
//         },
//         prefill: {
//           name: 'Customer',
//           email: 'customer@example.com',
//           contact: '9999999999'
//         },
//         theme: { color: '#10b981' }
//       }

//       const rzp = new window.Razorpay(options)

//       rzp.on('payment.failed', function (resp) {
//         console.error('Razorpay payment failed:', resp?.error)
//         setError(resp?.error?.description || 'Payment failed, please try again.')
//       })

//       rzp.open()
//     } catch (e) {
//       console.error('Order placement error:', e?.response?.data || e?.message)
//       setError(
//         e?.response?.data?.message
//           ? `Failed: ${e.response.data.message}`
//           : 'Failed to place order'
//       )
//     } finally {
//       setPlacing(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-3xl mx-auto p-4">
//         <h1 className="text-xl font-semibold mb-4">Your Cart</h1>
//         {items.length === 0 ? (
//           <div className="text-gray-600">Your cart is empty.</div>
//         ) : (
//           <div className="space-y-4">
//             {items.map((i) => (
//               <div key={i.item._id} className="flex items-center justify-between border rounded-lg p-3">
//                 <div>
//                   <div className="font-medium">{i.item.name}</div>
//                   <div className="text-sm text-gray-600">₹{i.item.price}</div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button className="px-2 py-1 border rounded" onClick={() => setQuantity(i.item._id, i.quantity - 1)}>-</button>
//                   <span className="w-8 text-center">{i.quantity}</span>
//                   <button className="px-2 py-1 border rounded" onClick={() => setQuantity(i.item._id, i.quantity + 1)}>+</button>
//                   <button className="px-3 py-1 text-red-600" onClick={() => removeItem(i.item._id)}>Remove</button>
//                 </div>
//               </div>
//             ))}
//             <div className="flex items-center justify-between border-t pt-4">
//               <div className="text-lg font-semibold">Total</div>
//               <div className="text-lg font-semibold">₹{total}</div>
//             </div>
//             {error && <div className="text-red-600">{error}</div>}
//             <button disabled={placing} onClick={placeOrder} className="w-full py-3 rounded-md bg-emerald-600 text-white disabled:opacity-50">
//               {placing ? 'Processing...' : 'Pay & Place Order'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

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

      console.log('Placing order with payload:', { tableToken: tokenToUse, ordered_items })

      const { data: order } = await api.post('/orders', { tableToken: tokenToUse, ordered_items })

      const { data: paymentData } = await api.post(`/orders/${order._id}/pay`)

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: 'Restaurant',
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
        theme: { color: '#10b981' }
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
              {placing ? 'Processing...' : 'Pay & Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

