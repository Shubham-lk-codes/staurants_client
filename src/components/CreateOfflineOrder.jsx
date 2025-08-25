import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function CreateOfflineOrder({ onOrderCreated }) {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Total calculate
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    // ✅ fetch tables
    api.get("/tables")
      .then((res) => setTables(res.data))
      .catch((err) => console.error(err));

    // ✅ fetch menu
    api.get("/menu")
      .then((res) => setMenu(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ item add
  const addItem = (menuItem) => {
    const existing = selectedItems.find((i) => i._id === menuItem._id);
    if (existing) {
      setSelectedItems((prev) =>
        prev.map((i) =>
          i._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        { ...menuItem, quantity: 1, price: menuItem.price },
      ]);
    }
  };

  // ✅ quantity update
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setSelectedItems((prev) => prev.filter((i) => i._id !== id));
    } else {
      setSelectedItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, quantity } : i))
      );
    }
  };

  // ✅ order submit
  const handleSubmit = async () => {
    if (!selectedTable || selectedItems.length === 0) {
      alert("Please select a table and add items.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/orders", {
        table: selectedTable,
        items: selectedItems.map((i) => ({
          item: i._id,
          quantity: i.quantity,
        })),
        totalAmount,
        paid: false,
        status: "pending",
      });
      alert("Order created successfully!");
      setSelectedTable("");
      setSelectedItems([]);
      onOrderCreated && onOrderCreated();
    } catch (err) {
      console.error(err);
      alert("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Create Offline Order</h2>

      {/* Table selection */}
      <select
        className="border p-2 rounded mb-4 w-full"
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
      >
        <option value="">Select Table</option>
        {tables.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name || `Table ${t.number}`}
          </option>
        ))}
      </select>

      {/* Menu List */}
      <h3 className="font-semibold mb-2">Menu</h3>
      <div className="grid grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto">
        {menu.map((m) => (
          <button
            key={m._id}
            className="p-2 border rounded hover:bg-gray-100"
            onClick={() => addItem(m)}
          >
            {m.name} – ₹{m.price}
          </button>
        ))}
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Selected Items</h3>
          {selectedItems.map((i) => (
            <div
              key={i._id}
              className="flex justify-between items-center border-b py-1"
            >
              <span>
                {i.name} – ₹{i.price}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 bg-gray-200"
                  onClick={() => updateQuantity(i._id, i.quantity - 1)}
                >
                  -
                </button>
                <span>{i.quantity}</span>
                <button
                  className="px-2 bg-gray-200"
                  onClick={() => updateQuantity(i._id, i.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="text-lg font-bold mb-4">Total: ₹{totalAmount}</div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : "Create Order"}
      </button>
    </div>
  );
}
