import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FiFileText } from 'react-icons/fi'
import SEO from './SEO'

function TermsAndConditions() {
    const { isDark } = useTheme()

    return (
        <div className={`min-h-screen w-full transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <SEO
                title="Terms and Conditions"
                description="Terms and Conditions for SHIVALIK SERVICES HUB."
            />
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 md:p-12 rounded-3xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200 shadow-2xl'}`}
                >
                    <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
                    <p className="text-sm text-gray-500 mb-8 flex items-center gap-2">
                        <FiFileText /> Last updated on 17-02-2026 02:51:06
                    </p>

                    <div className={`prose max-w-none ${isDark ? 'prose-invert text-gray-300' : 'text-gray-700'} space-y-6 leading-relaxed`}>
                        <p>
                            These Terms and Conditions, along with privacy policy or other terms (“Terms”) constitute a binding agreement by and between SHIVALIK SERVICES HUB, ( “Website Owner” or “we” or “us” or “our”) and you (“you” or “your”) and relate to your use of our website, goods (as applicable) or services (as applicable) (collectively, “Services”).
                        </p>

                        <p>
                            By using our website and availing the Services, you agree that you have read and accepted these Terms (including the Privacy Policy). We reserve the right to modify these Terms at any time and without assigning any reason. It is your responsibility to periodically review these Terms to stay informed of updates.
                        </p>

                        <p className="font-semibold">The use of this website or availing of our Services is subject to the following terms of use:</p>

                        <ul className="list-disc pl-6 space-y-4">
                            <li>To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account.</li>
                            <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
                            <li>Your use of our Services and the website is solely at your own risk and discretion. You are required to independently assess and ensure that the Services meet your requirements.</li>
                            <li>The contents of the Website and the Services are proprietary to Us and you will not have any authority to claim any intellectual property rights, title, or interest in its contents.</li>
                            <li>You acknowledge that unauthorized use of the Website or the Services may lead to action against you as per these Terms or applicable laws.</li>
                            <li>You agree to pay us the charges associated with availing the Services.</li>
                            <li>You agree not to use the website and/ or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.</li>
                            <li>You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites.</li>
                            <li>You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the us for the Services.</li>
                            <li>You shall be entitled to claim a refund of the payment made by you in case we are not able to provide the Service. The timelines for such return and refund will be according to the specific Service you have availed or within the time period provided in our policies (as applicable). In case you do not raise a refund claim within the stipulated time, than this would make you ineligible for a refund.</li>
                            <li>Notwithstanding anything contained in these Terms, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event.</li>
                            <li>These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India.</li>
                            <li>All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Khajmola, Jammu and Kashmir.</li>
                            <li>All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website.</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default TermsAndConditions
