import React, { useMemo, useState, useEffect } from 'react'
import Show from './Show'
import Partner from '../assets/Partner.jpg'
import Pan from '../assets/Pan.jpg'
import In from '../assets/Insurance.jpg'
import service from '../assets/service.jpg'
import Tax from '../assets/tax.jpg'
import land from '../assets/land.jpg'
import certi from '../assets/Car.jpg'
import li from '../assets/li.jpg'
import { useTheme } from '../context/ThemeContext'
import { useCatalog } from '../context/CatalogContext'
import { slugifyName } from '../utils/slug'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'
import config from '../config/api'

function Hero() {
  const { isDark } = useTheme()
  const { categories: catalogCategories } = useCatalog()

  const [apiCategories, setApiCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Local fallback images for when imageUrl is a local path
  const localImages = {
    '/src/assets/Partner.jpg': Partner,
    '/src/assets/Pan.jpg': Pan,
    '/src/assets/Insurance.jpg': In,
    '/src/assets/service.jpg': service,
    '/src/assets/tax.jpg': Tax,
    '/src/assets/land.jpg': land,
    '/src/assets/Car.jpg': certi,
    '/src/assets/li.jpg': li
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const categories = useMemo(() => {
    // Merge DB categories + AdminCatalog (localStorage) categories.
    // Prefer DB data if slug conflicts.
    const map = new Map()

    for (const c of apiCategories || []) {
      if (!c?.slug) continue
      map.set(c.slug, c)
    }

    for (const c of catalogCategories || []) {
      const slug = slugifyName(c?.name || '')
      if (!slug) continue
      if (map.has(slug)) continue

      map.set(slug, {
        id: c.id,
        slug,
        name: c.name,
        img: c.imageDataUrl || '',
      })
    }

    return Array.from(map.values())
  }, [apiCategories, catalogCategories])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from API...')
      const res = await axios.get(`${config.apiUrl}/api/categories`)
      console.log('API Response:', res.data)
      if (res.data.success) {
        // Map categories from database
        const dbCategories = res.data.categories.map(cat => ({
          ...cat,
          // Use local images for local paths, or use the imageUrl directly for external URLs
          img: localImages[cat.imageUrl] || cat.imageUrl || ''
        }))
        console.log('Mapped categories:', dbCategories)
        setApiCategories(dbCategories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      <div className='container mx-auto px-6 sm:px-8 py-10'>
        <motion.h1 
          className={`text-4xl sm:text-5xl font-extrabold mb-8 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Categories
        </motion.h1>

        {loading ? (
          <div className="py-16 text-center text-lg opacity-80">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center opacity-80">No categories available.</div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {categories.map((c, idx) => (
              <Link key={c.slug} to={`/category/${c.slug}`}>
                <motion.div
                  className={`${isDark 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-black/40' 
                    : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-blue-100'} 
                    group rounded-2xl p-4 flex flex-col items-center overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * idx }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                    {c.img ? (
                      <img
                        src={c.img}
                        alt={c.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'} text-xs`}>
                        No Image
                      </div>
                    )}
                  </div>
                  <div className={`mt-3 text-center text-sm sm:text-base font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    {c.name}
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}

      </div>

      {/* Keep the rest of the page content as before */}
      <Show />
    </div>
  )
}

export default Hero
