import React from 'react';
import { motion } from 'framer-motion';

const SubCategoryCard = ({ subCategory, onClick, isDark }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`cursor-pointer group relative rounded-3xl overflow-hidden aspect-[4/3] border transition-all duration-500 ${isDark
                    ? 'bg-gray-900/40 border-white/5 hover:border-violet-500/30'
                    : 'bg-white border-gray-100 hover:border-violet-200 shadow-sm hover:shadow-xl'
                }`}
        >
            {/* Image Placeholder/Background */}
            <div className="absolute inset-0 w-full h-full">
                {subCategory.imageDataUrl ? (
                    <img
                        src={subCategory.imageDataUrl}
                        alt={subCategory.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-violet-600/10' : 'bg-violet-50'}`}>
                        <span className="text-4xl font-black text-violet-500/20">{subCategory.name[0]}</span>
                    </div>
                )}
                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${isDark
                        ? 'from-black/90 via-black/40 to-transparent group-hover:opacity-80'
                        : 'from-black/60 via-black/20 to-transparent group-hover:opacity-40'
                    }`} />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-white text-xl font-black tracking-tight group-hover:text-violet-400 transition-colors">
                    {subCategory.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-12 bg-violet-600 rounded-full group-hover:w-20 transition-all duration-500" />
                </div>
            </div>
        </motion.div>
    );
};

export default SubCategoryCard;
