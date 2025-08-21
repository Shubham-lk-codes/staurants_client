import { useEffect, useState } from "react";
import { api, authHeader } from "../lib/api";

export default function UpdateMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Tea",
    prepMinutes: 15,
    isAvailable: true,
  });
  const [image, setImage] = useState(null);

  // Fetch menu items
  const fetchMenu = async () => {
    try {
      const res = await api.get("/menu", { headers: authHeader() });
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching menu:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Add menu item (multipart/form-data)
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (image) data.append("image", image);

      await api.post("/menu", data, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Tea",
        prepMinutes: 15,
        isAvailable: true,
      });
      setImage(null);
      fetchMenu();
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  // Update availability

  const toggleAvailability = async (id, current) => {
    try {
      await api.put(
        `/menu/${id}`,
        { isAvailable: !current },
        { headers: authHeader() }
      );

      setMenuItems((items) =>
        items.map((item) =>
          item._id === id ? { ...item, isAvailable: !current } : item
        )
      );
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu/${id}`, { headers: authHeader() });
      fetchMenu();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="space-y-2 mb-6 border p-4 rounded">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full"
          value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full"
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Price"
          className="border p-2 w-full"
          value={formData.price}
          onChange={(e) =>
            setFormData((p) => ({ ...p, price: e.target.value }))
          }
          required
        />
        <select
          className="border p-2 w-full"
          value={formData.category}
          onChange={(e) =>
            setFormData((p) => ({ ...p, category: e.target.value }))
          }
        >
          <option>Tea</option>
          <option>Coffee</option>
          <option>Shake</option>
          <option>Frezzers</option>
          <option>Pasta</option>
          <option>Sandwich</option>
          <option>Maggi</option>
          <option>Burger</option>
          <option>Pizza</option>
          <option>Quick Bites</option>
        </select>
        <input
          type="number"
          placeholder="Prep Minutes"
          className="border p-2 w-full"
          value={formData.prepMinutes}
          onChange={(e) =>
            setFormData((p) => ({ ...p, prepMinutes: e.target.value }))
          }
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        {image && <p className="text-sm text-gray-600 mt-1">{image.name}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Item
        </button>
      </form>

      {/* Menu List */}
      <h2 className="text-xl font-semibold mb-2">Menu Items</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <div
            key={item._id}
            className="border p-4 rounded flex flex-col gap-2"
          >
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="h-[45vh]" />
            )}
            <h3 className="font-bold">{item.name}</h3>
            <p>{item.description}</p>
            <p>₹{item.price}</p>
            <p>Category: {item.category}</p>
            <p>Prep: {item.prepMinutes} min</p>
            <p
              className={`font-semibold ${
                item.isAvailable ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.isAvailable ? "Available" : "Unavailable"}
            </p>
            <div className="flex gap-2">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => toggleAvailability(item._id, item.isAvailable)}
              >
                Toggle
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
