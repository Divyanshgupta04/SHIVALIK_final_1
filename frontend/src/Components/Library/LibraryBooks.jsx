import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import config from '../../config/api';

function LibraryBooks() {
  const { slug } = useParams();
  const { isDark } = useTheme();
  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        // Get category name
        const catRes = await axios.get(`${config.apiUrl}/api/library/categories`);
        if (catRes.data.success) {
          const found = catRes.data.categories.find(c => c.slug === slug);
          if (found && isMounted) setCategoryName(found.name);
        }
      } catch (_) {
        // ignore
      }

      try {
        const res = await axios.get(`${config.apiUrl}/api/library/books?category=${encodeURIComponent(slug)}`);
        if (res.data.success && isMounted) {
          setBooks(res.data.books || []);
        }
      } catch (_) {
        if (isMounted) setBooks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [slug]);

  const heading = categoryName || (slug || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {heading}
          </h1>
          <div className="space-x-3 text-sm">
            <Link to="/library" className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              ← Library Categories
            </Link>
            <Link to="/" className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              Home
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-lg opacity-80">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center opacity-80">No books found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => (
              <Link key={book.id || `${slug}-${index}`} to={`/product/${book.id}`}>
                <motion.div
                  className={`${isDark
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10'
                    : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'} group rounded-2xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {book.src ? (
                      <img
                        src={book.src}
                        alt={book.title || 'Book'}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{book.title || 'Book'}</h3>
                    {book.author && (
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-1`}>by {book.author}</p>
                    )}
                    {book.description && (
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>{book.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {book.price ? (
                        <span className={`${isDark ? 'text-blue-300' : 'text-blue-700'} font-bold text-xl`}>
                          ₹{book.price}
                        </span>
                      ) : (
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                          Contact for pricing
                        </span>
                      )}
                    </div>
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

export default LibraryBooks;
