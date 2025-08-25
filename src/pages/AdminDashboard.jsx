import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../lib/api";
import UpdateMenu from "../components/UpdateMenu";
import HistoryOfOrders from "../components/HistoryOfOrders";
import AdminTables from "./AdminTables";
import CreateOfflineOrder from "../components/CreateOfflineOrder"; // ✅ नया COD component placeholder

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef(null);
  const [activeTab, setActiveTab] = useState("orders");

  function playBeep() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      o.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await api.get("/orders?includeServed=true", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        // ✅ अब सिर्फ served हटाओ, pending वाले भी दिखेंगे
        setOrders(
          Array.isArray(res.data)
            ? res.data.filter((o) => o.status !== "served")
            : []
        );
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("admin_token");
        }
        console.error("Failed to fetch orders:", err);
      }
    }
    load();

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ??
      (import.meta.env.DEV
        ? "http://localhost:5000"
        : "https://staurants-server.onrender.com");

    const socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("order:new", (order) => {
      if (order.status !== "served") {
        setOrders((prev) => [...prev, order]);
      }
      if (soundOn) playBeep();
      if (Notification?.permission === "granted") {
        new Notification(`New order - Table ${order?.table?.number ?? "—"}`);
      }
    });

    socket.on("order:update", (incoming) => {
      if (incoming.status === "served") {
        setOrders((prev) => prev.filter((o) => o._id !== incoming._id));
      } else {
        setOrders((prev) =>
          prev.some((o) => o._id === incoming._id)
            ? prev.map((o) =>
                o._id === incoming._id ? { ...o, ...incoming } : o
              )
            : [...prev, incoming]
        );
      }
    });

    socket.on("order:archive", ({ id }) => {
      setOrders((prev) => prev.filter((o) => o._id !== id));
    });

    return () => socket.disconnect();
  }, [soundOn]);

  async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem("admin_token");
      await api.put(
        `/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (status === "served") {
        setOrders((prev) => prev.filter((o) => o._id !== id));
      } else {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function enableSound() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    setSoundOn(true);
    requestNotificationPermission();
  }

  return (
    <div className="flex bg-black min-h-screen">
      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-orange-500 to-orange-700 
                text-white shadow-xl flex flex-col z-50"
      >
        <div className="px-6 py-5 font-extrabold text-2xl tracking-wide border-b border-orange-400/50 drop-shadow-md flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Patrika Logo"
            className="h-20 w-20 rounded-full shadow-md border-2 border-white"
          />
          <span className="text-white drop-shadow-md uppercase">Patrika Cafe</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "orders"
                ? "bg-white text-orange-600 font-semibold"
                : "hover:bg-orange-400/30"
            }`}
          >
            Orders
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "menu"
                ? "bg-white text-orange-600 font-semibold"
                : "hover:bg-orange-400/30"
            }`}
          >
            Update Menu Items
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "history"
                ? "bg-white text-orange-600 font-semibold"
                : "hover:bg-orange-400/30"
            }`}
          >
            History of Orders
          </button>

          <button
            onClick={() => setActiveTab("addTable")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "addTable"
                ? "bg-white text-orange-600 font-semibold"
                : "hover:bg-orange-400/30"
            }`}
          >
            Add Table
          </button>

          {/* ✅ नया option - Create COD */}
          <button
            onClick={() => setActiveTab("cod")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "cod"
                ? "bg-white text-orange-600 font-semibold"
                : "hover:bg-orange-400/30"
            }`}
          >
            Create Cash on Delivery
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6 bg-orange-50">
        {activeTab === "orders" ? (
          // ....... बाकी तेरे पुराने वाला orders का code untouched रहेगा
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
              <div className="flex items-center gap-2">
                {!soundOn ? (
                  <button
                    onClick={enableSound}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white shadow hover:bg-orange-700 transition"
                  >
                    🔔 Enable Sound
                  </button>
                ) : (
                  <span className="text-sm text-green-700 font-medium">
                    Sound: ON
                  </span>
                )}
              </div>
            </div>

            {/* Orders grid same as पहले */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500">
                  No orders yet
                </div>
              ) : (
                orders.map((o) => (
                  // order card code unchanged
                  <div
                    key={o._id}
                    className="bg-white rounded-xl shadow hover:shadow-md transition p-5 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg">
                        Table {o.table?.number || "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleTimeString()
                          : "—"}
                      </div>
                    </div>

                    <div className="mt-2 text-right text-sm font-semibold text-gray-800">
                      Total: ₹
                      {(o.items || []).reduce(
                        (sum, it) => sum + it.quantity * (it.item?.price || 0),
                        0
                      )}
                    </div>

                    <ul className="mt-3 text-sm text-gray-700 space-y-1">
                      {(o.items || []).map((it, idx) => (
                        <li key={it.item?._id || idx}>
                          {it.quantity} × {it.item?.name || "Unknown"} — ₹
                          {it.item?.price || 0}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex items-center justify-between">
                      <div
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          o.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : o.status === "preparing"
                            ? "bg-blue-100 text-blue-700"
                            : o.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : o.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {o.status || "unknown"}
                      </div>

                      <div className="flex gap-2">
                        {o.status !== "preparing" && (
                          <button
                            onClick={() => updateStatus(o._id, "preparing")}
                            className="px-3 py-1 rounded-md text-xs border border-orange-500 text-orange-600 hover:bg-orange-50 transition"
                          >
                            Preparing
                          </button>
                        )}
                        {o.status !== "ready" && (
                          <button
                            onClick={() => updateStatus(o._id, "ready")}
                            className="px-3 py-1 rounded-md text-xs border border-orange-500 text-orange-600 hover:bg-orange-50 transition"
                          >
                            Ready
                          </button>
                        )}
                        {o.status !== "served" && (
                          <button
                            onClick={() => updateStatus(o._id, "served")}
                            className="px-3 py-1 rounded-md text-xs border border-orange-500 text-orange-600 hover:bg-orange-50 transition"
                          >
                            Served
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === "menu" ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Update Menu Items
            </h1>
            <UpdateMenu />
          </div>
        ) : activeTab === "history" ? (
          <div>
            <HistoryOfOrders />
          </div>
        ) : activeTab === "addTable" ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Table</h1>
            <AdminTables />
          </div>
        ) : activeTab === "cod" ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Create Cash on Delivery
            </h1>
            {/* ✅ Placeholder for component */}
            <CreateOfflineOrder />

            <h2 className="text-xl font-bold mt-8 mb-4 text-gray-700">
              Paid Orders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.filter((o) => o.paid).length === 0 ? (
                <div className="col-span-3 text-center text-gray-500">
                  No paid orders yet
                </div>
              ) : (
                orders
                  .filter((o) => o.paid)
                  .sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // ✅ latest पहले
                  )
                  .map((o) => (
                    <div
                      key={o._id}
                      className="bg-white rounded-xl shadow hover:shadow-md transition p-5 border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-lg">
                          Table {o.table?.number || "—"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleTimeString()
                            : "—"}
                        </div>
                      </div>

                      <div className="mt-2 text-right text-sm font-semibold text-gray-800">
                        Total: ₹
                        {(o.items || []).reduce(
                          (sum, it) =>
                            sum + it.quantity * (it.item?.price || 0),
                          0
                        )}
                      </div>

                      <ul className="mt-3 text-sm text-gray-700 space-y-1">
                        {(o.items || []).map((it, idx) => (
                          <li key={it.item?._id || idx}>
                            {it.quantity} × {it.item?.name || "Unknown"} — ₹
                            {it.item?.price || 0}
                          </li>
                        ))}
                      </ul>

                      {/* ✅ Status remove नहीं किया */}
                      <div
                        className={`mt-3 inline-block text-xs px-2 py-1 rounded-full font-medium ${
                          o.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : o.status === "preparing"
                            ? "bg-blue-100 text-blue-700"
                            : o.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : o.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {o.status || "unknown"}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}




