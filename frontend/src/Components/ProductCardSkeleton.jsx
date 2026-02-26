import React from 'react';

const ProductCardSkeleton = ({ isDark, count = 8 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`relative flex flex-col h-full rounded-2xl overflow-hidden ${isDark
                            ? 'bg-gray-900/40 border border-white/5'
                            : 'bg-white border border-gray-100'
                        }`}
                >
                    {/* Image skeleton */}
                    <div className={`aspect-[4/5] ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className="w-full h-full animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    </div>

                    {/* Content skeleton */}
                    <div className="p-5 flex flex-col flex-grow space-y-3">
                        {/* Title */}
                        <div className={`h-5 rounded-lg w-3/4 animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />

                        {/* Price */}
                        <div className="flex items-center gap-2">
                            <div className={`h-6 rounded-lg w-20 animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            <div className={`h-4 rounded-lg w-12 animate-pulse ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`} />
                        </div>

                        {/* Stars */}
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className={`w-3.5 h-3.5 rounded-full animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="mt-auto space-y-2.5 pt-2">
                            <div className={`h-11 rounded-xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            <div className={`h-11 rounded-xl animate-pulse ${isDark ? 'bg-gray-800/60' : 'bg-gray-100'}`} />
                        </div>
                    </div>
                </div>
            ))}

            <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </>
    );
};

export default ProductCardSkeleton;
