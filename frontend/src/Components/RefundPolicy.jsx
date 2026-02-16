import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiRefreshCw } from 'react-icons/fi'
import SEO from './SEO'

function RefundPolicy() {
    const { isDark } = useTheme()

    return (
        <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <SEO
                title="Cancellation & Refund Policy"
                description="Cancellation and Refund Policy for SHIVALIK SERVICES HUB."
            />
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 md:p-12 rounded-3xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200 shadow-2xl'}`}
                >
                    <h1 className="text-4xl font-bold mb-2">Cancellation & Refund Policy</h1>
                    <p className="text-sm text-gray-500 mb-8 flex items-center gap-2">
                        <FiRefreshCw /> Last updated on 17-02-2026 02:51:28
                    </p>

                    <div className={`prose max-w-none ${isDark ? 'prose-invert text-gray-300' : 'text-gray-700'} space-y-6 leading-relaxed`}>
                        <p>
                            SHIVALIK SERVICES HUB believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
                        </p>

                        <ul className="list-disc pl-6 space-y-4">
                            <li>Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.</li>
                            <li>SHIVALIK SERVICES HUB does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.</li>
                            <li>In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within Only same day days of receipt of the products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within Only same day days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.</li>
                            <li>In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them. In case of any Refunds approved by the SHIVALIK SERVICES HUB, it’ll take 6-8 Days days for the refund to be processed to the end customer.</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default RefundPolicy
