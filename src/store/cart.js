import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  tableToken: null,
  items: [], // { item, quantity }

  setTableToken: (token) => set({ tableToken: token }),
  addItem: (item) => {
    const { items } = get()
    const idx = items.findIndex((i) => i.item._id === item._id)
    if (idx >= 0) {
      const next = [...items]
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
      set({ items: next })
    } else {
      set({ items: [...items, { item, quantity: 1 }] })
    }
  },
  removeItem: (itemId) => {
    const { items } = get()
    set({ items: items.filter((i) => i.item._id !== itemId) })
  },
  setQuantity: (itemId, qty) => {
    const { items } = get()
    if (qty <= 0) return set({ items: items.filter((i) => i.item._id !== itemId) })
    const next = items.map((i) => (i.item._id === itemId ? { ...i, quantity: qty } : i))
    set({ items: next })
  },
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.item.price * i.quantity, 0),
}))


