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
            icon: <FiFileText className="text-2xl" />,
            title: '1. Overview',
            content: `At Shivalik Service Hub, customer satisfaction is our top priority. We understand that sometimes things may not go as expected, and we are committed to making things right. This Refund & Cancellation Policy outlines the conditions under which refunds and cancellations are applicable for the services and products offered through our website.

Please read this policy carefully before making a purchase or availing any service.`
        },
        {
            icon: <FiCheckCircle className="text-2xl" />,
            title: '2. Eligibility for Refund',
            content: `You may be eligible for a refund under the following circumstances:

• Duplicate Payment: If you have been charged multiple times for the same order/service due to a technical error.
• Service Not Delivered: If you paid for a service but the service was not initiated or delivered by us within the promised timeframe.
• Incorrect Service: If you received a service or product that is materially different from what was described or ordered.
• Order Cancelled Before Processing: If you cancel your order before we have started processing it.
• Defective or Damaged Product: If you receive a physical product that is defective, damaged, or not as described.

To be eligible for a refund, you must contact us within 7 days of the transaction or delivery.`
        },
        {
            icon: <FiXCircle className="text-2xl" />,
            title: '3. Non-Refundable Items & Services',
            content: `The following items and services are NOT eligible for refund:

• PAN Card Processing Fees: Once your PAN card application has been submitted to the government portal (NSDL/UTIITSL), the processing fee is non-refundable, as the government charges are non-recoverable.
• Government Fees: Any fees paid to government authorities as part of the service facilitation are non-refundable.
• Services Already Rendered: If the service has been fully delivered and completed as per the order specifications.
• Digital Products Downloaded: Digital products that have been accessed or downloaded after purchase.
• Customized Orders: Products or services that were customized as per your specifications.
• Partially Used Services: Services that have been partially consumed or utilized.

Note: If your PAN card application is rejected by the government authority due to incorrect information provided by you, no refund will be issued for the processing fee.`
        },
        {
            icon: <FiRefreshCw className="text-2xl" />,
            title: '4. Refund Process',
            content: `To request a refund, please follow these steps:

Step 1: Contact our support team via phone (7889588384), WhatsApp, or email (sshubjk@gmail.com) with your order details and reason for refund.

Step 2: Provide the following information:
   • Order ID / Transaction ID
   • Date of purchase
   • Reason for refund request
   • Supporting documents (screenshots, photos, etc.) if applicable

Step 3: Our team will review your request within 2–3 business days and notify you of the approval or rejection of your refund.

Step 4: If approved, the refund will be processed to your original payment method.`
        },
        {
            icon: <FiClock className="text-2xl" />,
            title: '5. Refund Timeline',
            content: `Once your refund has been approved:

• UPI / Wallet Payments: Refund will be credited within 3–5 business days.
• Credit / Debit Card: Refund will be credited within 5–7 business days.
• Net Banking: Refund will be credited within 5–10 business days.
• Cash on Delivery: Refund will be processed via bank transfer within 7–10 business days (bank details will be requested).

Please note that the actual time for the refund to reflect in your account may vary depending on your bank or payment provider. Shivalik Service Hub is not responsible for any delays caused by banks or payment gateways.`
        },
        {
            icon: <FiAlertTriangle className="text-2xl" />,
            title: '6. Cancellation Policy',
            content: `• Before Processing: You may cancel your order at any time before we begin processing it. A full refund will be issued in this case.
• After Processing Begins: Once the service processing has started (e.g., PAN application submitted, product shipped), the order cannot be cancelled. Applicable refund terms from Sections 2 and 3 will apply.
• Auto-Cancellation: If we are unable to fulfill your order due to stock unavailability, service disruption, or other reasons, we will automatically cancel the order and issue a full refund.
• Subscription Services (if applicable): Subscriptions can be cancelled before the next billing cycle. No refund will be issued for the current billing period.`
        },
        {
            icon: <FiRefreshCw className="text-2xl" />,
            title: '7. Exchange & Replacement',
            content: `• For physical products that are defective or damaged upon delivery, we offer a replacement or exchange within 7 days of delivery.
• To request a replacement, contact us with photos of the damaged product and your order details.
• Replacement is subject to product availability. If the product is not available, a full refund will be issued instead.
• Return shipping for defective products will be arranged by us at no additional cost to you.`
        },
        {
            icon: <FiPhone className="text-2xl" />,
            title: '8. Contact Us for Refunds',
            content: `For any refund-related queries or to initiate a refund request, please contact us through any of the following channels:

📍 Address: Main Bazar, Rajouri, Jammu & Kashmir – 185131
📞 Phone: 7889588384
💬 WhatsApp: 7889588384
📧 Email: sshubjk@gmail.com
🕗 Support Hours: 8:00 AM – 9:00 PM (Monday – Saturday)

We aim to resolve all refund requests within 48 hours of receiving them.`
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
                        Refund Policy
                    </h1>
                    <div className={`w-24 h-1 mx-auto rounded-full ${isDark ? 'bg-red-500' : 'bg-blue-600'
                        }`}></div>
                    <p className={`mt-6 text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        We want you to be completely satisfied with our services. Please review our refund and cancellation policy below.
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

                {/* Important Notice */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`max-w-4xl mx-auto mb-8 p-6 rounded-2xl ${isDark
                        ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/20'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <FiAlertTriangle className={`text-2xl flex-shrink-0 mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <div>
                            <h3 className={`font-bold mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                Important Notice
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-yellow-200/80' : 'text-yellow-700'}`}>
                                PAN card processing fees are non-refundable once the application has been submitted to the government portal. Please ensure all your details and documents are correct before submission.
                            </p>
                        </div>
                    </div>
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
                        If you're not happy with your purchase or service, don't hesitate to reach out. We're here to help and ensure you have the best experience with Shivalik Service Hub.
                    </p>
                    <p className={`mt-4 font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                        📞 Contact us anytime: 7889588384
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default RefundPolicy
