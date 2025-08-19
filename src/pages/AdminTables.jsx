

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminTables() {
  const [number, setNumber] = useState('')
  const [tables, setTables] = useState([])
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(false)

  const api = axios.create({ baseURL: '/api' })

  const token = localStorage.getItem('admin_token')
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

  useEffect(() => {
    fetchTables()
  }, [])

  async function fetchTables() {
    try {
      const res = await api.get('/admin/tables')
      setTables(res.data || [])
    } catch (err) {
      console.error('fetchTables error', err)
      setTables([])
    }
  }

  async function createTable(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await api.post('/admin/tables', { number: Number(number) })
      setNumber('')
      await fetchTables()
      if (res.data?._id) fetchQR(res.data._id)
    } catch (err) {
      console.error('createTable error', err)
      alert(err?.response?.data?.message || 'Failed to create table')
    } finally {
      setLoading(false)
    }
  }

  async function fetchQR(tableId) {
    try {
      const res = await api.get(`/admin/tables/${tableId}/qr`)
      setQr(res.data)
    } catch (err) {
      console.error('fetchQR error', err)
      alert('Failed to fetch QR')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-emerald-700 text-center">
        Admin Panel — Tables & QR
      </h2>

      {/* Form */}
      <form
        onSubmit={createTable}
        className="mb-8 flex flex-col sm:flex-row gap-3 items-center"
      >
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter Table Number"
          className="flex-1 border-2 border-gray-300 focus:border-emerald-500 p-3 rounded-lg shadow-sm outline-none transition"
        />
        <button
          disabled={loading}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg shadow-md transition-transform hover:scale-105"
        >
          {loading ? 'Creating...' : 'Create Table'}
        </button>
      </form>

      {/* Tables List */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg text-gray-700 mb-3">Available Tables</h3>
        <ul className="space-y-3">
          {Array.isArray(tables) && tables.length ? (
            tables.map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="font-medium text-gray-700">
                  Table #{t.number}{' '}
                  <span className="text-xs text-gray-500 ml-2">({t.token})</span>
                </div>
                <div>
                  <button
                    onClick={() => fetchQR(t._id)}
                    className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white shadow transition-transform hover:scale-105"
                  >
                    Get QR
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic">No tables created yet</li>
          )}
        </ul>
      </div>

      {/* QR Preview */}
      {qr && (
        <div className="border p-6 rounded-xl bg-gray-50 shadow-md text-center">
          <h4 className="font-semibold mb-4 text-gray-700 text-lg">Generated QR</h4>
          <img
            src={qr.dataUrl}
            alt="table-qr"
            className="max-w-xs mx-auto rounded-lg shadow"
          />
          <div className="mt-4 space-y-2">
            <a
              className="block text-emerald-600 hover:text-emerald-700 underline"
              href={qr.dataUrl}
              download={`qr.png`}
            >
              Download QR
            </a>
            <div className="text-sm text-gray-600">
              URL:{' '}
              <a
                className="text-blue-600 underline"
                href={qr.url}
                target="_blank"
                rel="noreferrer"
              >
                {qr.url}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
