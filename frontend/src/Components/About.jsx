import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiCheckCircle, FiClock, FiMapPin, FiPhone } from 'react-icons/fi'
import { FaFacebook, FaInstagram } from 'react-icons/fa'
import worldMap from '../assets/worldmap.png'

import SEO from './SEO'

function About() {
  const { isDark } = useTheme()

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const values = [
    { icon: '✅', title: 'Dependability', desc: 'You can always count on us to deliver what we promise.' },
    { icon: '🎯', title: 'Customer-first service', desc: 'Your satisfaction drives everything we do.' },
    { icon: '✨', title: 'Uniqueness', desc: 'Every service is designed to bring value, ease, and joy into your life.' }
  ]

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, color: '#1877F2', link: '#' },
    { name: 'Instagram', icon: FaInstagram, color: '#E4405F', link: '#' }
  ]

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
      }`}>
      <SEO
        title="About Us"
        description="Learn about Shivalik Service Hub, a leading digital service provider in India. We offer reliable PAN card services, online solutions, and customer-first support."
        keywords="about shivalik service hub, our story, trusted service provider, digital india partners, jammu business"
      />
      <div className="container mx-auto px-6 sm:px-8 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className={`text-5xl sm:text-6xl font-extrabold mb-4 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            About us
          </h1>
          <div className={`w-24 h-1 mx-auto rounded-full ${isDark ? 'bg-red-500' : 'bg-blue-600'
            }`}></div>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          {...fadeInUp}
          className={`max-w-4xl mx-auto mb-16 p-8 rounded-2xl ${isDark
            ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10'
            : 'bg-white/80 border border-blue-100 shadow-xl'
            } backdrop-blur-sm`}
        >
          <h2 className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
            ✨ About Us
          </h2>
          <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Welcome to <span className="font-bold">Shivalik Services Hub</span>, your one-stop destination for quality, convenience, and care.
            We're more than just a service provider — we're a team driven by the desire to make your everyday needs easier, faster, and more enjoyable.
          </p>
        </motion.div>

        {/* Values Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className={`text-2xl sm:text-3xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            At Shivalik Services Hub, we believe in three things:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${isDark
                  ? 'bg-slate-800/60 border border-white/10 hover:bg-slate-700/60'
                  : 'bg-white border border-blue-100 shadow-lg hover:shadow-xl'
                  }`}
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                  {value.title}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`max-w-4xl mx-auto mb-16 p-8 rounded-2xl ${isDark
            ? 'bg-gradient-to-r from-red-900/30 to-blue-900/30 border border-white/10'
            : 'bg-gradient-to-r from-blue-100/50 to-indigo-100/50 border border-blue-200'
            }`}
        >
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
            From the moment we started, our goal has been simple — to combine quality services with modern convenience. That's why we've gone digital, allowing you to explore, order, and connect with us right from your home. No more waiting or confusion — just smooth, simple service at your fingertips.
          </p>
        </motion.div>

        {/* Location & Timing Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className={`text-2xl sm:text-3xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            We're all around the globe
          </h3>

          {/* World Map Section */}
          <div className={`max-w-5xl mx-auto mb-12 p-8 rounded-2xl relative overflow-hidden ${isDark
            ? 'bg-slate-900/60 border border-white/10'
            : 'bg-white border border-gray-200 shadow-lg'
            }`}>
            <div className="relative w-full" style={{ paddingBottom: '50%' }}>
              {/* World Map Background Image */}
              <div
                className="absolute inset-0 bg-center bg-no-repeat bg-contain"
                style={{
                  backgroundImage: `url(${worldMap})`,
                  opacity: isDark ? 0.6 : 0.4,
                  zIndex: 1
                }}
              />

              {/* Location Marker - Positioned for North India (Jammu & Kashmir) */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute"
                style={{ left: '65%', top: '32%', zIndex: 10 }}
              >
                {/* Multiple pulsing circle effects for glow */}
                <div className="relative">
                  {/* Outer glow - slowest */}
                  <div className={`absolute w-20 h-20 rounded-full animate-ping ${isDark ? 'bg-red-500/20' : 'bg-red-500/30'
                    }`} style={{ top: '-10px', left: '-10px', animationDuration: '2s' }}></div>

                  {/* Middle glow */}
                  <div className={`absolute w-16 h-16 rounded-full animate-ping ${isDark ? 'bg-red-500/30' : 'bg-red-500/40'
                    }`} style={{ top: '-8px', left: '-8px', animationDuration: '1.5s' }}></div>

                  {/* Inner glow - fastest */}
                  <div className={`absolute w-12 h-12 rounded-full animate-ping ${isDark ? 'bg-red-500/40' : 'bg-red-500/50'
                    }`} style={{ top: '-6px', left: '-6px', animationDuration: '1s' }}></div>

                  {/* Static glow ring */}
                  <div className={`absolute w-14 h-14 rounded-full blur-sm ${isDark ? 'bg-red-500/50' : 'bg-red-500/60'
                    }`} style={{ top: '-7px', left: '-7px' }}></div>

                  {/* Location pin/marker */}
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-2xl ${isDark ? 'bg-red-600' : 'bg-red-500'
                    }`} style={{
                      boxShadow: isDark
                        ? '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4)'
                        : '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
                    }}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-inner"></div>
                  </div>
                </div>

                {/* Info card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className={`absolute left-12 top-0 w-56 p-4 rounded-xl shadow-xl whitespace-nowrap ${isDark
                    ? 'bg-slate-800 border border-white/20'
                    : 'bg-white border border-gray-200'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      {/* Indian Flag */}
                      <div className="w-full h-full">
                        <div className="h-1/3 bg-orange-500"></div>
                        <div className="h-1/3 bg-white flex items-center justify-center">
                          <div className="w-2 h-2 border border-blue-600 rounded-full"></div>
                        </div>
                        <div className="h-1/3 bg-green-600"></div>
                      </div>
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>Main Bazar</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Rajouri,<br />
                        Jammu & Kashmir - 185131
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Support/Location */}
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl text-center ${isDark
                ? 'bg-slate-800/60 border border-white/10'
                : 'bg-white border border-blue-100 shadow-lg'
                }`}
            >
              <FiMapPin className={`text-4xl mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                Support
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Main Bazar<br />
                Rajouri, Jammu & Kashmir - 185131
              </p>
            </motion.div>

            {/* Sales/Timing */}
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl text-center ${isDark
                ? 'bg-slate-800/60 border border-white/10'
                : 'bg-white border border-blue-100 shadow-lg'
                }`}
            >
              <FiClock className={`text-4xl mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                Sales
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                🕗 Timings<br />
                8:00 AM – 9:00 PM
              </p>
            </motion.div>

            {/* Phone */}
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl text-center ${isDark
                ? 'bg-slate-800/60 border border-white/10'
                : 'bg-white border border-blue-100 shadow-lg'
                }`}
            >
              <FiPhone className={`text-4xl mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                Phone
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                📦 Delivering To:<br />
                All Locations
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Community Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className={`text-2xl sm:text-3xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            Join our community of travelers
          </h3>
          <p className={`text-center mb-10 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Connect with us on social media to get exclusive updates, special offers, and join a vibrant community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon
              return (
                <motion.a
                  key={idx}
                  href={social.link}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`p-8 rounded-2xl text-center transition-all duration-300 cursor-pointer ${isDark
                    ? 'bg-slate-800/60 border border-white/10 hover:bg-slate-700/80'
                    : 'bg-white border border-blue-100 shadow-lg hover:shadow-xl'
                    }`}
                >
                  <Icon
                    className="text-6xl mx-auto mb-4"
                    style={{ color: social.color }}
                  />
                  <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    {social.name}
                  </h4>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    Join our {social.name} community to stay connected and get the latest updates.
                  </p>
                  <button className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                    Join now →
                  </button>
                </motion.a>
              )
            })}
          </div>
        </motion.div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`max-w-3xl mx-auto text-center p-8 rounded-2xl ${isDark
            ? 'bg-gradient-to-br from-blue-900/30 to-red-900/30 border border-white/10'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
            }`}
        >
          <p className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
            At Shivalik, you're not just a customer — you're part of our community.
          </p>
          <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
            We're here to listen, assist, and grow together with you. So, if you ever need us — whether it's a quick inquiry, an order, or feedback — we're always just a click away.
          </p>
          <p className={`mt-4 font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
            📞 Connect With Us: Your convenience is our priority — reach out anytime!
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default About
