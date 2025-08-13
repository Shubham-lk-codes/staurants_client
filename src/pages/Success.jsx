import { Link } from 'react-router-dom'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="text-3xl">✅</div>
        <h1 className="text-xl font-semibold">Order placed successfully!</h1>
        <p className="text-gray-600">We will start preparing your food shortly.</p>
        <Link to="/menu" className="inline-block px-4 py-2 rounded-md bg-emerald-600 text-white">Back to Menu</Link>
      </div>
    </div>
  )
}


