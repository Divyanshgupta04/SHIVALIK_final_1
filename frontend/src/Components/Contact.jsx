import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiMail, FiPhone, FiMapPin, FiClock, FiFileText, FiShield, FiRefreshCw } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import SEO from './SEO'

function Contact() {
  const { isDark } = useTheme()

  const contactInfo = [
    {
      icon: <FiPhone className="text-xl" />,
      title: "Phone",
      value: "+91 7889588384",
      link: "tel:+917889588384"
    },
    {
      icon: <FiMail className="text-xl" />,
      title: "Email",
      value: "sshubjk@gmail.com",
      link: "mailto:sshubjk@gmail.com"
    },
    {
      icon: <FiMapPin className="text-xl" />,
      title: "Address",
      value: "Main Bazar, Rajouri, Jammu & Kashmir - 185131",
      link: "https://maps.google.com/?q=Main+Bazar+Rajouri+Jammu+Kashmir"
    },
    {
      icon: <FiClock className="text-xl" />,
      title: "Support Hours",
      value: "8:00 AM – 9:00 PM (GMT +5:30)",
      link: null
    }
  ]

  const policyLinks = [
    { title: "Terms & Conditions", to: "/terms", icon: <FiFileText /> },
    { title: "Refund Policy", to: "/refund-policy", icon: <FiRefreshCw /> },
    { title: "Privacy Policy", to: "/privacy-policy", icon: <FiShield /> }
  ]

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100 text-gray-900'}`}>
      <SEO
        title="Contact Us"
        description="Get in touch with Shivalik Service Hub for any queries regarding our digital services, PAN card applications, or ordred products."
        keywords="contact shivalik service hub, customer support, rajouri service center"
      />

      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold mb-4">Contact Us</h1>
          <div className={`w-24 h-1 mx-auto rounded-full ${isDark ? 'bg-red-500' : 'bg-blue-600'}`}></div>
          <p className={`mt-6 text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Have a question or need assistance? Our team is here to help you. Reach out to us through any of the channels below.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-blue-100 shadow-lg'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    {info.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{info.title}</h3>
                  {info.link ? (
                    <a href={info.link} className={`text-sm break-words hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {info.value}
                    </a>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {info.value}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Legal Policies Section - Critically important for Compliance */}
            <div className={`p-8 rounded-3xl border ${isDark ? 'bg-gradient-to-br from-blue-900/20 to-transparent border-white/10' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-md'}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiShield className="text-blue-500" />
                Legal Policies
              </h3>
              <div className="grid gap-4">
                {policyLinks.map((policy, idx) => (
                  <Link
                    key={idx}
                    to={policy.to}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${isDark ? 'bg-black/30 hover:bg-black/50 text-gray-300' : 'bg-white hover:bg-blue-50 text-gray-700 border border-blue-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      {policy.icon}
                      <span className="font-medium">{policy.title}</span>
                    </div>
                    <span className="text-xs uppercase tracking-wider opacity-60">View Details</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Simple Message UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-8 rounded-3xl border h-full flex flex-col justify-center text-center ${isDark ? 'bg-slate-800/40 border-white/10' : 'bg-white border-blue-100 shadow-xl'}`}
          >
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
              <FiPhone className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Direct Support</h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              For immediate assistance regarding orders or services, please contact us directly via Phone or WhatsApp. Our support team is available during business hours.
            </p>
            <a
              href="tel:+917889588384"
              className={`w-full py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'}`}
            >
              Call Support Now
            </a>
            <p className="mt-6 text-xs text-gray-500">
              Registered Office: SHIVALIK SERVICES HUB, Main Bazar, Rajouri, J&K
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact
