import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/Auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiMail, FiUser, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

const SignIn = () => {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp, authStep, resendOTP, resetAuth } = useAuth();
  const { isDark } = useTheme();
  
  const [form, setForm] = useState({
    name: '',
    email: ''
  });
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const otpInputRef = useRef(null);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await requestOtp(form);
    // If success, authStep switches to 'otp' by context
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 5) {
      return;
    }
    
    setLoading(true);
    
    const result = await verifyOtp(otp);
    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    await resendOTP();
    setResendLoading(false);
  };

  const handleBackToForm = () => {
    resetAuth();
    setOtp('');
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center px-4 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
        : 'bg-gradient-to-br from-slate-100 via-sky-100 to-rose-100'
    }`}>
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-red-500/40 to-fuchsia-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-500/40 to-indigo-500/40 blur-3xl" />

      {/* Card with gradient border */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-red-500/60 via-rose-500/40 to-cyan-500/60 shadow-2xl">
          <div className={`${
            isDark
              ? 'bg-black/40 backdrop-blur-xl border border-white/10'
              : 'bg-white/80 backdrop-blur-xl border border-black/10'
          } rounded-2xl p-8`}
          >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            {authStep === 'form' ? 'Sign In' : 'Verify OTP'}
          </motion.h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {authStep === 'form' 
              ? 'Continue with your name and email'
              : `Enter the 5-digit code sent to ${form.email}`
            }
          </p>
        </div>

        {authStep === 'form' ? (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="relative group">
                <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className={`w-full pl-10 pr-4 py-3 ${isDark ? 'text-white placeholder-gray-400' : 'text-black'} border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-white'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition shadow-sm`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative group">
                <FiMail className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className={`w-full pl-10 pr-4 py-3 ${isDark ? 'text-white placeholder-gray-400' : 'text-black'} border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-white'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition shadow-sm`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-rose-500 hover:to-red-500 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className={`block text-sm font-medium mb-2 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Verification Code
              </label>
              {/* Styled OTP input with visual boxes */}
              <div
                className={`relative cursor-text rounded-2xl p-3 border ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                }`}
                onClick={() => otpInputRef.current?.focus()}
              >
                <input
                  ref={otpInputRef}
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="absolute inset-0 w-full h-full opacity-0"
                  inputMode="numeric"
                  autoFocus
                  maxLength={5}
                />
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 rounded-xl flex items-center justify-center text-2xl font-mono ${
                        isDark ? 'bg-black/40 text-white border border-white/10' : 'bg-gray-50 text-gray-800 border border-gray-200'
                      }`}
                    >
                      {otp[i] ? otp[i] : ''}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="flex items-center gap-2 text-rose-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                <FiRefreshCw className={`${resendLoading ? 'animate-spin' : ''}`} />
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              type="submit"
              disabled={loading || otp.length !== 5}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-rose-500 hover:to-red-500 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              type="button"
              onClick={handleBackToForm}
              className={`w-full flex items-center justify-center gap-2 py-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <FiArrowLeft />
              Back to Login
            </motion.button>
          </form>
        )}

        
          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400">
            By continuing, you agree to our
            <Link to="/terms" className="mx-1 text-rose-500 hover:underline"> Terms</Link>
            and
            <Link to="/privacy" className="mx-1 text-rose-500 hover:underline"> Privacy Policy</Link>.
          </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
