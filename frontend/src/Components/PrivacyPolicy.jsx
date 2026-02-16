import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiShield, FiLock, FiEye, FiDatabase, FiFileText } from 'react-icons/fi'
import SEO from './SEO'

function PrivacyPolicy() {
    const { isDark } = useTheme()

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    const sections = [
        {
            icon: <FiEye />,
            title: "Information We Collect",
            content: "We collect information you provide directly to us when you create an account, apply for a PAN card, or make a purchase. This may include your name, email address, phone number, physical address, and government-issued identification details necessary for service processing."
        },
        {
            icon: <FiDatabase />,
            title: "How We Use Your Information",
            content: "We use the information we collect to:\n• Provide, maintain, and improve our services\n• Process your transactions and applications\n• Send you technical notices, updates, and support messages\n• Respond to your comments and questions\n• Comply with legal obligations"
        },
        {
            icon: <FiLock />,
            title: "Data Security",
            content: "We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential."
        },
        {
            icon: <FiShield />,
            title: "Third-Party Disclosure",
            content: "We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information except to provide the service (e.g., submitting PAN applications to government portals) or as required by law."
        },
        {
            icon: <FiFileText />,
            title: "Cookies",
            content: "We use cookies to help us remember and process the items in your shopping cart and understand and save your preferences for future visits."
        }
    ]

    return (
        <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
            }`}>
            <SEO
                title="Privacy Policy"
                description="Learn about how Shivalik Service Hub collects, uses, and protects your personal data."
                keywords="privacy policy, data protection, shivalik service hub privacy"
            />
            <div className="container mx-auto px-6 sm:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className={`text-5xl sm:text-6xl font-extrabold mb-4 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        Privacy Policy
                    </h1>
                    <div className={`w-24 h-1 mx-auto rounded-full ${isDark ? 'bg-red-500' : 'bg-blue-600'
                        }`}></div>
                    <p className={`mt-6 text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Your privacy is important to us. This policy explains how we handle your personal information.
                    </p>
                </motion.div>

                <motion.div
                    {...fadeInUp}
                    className={`max-w-4xl mx-auto mb-8 px-6 py-3 rounded-xl text-center text-sm ${isDark
                        ? 'bg-slate-800/60 border border-white/10 text-gray-400'
                        : 'bg-white/80 border border-blue-100 text-gray-500 shadow-md'
                        }`}
                >
                    <FiFileText className="inline mr-2" />
                    Last Updated: 27-01-2026
                </motion.div>

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
            </div>
        </div>
    )
}

export default PrivacyPolicy
