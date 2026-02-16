import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiFileText, FiShield, FiAlertCircle, FiLock, FiPhone, FiGlobe } from 'react-icons/fi'
import SEO from './SEO'

function TermsAndConditions() {
    const { isDark } = useTheme()

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    const termsContent = [
        {
            title: "Agreement to Terms",
            content: "These Terms and Conditions, along with privacy policy or other terms (“Terms”) constitute a binding agreement by and between SHIVALIK SERVICES HUB, ( “Website Owner” or “we” or “us” or “our”) and you (“you” or “your”) and relate to your use of our website, goods (as applicable) or services (as applicable) (collectively, “Services”)."
        },
        {
            title: "Acceptance",
            content: "By using our website and availing the Services, you agree that you have read and accepted these Terms (including the Privacy Policy). We reserve the right to modify these Terms at any time and without assigning any reason. It is your responsibility to periodically review these Terms to stay informed of updates."
        },
        {
            title: "Terms of Use",
            content: "The use of this website or availing of our Services is subject to the following terms of use:\n\n• To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account.\n• Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.\n• Your use of our Services and the website is solely at your own risk and discretion. You are required to independently assess and ensure that the Services meet your requirements.\n• The contents of the Website and the Services are proprietary to Us and you will not have any authority to claim any intellectual property rights, title, or interest in its contents.\n• You acknowledge that unauthorized use of the Website or the Services may lead to action against you as per these Terms or applicable laws.\n• You agree to pay us the charges associated with availing the Services.\n• You agree not to use the website and/ or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.\n• You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites.\n• You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the us for the Services."
        },
        {
            title: "Refunds & Claims",
            content: "You shall be entitled to claim a refund of the payment made by you in case we are not able to provide the Service. The timelines for such return and refund will be according to the specific Service you have availed or within the time period provided in our policies (as applicable). In case you do not raise a refund claim within the stipulated time, than this would make you ineligible for a refund."
        },
        {
            title: "Force Majeure",
            content: "Notwithstanding anything contained in these Terms, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event."
        },
        {
            title: "Governing Law",
            content: "These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India."
        },
        {
            title: "Jurisdiction",
            content: "All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Khajmola, Jammu and Kashmir"
        },
        {
            title: "Contact Information",
            content: "All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website."
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
                        Please read these terms carefully. These terms constitute a binding agreement between you and SHIVALIK SERVICES HUB.
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
                    Last Updated: 27-01-2026 21:13:37
                </motion.div>

                {/* Terms Sections */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {termsContent.map((section, idx) => (
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
                                    {idx % 2 === 0 ? <FiShield /> : <FiLock />}
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
                        Thank you for using Shivalik!
                    </p>
                    <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        By using our services, you confirm that you have read and agree to these Terms and Conditions.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default TermsAndConditions
