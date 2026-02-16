import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiFileText, FiShield, FiAlertCircle, FiLock, FiPhone } from 'react-icons/fi'
import SEO from './SEO'

function TermsAndConditions() {
    const { isDark } = useTheme()

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    const sections = [
        {
            icon: <FiFileText className="text-2xl" />,
            title: '1. Acceptance of Terms',
            content: `By accessing and using the Shivalik Service Hub website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website or services. We reserve the right to update or modify these terms at any time without prior notice. Your continued use of the website after any changes constitutes your acceptance of the new terms.`
        },
        {
            icon: <FiShield className="text-2xl" />,
            title: '2. Services Description',
            content: `Shivalik Service Hub provides a range of digital and offline services including but not limited to:
• PAN Card Application & Processing Services (New PAN, Correction, Reprint, Minor PAN, etc.)
• Digital products and services
• Online ordering and delivery of various products
• Document processing and facilitation services

All services are subject to availability and may be modified or discontinued at our discretion. We act as a facilitator and service provider — government-related services (such as PAN card issuance) are ultimately processed by the respective government authorities.`
        },
        {
            icon: <FiAlertCircle className="text-2xl" />,
            title: '3. User Accounts & Responsibilities',
            content: `When you create an account on our platform, you are responsible for:
• Providing accurate, current, and complete information during registration
• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Notifying us immediately of any unauthorized use of your account

We reserve the right to suspend or terminate accounts that violate these terms, provide false information, or engage in fraudulent activity.`
        },
        {
            icon: <FiFileText className="text-2xl" />,
            title: '4. Ordering, Payment & Pricing',
            content: `• All prices displayed on our website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.
• We reserve the right to change prices at any time without prior notice.
• Payment must be made in full at the time of placing an order through the available payment methods (UPI, Credit/Debit Card, Net Banking, Wallet, etc.).
• Once an order is placed and payment is confirmed, a confirmation will be sent to your registered email/mobile.
• We are not responsible for any payment failures due to issues with your bank, payment gateway, or internet connectivity.
• Orders are subject to acceptance and availability. We may cancel any order at our discretion and issue a full refund in such cases.`
        },
        {
            icon: <FiShield className="text-2xl" />,
            title: '5. PAN Card Services — Special Terms',
            content: `• PAN card services offered through Shivalik Service Hub are facilitation services. We assist you in submitting your application to the relevant government authority (NSDL/UTIITSL).
• We are not responsible for the approval, rejection, or processing time of PAN applications by government authorities.
• It is your responsibility to provide accurate and valid documents. Any rejection due to incorrect or fraudulent documents is solely your responsibility.
• Service fees paid for PAN card processing are non-refundable once the application has been submitted to the government portal.
• Estimated delivery timelines are approximate and depend on the government authority's processing schedule.`
        },
        {
            icon: <FiLock className="text-2xl" />,
            title: '6. Intellectual Property',
            content: `All content on this website — including text, graphics, logos, images, audio, video, software, and design — is the property of Shivalik Service Hub and is protected by Indian and international copyright, trademark, and intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content on this website without our prior written consent.`
        },
        {
            icon: <FiAlertCircle className="text-2xl" />,
            title: '7. Limitation of Liability',
            content: `To the maximum extent permitted by applicable law:
• Shivalik Service Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
• We do not guarantee uninterrupted or error-free operation of the website.
• Our total liability for any claim arising from these terms or use of services shall not exceed the amount paid by you for the specific service in question.
• We are not responsible for delays or failures caused by circumstances beyond our control, including natural disasters, government actions, internet outages, or third-party service failures.`
        },
        {
            icon: <FiLock className="text-2xl" />,
            title: '8. Privacy & Data Protection',
            content: `We are committed to protecting your personal information. By using our services, you consent to the collection, storage, and processing of your personal data as described in our Privacy Policy. We use your data solely for providing and improving our services, processing orders, and communicating with you. We do not sell your personal information to third parties. For detailed information on how we handle your data, please refer to our Privacy Policy.`
        },
        {
            icon: <FiFileText className="text-2xl" />,
            title: '9. Governing Law & Dispute Resolution',
            content: `These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Rajouri, Jammu & Kashmir, India. We encourage you to contact us first to resolve any disputes amicably before pursuing legal action.`
        },
        {
            icon: <FiPhone className="text-2xl" />,
            title: '10. Contact Us',
            content: `If you have any questions, concerns, or feedback regarding these Terms and Conditions, please contact us:

📍 Address: Main Bazar, Rajouri, Jammu & Kashmir – 185131
📞 Phone: 7889588384
📧 Email: sshubjk@gmail.com
🕗 Business Hours: 8:00 AM – 9:00 PM`
        }
    ]

    return (
        <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
            }`}>
            <SEO
                title="Terms and Conditions"
                description="Read the Terms and Conditions for Shivalik Service Hub. Learn about our service policies, user responsibilities, payment terms, and legal guidelines."
                keywords="terms and conditions, shivalik service hub terms, service agreement, user policy, legal terms"
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
                        Terms & Conditions
                    </h1>
                    <div className={`w-24 h-1 mx-auto rounded-full ${isDark ? 'bg-red-500' : 'bg-blue-600'
                        }`}></div>
                    <p className={`mt-6 text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Please read these terms carefully before using our services. By using our website, you agree to comply with and be bound by the following terms.
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
                    Last Updated: February 16, 2026
                </motion.div>

                {/* Terms Sections */}
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
                        Thank you for choosing Shivalik Service Hub!
                    </p>
                    <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        By using our services, you confirm that you have read and agree to these Terms and Conditions. If you have any questions, feel free to reach out to us anytime.
                    </p>
                    <p className={`mt-4 font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                        📞 We're just a call away: 7889588384
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default TermsAndConditions
