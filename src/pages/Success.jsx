


import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md text-center space-y-6 bg-[#1a1a1a] px-8 py-10 rounded-2xl shadow-lg border border-orange-500"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.jpg"
            alt="Patrika Cafe"
            className="h-16 w-16 rounded-full border-2 border-orange-500 shadow-md"
          />
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ rotate: -15, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          className="text-5xl"
        >
          ✅
        </motion.div>

        <h1 className="text-2xl font-bold text-orange-500">
          Order placed successfully!
        </h1>

        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Thank you for ordering with <span className="text-orange-400">Patrika Café</span>.<br />
          We’ll start preparing your food shortly ☕🍽️
        </p>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Link
            to="/menu"
            className="inline-block w-full sm:w-auto px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-black font-semibold shadow-md"
          >
            Back to Menu
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
