import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    // Load wishlist from localStorage on initial render
    useEffect(() => {
        try {
            const savedWishlist = localStorage.getItem('wishlist');
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist));
            }
        } catch (error) {
            console.error('Failed to load wishlist from localStorage:', error);
            setWishlist([]);
        }
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.error('Failed to save wishlist to localStorage:', error);
        }
    }, [wishlist]);

    const addToWishlist = useCallback((product) => {
        const isAlreadyInWishlist = wishlist.some((item) => String(item.id) === String(product.id));
        if (isAlreadyInWishlist) return;

        setWishlist((prevWishlist) => [...prevWishlist, product]);

        toast.success(`${product.title} added to wishlist!`, {
            icon: '❤️',
            style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
            },
        });
    }, [wishlist]);

    const removeFromWishlist = useCallback((productId) => {
        const productToRemove = wishlist.find((item) => String(item.id) === String(productId));
        if (!productToRemove) return;

        setWishlist((prevWishlist) => prevWishlist.filter((item) => String(item.id) !== String(productId)));

        toast.success(`${productToRemove.title} removed from wishlist`, {
            icon: '💔',
            style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
            },
        });
    }, [wishlist]);

    const toggleWishlist = useCallback((product) => {
        const isAlreadyInWishlist = wishlist.some((item) => String(item.id) === String(product.id));

        if (isAlreadyInWishlist) {
            setWishlist((prevWishlist) => prevWishlist.filter((item) => String(item.id) !== String(product.id)));
            toast.success(`${product.title} removed from wishlist`, {
                icon: '💔',
                style: {
                    borderRadius: '12px',
                    background: '#333',
                    color: '#fff',
                },
            });
        } else {
            setWishlist((prevWishlist) => [...prevWishlist, product]);
            toast.success(`${product.title} added to wishlist!`, {
                icon: '❤️',
                style: {
                    borderRadius: '12px',
                    background: '#333',
                    color: '#fff',
                },
            });
        }
    }, [wishlist]);

    const isInWishlist = useCallback((productId) => {
        return wishlist.some((item) => String(item.id) === String(productId));
    }, [wishlist]);

    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
