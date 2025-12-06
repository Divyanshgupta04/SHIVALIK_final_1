import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import config from '../../config/api';

function LibraryBookDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${config.apiUrl}/api/library/books/${id}`);
        if (isMounted && res.data?.success) {
          setBook(res.data.book);
        }
      } catch (e) {
        if (isMounted) setError('Failed to load book details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  const bgClass = isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {book?.title || 'Library Book'}
          </h1>
          <div className="space-x-3 text-sm">
            {book?.category?.slug && (
              <Link
                to={`/library/${book.category.slug}`}
                className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                ← Back to Category
              </Link>
            )}
            <Link
              to="/library"
              className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
            >
              Library Home
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-lg opacity-80">Loading book...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">{error}</div>
        ) : !book ? (
          <div className="py-16 text-center opacity-80">Book not found.</div>
        ) : (
          <motion.div
            className={`${isDark
              ? 'bg-gradient-to-br from-slate-900 to-black border border-white/10'
              : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'} rounded-2xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.18)] grid grid-cols-1 lg:grid-cols-2`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative h-72 sm:h-96 lg:h-full overflow-hidden">
              {book.src ? (
                <img
                  src={book.src}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  No image available
                </div>
              )}
            </div>
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              {book.category?.name && (
                <span className={`${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'} text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full self-start`}>
                  {book.category.name}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">{book.title}</h2>
              {book.author && (
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>by {book.author}</p>
              )}
              {book.description && (
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-base leading-relaxed mt-2`}>
                  {book.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                {book.price ? (
                  <span className={`${isDark ? 'text-blue-300' : 'text-blue-700'} font-bold text-2xl`}>
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
        )}
      </div>
    </div>
  );
}

export default LibraryBookDetail;
