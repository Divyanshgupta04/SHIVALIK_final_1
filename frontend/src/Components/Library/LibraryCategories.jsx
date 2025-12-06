import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import config from '../../config/api';

function LibraryCategories() {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${config.apiUrl}/api/library/categories`);
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Library Categories
          </h1>
          <Link
            to="/"
            className={`text-sm ${
              isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-lg opacity-80">Loading library categories...</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center opacity-80">No library categories found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link key={cat.slug} to={`/library/${cat.slug}`}>
                <motion.div
                  className={`${isDark
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10'
                    : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'} group rounded-2xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative h-40 overflow-hidden">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{cat.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryCategories;
