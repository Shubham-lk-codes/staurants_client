

// import { useEffect, useMemo, useRef, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { api } from '../lib/api'
// import { useCartStore } from '../store/cart'
// import ImageSlider from '../components/ImageSlider'

// function useQuery() {
//   return new URLSearchParams(useLocation().search)
// }

// export default function MenuPage() {
//   const [items, setItems] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [addedId, setAddedId] = useState(null) // ✅ animation ke liye

//   const query = useQuery()
//   const navigate = useNavigate()
//   const addItem = useCartStore((s) => s.addItem)
//   const setTableToken = useCartStore((s) => s.setTableToken)
//   const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))

//   const sectionRefs = useRef({})

//   useEffect(() => {
//     const token = query.get('table') || query.get('tableToken') || query.get('table_id')
//     if (token) {
//       setTableToken(token)
//       try { localStorage.setItem('tableToken', token) } catch {}
//       console.log('Saved table token from URL:', token)
//     }
//   }, [query, setTableToken])

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await api.get('/menu')
//         setItems(res.data)
//       } catch (e) {
//         setError('Failed to load menu')
//       } finally {
//         setLoading(false)
//       }
//     }
//     load()
//   }, [])

//   const grouped = useMemo(() => {
//     const by = items.reduce((acc, it) => {
//       acc[it.category] = acc[it.category] || []
//       acc[it.category].push(it)
//       return acc
//     }, {})
//     const order = ['Tea', 'Coffee', 'Shake', 'Frezzers','Pasta','Sandwich','Maggi','Burger','Pizza','Quick Bites']
//     return order.filter(c => by[c]?.length).map(c => ({ category: c, items: by[c] }))
//   }, [items])

//   if (loading) return <div className="min-h-screen flex items-center justify-center text-orange-500">Loading...</div>
//   if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

//   const scrollToCategory = (cat) => {
//     const ref = sectionRefs.current[cat]
//     if (ref) {
//       ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
//     }
//   }

//   const handleAddToCart = (item) => {
//     addItem(item)
//     setAddedId(item._id)
//     setTimeout(() => setAddedId(null), 1200) // ✅ 1.2s baad normal ho jayega
//   }

//   return (
//     <div className="min-h-screen bg-black text-white ">
//       {/* Header */}
//       <header className="sticky top-0 z-10 bg-black border-b border-orange-500 shadow-md">
//         <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
//           <div className="flex items-center gap-2">
//             <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
//               <img src="/images/logo.jpg" alt="Patrika Cafe" className="w-full h-full object-cover" />
//             </div>
//             <h1 className="text-xl font-bold text-orange-500">Patrika Cafe</h1>
//           </div>
//           <nav className="hidden md:flex gap-6 text-gray-300 font-medium">
//             <a href="#" className="hover:text-orange-400">Home</a>
//             <a href="#" className="hover:text-orange-400">Menu</a>
//             <a href="#" className="hover:text-orange-400">About</a>
//             <a href="#" className="hover:text-orange-400">Contact</a>
//           </nav>
//           <button
//             onClick={() => navigate('/cart')}
//             className="relative px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition"
//           >
//             Cart
//             {cartCount > 0 && (
//               <span className="ml-2 inline-flex items-center justify-center text-sm bg-black text-orange-500 rounded-full px-2">
//                 {cartCount}
//               </span>
//             )}
//           </button>
//           {/* <div>
//             <h1>track Your Order</h1>
//           </div> */}
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="bg-black">
//         <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center p-8 md:py-16 gap-6">
//           <div className="space-y-4 text-center md:text-left">
//             <h2 className="text-4xl md:text-5xl font-bold leading-tight">
//               Welcome to <span className="text-orange-500">Patrika Cafe</span>
//             </h2>
//             <p className="text-gray-300 max-w-md mx-auto md:mx-0">
//               Freshly brewed coffee, delicious snacks and meals — crafted with love for you.
//             </p>
//             {/* ✅ Order Now button hata diya */}
//           </div>
//           <div className="flex justify-center">
           
//             <ImageSlider className="rounded-3xl shadow-2xl relative w-full h-[55vh] object-cover" />
//           </div>
//         </div>
//       </section>

