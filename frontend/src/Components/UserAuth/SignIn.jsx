import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/Auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FcGoogle } from 'react-icons/fc';

const SignIn = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();
  const { isDark } = useTheme();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center px-4 ${isDark
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
          <div className={`${isDark
              ? 'bg-black/40 backdrop-blur-xl border border-white/10'
              : 'bg-white/80 backdrop-blur-xl border border-black/10'
            } rounded-2xl p-8`}
          >
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}
              >
                Welcome Back
              </motion.h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Sign in to continue to Shivalik Service Hub
              </p>
            </div>

            {/* Google Sign-In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 ${isDark
                  ? 'bg-white text-gray-800 hover:bg-gray-100'
                  : 'bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-200'
                }`}
            >
              <FcGoogle className="text-2xl" />
              <span>Continue with Google</span>
            </motion.button>

            {/* Divider */}
            <div className="relative my-8">
              <div className={`absolute inset-0 flex items-center`}>
                <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${isDark ? 'bg-black/40 text-gray-400' : 'bg-white/80 text-gray-500'}`}>
                  Secure authentication with Google
                </span>
              </div>
            </div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-center space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <p className="text-sm">
                🔒 Your data is protected with Google's secure authentication
              </p>
              <p className="text-xs">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-rose-500 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-rose-500 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
