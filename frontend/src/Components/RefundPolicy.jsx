import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiRefreshCw, FiXCircle, FiClock, FiCheckCircle, FiAlertTriangle, FiPhone, FiFileText } from 'react-icons/fi'
import SEO from './SEO'

function RefundPolicy() {
    const { isDark } = useTheme()

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    const sections = [
        {
            icon: <FiAlertTriangle className="text-2xl" />,
            title: 'Cancellation & Refund Policy',
            content: `SHIVALIK SERVICES HUB believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:`
        },
        {
            icon: <FiXCircle className="text-2xl" />,
            title: 'Cancellations',
            content: `• Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.\n• SHIVALIK SERVICES HUB does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.`
        },
        {
            icon: <FiRefreshCw className="text-2xl" />,
            title: 'Damaged or Defective Items',
            content: `• In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within Only same day days of receipt of the products.\n• In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within Only same day days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.`
        },
        {
            icon: <FiCheckCircle className="text-2xl" />,
            title: 'Warranty & Refunds',
            content: `• In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.\n• In case of any Refunds approved by the SHIVALIK SERVICES HUB, it’ll take 6-8 Days days for the refund to be processed to the end customer.`
        }
    ]

    return (
        <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
            }`}>
            <SEO
                title="Refund Policy"
                description="Read the Refund and Cancellation Policy for Shivalik Service Hub. Learn about refund eligibility, non-refundable services, refund process, and timelines."
                keywords="refund policy, cancellation policy, shivalik service hub refunds, return policy, money back"
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
                        Cancellation & Refund
                    </h1>
                    <div className={`w-24 h-1 mx-auto rounded-full ${isDark ? 'bg-red-500' : 'bg-blue-600'
                        }`}></div>
                    <p className={`mt-6 text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Our liberal cancellation and refund policy is designed to help our customers as much as possible.
                    </p>
                </motion.div>

                {/* Last Updated */}
                <motion.div
                    {...fadeInUp}
                    className={`max-w-4xl mx-auto mb-8 px-6 py-3 rounded-xl text-center text-sm ${isDark
                        ? 'bg-slate-800/60 border border-white/10 text-gray-400'
                        : 'bg-white/80 border border-blue-100 text-gray-500 shadow-md'
                        }`}
                >
                    <FiFileText className="inline mr-2" />
                    Last Updated: 17-02-2026 02:42:28
                </motion.div>

                {/* Policy Sections */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            className={`p-6 sm:p-8 rounded-2xl transition-all duration-300 ${isDark
                                ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 hover:border-white/20'
                                : 'bg-white/80 border border-blue-100 shadow-lg hover:shadow-xl'
                                } backdrop-blur-sm`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {section.icon}
                                </div>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {section.title}
                                </h2>
                            </div>
                            <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className={`max-w-3xl mx-auto text-center mt-12 p-8 rounded-2xl ${isDark
                        ? 'bg-gradient-to-br from-blue-900/30 to-red-900/30 border border-white/10'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
                        }`}
                >
                    <p className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                        Your satisfaction matters to us!
                    </p>
                    <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        If you have any questions regarding cancellations or refunds, please reach out to our Customer Service team.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default RefundPolicy
