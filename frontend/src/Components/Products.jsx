import React, { useContext, useMemo } from 'react'
import { ProductsData } from '../context/Context'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProductCard from "./ProductCard";

function Products() {
  const { product, HandleClickAdd, loading } = useContext(ProductsData)
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const handleBuyNow = (item) => {
    if (item.isInsurance) {
      window.open('https://advisor.turtlemintinsurance.com/profile/284308/SHIVALIK_SERVICES_HUB_NEAR_SBI_RAJOURI', '_blank');
    } else {
      navigate('/checkout', { state: { buyNowItem: item } });
    }
  };

  const newArrivals = useMemo(() => {
    if (!product?.length) return []
    const toNum = (v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    const sorted = [...product].sort((a, b) => toNum(a.id) - toNum(b.id))
    return sorted.slice(-6).map(p => ({ ...p, isNew: true }));
  }, [product])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <motion.div
          className="flex flex-col mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-violet-500 font-bold tracking-widest uppercase text-xs mb-2">Our Marketplace</span>
          <h1 className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Premium <span className="text-violet-600">Services</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="py-16 text-center text-lg opacity-80">Loading products...</div>
        ) : (
          <>
            {/* New Arrivals */}
            {newArrivals.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Arrivals</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newArrivals.map((item, index) => (
                    <ProductCard
                      key={`new-${item.id}`}
                      item={item}
                      index={index}
                      isDark={isDark}
                      onAddToCart={HandleClickAdd}
                      onBuyNow={handleBuyNow}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Products */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Products</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {product.map((item, index) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    index={index}
                    isDark={isDark}
                    onAddToCart={HandleClickAdd}
                    onBuyNow={handleBuyNow}
                  />
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