//       {/* Category Tabs */}
//       <div className="sticky top-[64px] z-10 bg-black border-b border-orange-500 overflow-x-auto shadow-md">
//         <div className="max-w-6xl mx-auto flex gap-4 p-3 text-sm font-medium">
//           {grouped.map(group => (
//             <button
//               key={group.category}
//               onClick={() => scrollToCategory(group.category)}
//               className="px-4 py-2 rounded-full bg-orange-500/20 hover:bg-orange-500 hover:text-black transition"
//             >
//               {group.category}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Menu Section */}
//       <main className="max-w-6xl mx-auto p-6 space-y-12">
//         {grouped.map(group => (
//           <section
//             key={group.category}
//             ref={(el) => (sectionRefs.current[group.category] = el)}
//           >
//             <h2 className="text-3xl font-bold mb-6 text-orange-500">{group.category}</h2>
//             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
//               {group.items.map(it => (
//                 <div
//                   key={it._id}
//                   className="border border-orange-500 rounded-2xl p-6 shadow-lg hover:shadow-orange-500/40 transition hover:-translate-y-1 bg-black"
//                 >
//                   <div className="flex flex-col items-center text-center">
//                     {it.imageUrl ? (
//                       <img
//                         src={it.imageUrl}
//                         alt={it.name}
//                         className="w-44 h-44 object-cover rounded-2xl mb-3 shadow-md hover:scale-105 transition"
//                       />
//                     ) : (
//                       <div className="w-44 h-44 bg-gray-800 rounded-2xl mb-3" />
//                     )}
//                     <h3 className="font-semibold text-xl text-white ">{it.name}</h3>
//                     <p className="text-sm text-gray-400 mt-1">{it.description}</p>
//                     <div className="mt-2 font-medium text-orange-500 text-lg">₹{it.price}</div>
                    
//                     {/* ✅ Add to Cart with animation */}
//                     <button
//                       onClick={() => handleAddToCart(it)}
//                       className={`mt-4 px-6 py-2 rounded-full font-medium transition transform
//                         ${addedId === it._id 
//                           ? 'bg-green-500 text-white scale-110' 
//                           : 'bg-orange-500 text-black hover:bg-orange-600'}`}
//                     >
//                       {addedId === it._id ? 'Added ✓' : 'Add to Cart'}
//                     </button>

//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         ))}
//       </main>

