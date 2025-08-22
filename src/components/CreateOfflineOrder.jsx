import { useEffect, useState } from 'react'
import { api, authHeader } from '../lib/api'

export default function CreateOfflineOrder() {
  const [tables, setTables] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [paid, setPaid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Load tables and menu items
  useEffect(() => {
    async function loadData() {
      try {
        const [tablesRes, menuRes] = await Promise.all([
          api.get('/tables', { headers: authHeader() }),
          api.get('/menu', { headers: authHeader() }),
        ])
        setTables(tablesRes.data || [])
        setMenuItems(menuRes.data || [])
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }
    loadData()
  }, [])

  // Add item to order
  const addItem = (itemId) => {
    setSelectedItems((prev) => {
      const found = prev.find((it) => it.item === itemId)
      if (found) {
        return prev.map((it) =>
          it.item === itemId ? { ...it, quantity: it.quantity + 1 } : it
        )
      }
      return [...prev, { item: itemId, quantity: 1 }]
    })
  }

  // Update item quantity
  const updateQuantity = (itemId, qty) => {
    if (qty < 1) {
      setSelectedItems((prev) => prev.filter((it) => it.item !== itemId))
    } else {
      setSelectedItems((prev) =>
        prev.map((it) =>
          it.item === itemId ? { ...it, quantity: qty } : it
        )
      )
    }
  }

  // Calculate total
  const totalAmount = selectedItems.reduce((sum, it) => {
    const menuItem = menuItems.find((m) => m._id === it.item)
    return sum + (menuItem?.price || 0) * it.quantity
  }, 0)

  // Submit order
  const createOrder = async () => {
    if (!selectedTable || selectedItems.length === 0) {
      setMessage('Please select table and at least 1 item')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await api.post(
        '/orders',
        {
          table: selectedTable,
          items: selectedItems,
          status: 'pending',
          totalAmount,
          paid,
        },
        { headers: authHeader() }
      )
      setMessage('✅ Order created successfully!')
      // reset
      setSelectedTable('')
      setSelectedItems([])
      setPaid(false)
    } catch (err) {
      console.error('Failed to create order:', err)
      setMessage('❌ Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white shadow rounded-xl border">
      <h2 className="text-2xl font-bold mb-4">Create Offline Order</h2>

      {/* Table select */}
      <label className="block mb-3">
        <span className="text-gray-700">Select Table</span>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
        >
          <option value="">-- Select Table --</option>
          {tables.map((t) => (
            <option key={t._id} value={t._id}>
              Table {t.number}
            </option>
          ))}
        </select>
      </label>

      {/* Menu items list */}
      <div className="mb-4">
        <span className="text-gray-700 font-medium">Add Items</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-64 overflow-y-auto">
          {menuItems.map((m) => (
            <div
              key={m._id}
              className="border p-3 rounded-lg hover:shadow cursor-pointer"
              onClick={() => addItem(m._id)}
            >
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-gray-500">₹{m.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Selected Items</h3>
          <ul className="space-y-2">
            {selectedItems.map((it) => {
              const menuItem = menuItems.find((m) => m._id === it.item)
              return (
                <li
                  key={it.item}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span>
                    {menuItem?.name} (₹{menuItem?.price}) ×
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) =>
                      updateQuantity(it.item, parseInt(e.target.value) || 1)
                    }
                    className="w-16 border rounded p-1 ml-2"
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Paid toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
          />
          Mark as Paid
        </label>
      </div>

      {/* Total */}
      <div className="mb-4 font-semibold text-lg">
        Total: ₹{totalAmount}
      </div>

      {/* Submit button */}
      <button
        onClick={createOrder}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Order'}
      </button>

      {/* Message */}
      {message && <div className="mt-3 text-sm">{message}</div>}
    </div>
  )
}
