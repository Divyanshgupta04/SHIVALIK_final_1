import React, { useContext, useMemo } from 'react'
import { ProductsData } from '../context/Context'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function Products() {
  const { product, HandleClickAdd, loading } = useContext(ProductsData)
  const { isDark } = useTheme()

  const newArrivals = useMemo(() => {
    if (!product?.length) return []
    const toNum = (v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    const sorted = [...product].sort((a, b) => toNum(a.id) - toNum(b.id))
    return sorted.slice(-6)
  }, [product])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <motion.h1
          className={`text-4xl sm:text-5xl font-extrabold mb-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Products
        </motion.h1>

        {loading ? (
          <div className="py-16 text-center text-lg opacity-80">Loading products...</div>
        ) : (
          <>
            {/* New Arrivals */}
            {newArrivals.length > 0 && (
              <section className="mb-12">
                <h2 className={`text-2xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>New Arrivals</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newArrivals.map((item, index) => (
                    <motion.div
                      key={`new-${item.id}`}
                      className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'} group rounded-2xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img src={item.src} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">NEW</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>{item.description}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`${isDark ? 'text-blue-300' : 'text-blue-700'} font-bold text-xl`}>₹{item.price}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/product/${item.id}`}
                            className={`${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium`}
                          >
                            View Details
                          </Link>
                          <div className="flex gap-2">
                            <button onClick={() => HandleClickAdd(item.id)} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Add to Cart</button>
                            <Link to="/checkout" className={`${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium`}>Buy Now</Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* All Products */}
            <section>
              <h2 className={`text-2xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>All Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {product.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'} group rounded-2xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.src} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>{item.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`${isDark ? 'text-blue-300' : 'text-blue-700'} font-bold text-xl`}>₹{item.price}</span>
                        <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm line-through`}>₹{Math.floor(Number(item.price) * 1.2)}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/product/${item.id}`}
                          className={`${isDark ? 'bg-gray-800 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium`}
                        >
                          View Details
                        </Link>
                        <div className="flex gap-2">
                          <button onClick={() => HandleClickAdd(item.id)} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Add to Cart</button>
                          <Link to="/checkout" className={`${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium`}>Buy Now</Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Products