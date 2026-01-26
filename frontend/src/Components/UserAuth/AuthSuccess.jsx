import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Auth/AuthContext';
import { motion } from 'framer-motion';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const { handleAuthSuccess } = useAuth();

    useEffect(() => {
        const completeAuth = async () => {
            const result = await handleAuthSuccess();
            if (result.success) {
                // Redirect to home page after successful authentication
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                // Redirect to signin on failure
                navigate('/signin');
            }
        };

        completeAuth();
    }, [handleAuthSuccess, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Completing Sign In...</h2>
                <p className="text-gray-400">Please wait while we set up your account</p>
            </motion.div>
        </div>
    );
};

export default AuthSuccess;