//       {/* Footer */}
//       <footer className="bg-black border-t border-orange-500 mt-12">
//         <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 p-8 text-center md:text-left">
//           <div>
//             <h3 className="font-bold text-lg text-orange-500">Patrika Cafe</h3>
//             <p className="text-sm text-gray-400 mt-2">
//               Freshly brewed happiness in every sip & bite.
//             </p>
//           </div>
//           <div>
//             <h4 className="font-semibold text-white">Company</h4>
//             <ul className="mt-2 space-y-1 text-sm text-gray-400">
//               <li>Home</li>
//               <li>Menu</li>
//               <li>About</li>
//               <li>Contact</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="font-semibold text-white">Contact</h4>
//             <p className="text-sm text-gray-400 mt-2">+91 12345 67890</p>
//             <div className="flex justify-center md:justify-start gap-3 mt-3">
//               <span className="w-8 h-8 bg-orange-500 rounded-full" />
//               <span className="w-8 h-8 bg-orange-600 rounded-full" />
//               <span className="w-8 h-8 bg-orange-700 rounded-full" />
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useCartStore } from '../store/cart'
import ImageSlider from '../components/ImageSlider'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function MenuPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedId, setAddedId] = useState(null)

  const query = useQuery()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const setTableToken = useCartStore((s) => s.setTableToken)
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))

  const sectionRefs = useRef({})

  useEffect(() => {
    const token = query.get('table') || query.get('tableToken') || query.get('table_id')
    if (token) {
      setTableToken(token)
      try { localStorage.setItem('tableToken', token) } catch {}
      console.log('Saved table token from URL:', token)
    }
  }, [query, setTableToken])

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/menu')
        setItems(res.data)
      } catch (e) {
        setError('Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const by = items.reduce((acc, it) => {
      acc[it.category] = acc[it.category] || []
      acc[it.category].push(it)
      return acc
    }, {})
    const order = ['Tea', 'Coffee', 'Shake', 'Frezzers','Pasta','Sandwich','Maggi','Burger','Pizza','Quick Bites']
    return order.filter(c => by[c]?.length).map(c => ({ category: c, items: by[c] }))
  }, [items])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-orange-500">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  const scrollToCategory = (cat) => {
    const ref = sectionRefs.current[cat]
    if (ref) {
      // ✅ Instant jump (no smooth scrolling)
      ref.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
  }

  const handleAddToCart = (item) => {
    addItem(item)
    setAddedId(item._id)
    setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div className="min-h-screen bg-black text-white ">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black border-b border-orange-500 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/images/logo.jpg" alt="Patrika Cafe" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold text-orange-500">Patrika Cafe</h1>
          </div>
          <nav className="hidden md:flex gap-6 text-gray-300 font-medium">
            <a href="#" className="hover:text-orange-400">Home</a>
            <a href="#" className="hover:text-orange-400">Menu</a>
            <a href="#" className="hover:text-orange-400">About</a>
            <a href="#" className="hover:text-orange-400">Contact</a>
          </nav>
          <button
            onClick={() => navigate('/cart')}
            className="relative px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            Cart
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-sm bg-black text-orange-500 rounded-full px-2">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center p-8 md:py-16 gap-6">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome to <span className="text-orange-500">Patrika Cafe</span>
            </h2>
            <p className="text-gray-300 max-w-md mx-auto md:mx-0">
              Freshly brewed coffee, delicious snacks and meals — crafted with love for you.
            </p>
          </div>
          <div className="flex justify-center">
            <ImageSlider className="rounded-3xl shadow-2xl relative w-full h-[55vh] object-cover" />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="sticky top-[64px] z-10 bg-black border-b border-orange-500 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 p-3 text-sm font-medium justify-center">
          {grouped.map(group => (
            <button
              key={group.category}
              onClick={() => scrollToCategory(group.category)}
              className="px-4 py-2 rounded-full bg-orange-500/20 hover:bg-orange-500 hover:text-black transition"
            >
              {group.category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Section */}
      <main className="max-w-6xl mx-auto p-6 space-y-12">
        {grouped.map(group => (
          <section
            key={group.category}
            ref={(el) => (sectionRefs.current[group.category] = el)}
            className="scroll-mt-32"   // ✅ Fix: Heading ab sticky navbar ke niche clear dikhengi
          >
            <h2 className="text-3xl font-bold mb-6 text-orange-500">{group.category}</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map(it => (
                <div
                  key={it._id}
                  className="border border-orange-500 rounded-2xl p-6 shadow-lg hover:shadow-orange-500/40 transition hover:-translate-y-1 bg-black"
                >
                  <div className="flex flex-col items-center text-center">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="w-44 h-44 object-cover rounded-2xl mb-3 shadow-md hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-44 h-44 bg-gray-800 rounded-2xl mb-3" />
                    )}
                    <h3 className="font-semibold text-xl text-white ">{it.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{it.description}</p>
                    <div className="mt-2 font-medium text-orange-500 text-lg">₹{it.price}</div>
                    
                    {/* ✅ Add to Cart with animation */}
                    <button
                      onClick={() => handleAddToCart(it)}
                      className={`mt-4 px-6 py-2 rounded-full font-medium transition transform
                        ${addedId === it._id 
                          ? 'bg-green-500 text-white scale-110' 
                          : 'bg-orange-500 text-black hover:bg-orange-600'}`}
                    >
                      {addedId === it._id ? 'Added ✓' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-orange-500 mt-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 p-8 text-center md:text-left">
          <div>
            <h3 className="font-bold text-lg text-orange-500">Patrika Cafe</h3>
            <p className="text-sm text-gray-400 mt-2">
              Freshly brewed happiness in every sip & bite.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Company</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>Home</li>
              <li>Menu</li>
              <li>About</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <p className="text-sm text-gray-400 mt-2">+91 12345 67890</p>
            <div className="flex justify-center md:justify-start gap-3 mt-3">
              <span className="w-8 h-8 bg-orange-500 rounded-full" />
              <span className="w-8 h-8 bg-orange-600 rounded-full" />
              <span className="w-8 h-8 bg-orange-700 rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

