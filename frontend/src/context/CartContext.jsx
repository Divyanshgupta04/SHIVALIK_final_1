import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './Auth/AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate item count whenever cart changes
  useEffect(() => {
    const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    setItemCount(count);
  }, [cart]);

  // Load cart when user auth state changes
  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    if (user) {
      // Load cart from server for authenticated users
      try {
        const response = await axios.get('/api/cart');
        if (response.data.success) {
          setCart(response.data.cart);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        // Keep local cart as fallback
      }
    } else {
      // Load cart from localStorage for non-authenticated users
      try {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error('Failed to load local cart:', error);
        setCart([]);
      }
    }
  };

  const saveLocalCart = (cartData) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save local cart:', error);
    }
  };

  const syncCartWithServer = async (localCart) => {
    if (!user) return;
    
    try {
      await axios.post('/api/cart/sync', { localCart });
      // Reload cart after sync
      loadCart();
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  };

  // Sync local cart with server when user logs in
  useEffect(() => {
    if (user && cart.length > 0) {
      // Only sync if we have items from local storage
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        const parsedLocalCart = JSON.parse(localCart);
        if (parsedLocalCart.length > 0) {
          syncCartWithServer(parsedLocalCart);
          // Clear local cart after sync
          localStorage.removeItem('cart');
        }
      }
    }
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    setLoading(true);

    // Derive productType for identity verification flow.
    // Priority: explicit product.productType -> guess from category/title -> default "both".
    const rawType = String(product?.productType || '').toLowerCase();
    const guessBase = `${String(product?.category || '')} ${String(product?.title || '')}`.toLowerCase();
    const inferredType =
      rawType === 'aadhaar' || rawType === 'pan' || rawType === 'both'
        ? rawType
        : guessBase.includes('pan')
          ? 'pan'
          : (guessBase.includes('aadhaar') || guessBase.includes('aadhar'))
            ? 'aadhaar'
            : 'both';

    try {
      if (user) {
        // Add to server cart for authenticated users
        const response = await axios.post('/api/cart/add', {
          productId: product.id,
          quantity
        });
        
        if (response.data.success) {
          const serverCart = Array.isArray(response.data.cart) ? response.data.cart : [];
          // Frontend enrichment: attach productType if server doesn't store it.
          const enriched = serverCart.map((item) => {
            if (item?.productType) return item;
            // Common shapes: {productId} or {product:{id}} depending on backend.
            const pid = item?.productId ?? item?.product?.id;
            if (pid === product?.id) return { ...item, productType: inferredType };
            return item;
          });
          setCart(enriched);
          toast.success('Added to cart');
        }
      } else {
        // Add to local cart for non-authenticated users
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);
        let newCart;
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          newCart = cart.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          const cartItem = {
            productId: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            src: product.src,
            productType: inferredType,
            quantity
          };
          newCart = [...cart, cartItem];
        }
        
        setCart(newCart);
        saveLocalCart(newCart);
        toast.success('Added to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    setLoading(true);
    
    try {
      if (user) {
        // Update on server for authenticated users
        const response = await axios.put('/api/cart/update', {
          productId,
          quantity
        });
        
        if (response.data.success) {
          const serverCart = Array.isArray(response.data.cart) ? response.data.cart : [];
          // Preserve any locally-known productType if backend doesn't provide it.
          const enriched = serverCart.map((item) => {
            if (item?.productType) return item;
            const pid = item?.productId ?? item?.product?.id;
            const existing = cart.find((c) => (c?.productId ?? c?.product?.id) === pid);
            return existing?.productType ? { ...item, productType: existing.productType } : item;
          });
          setCart(enriched);
          toast.success(quantity === 0 ? 'Item removed from cart' : 'Cart updated');
        }
      } else {
        // Update local cart for non-authenticated users
        let newCart;
        
        if (quantity === 0) {
          newCart = cart.filter(item => item.productId !== productId);
        } else {
          newCart = cart.map(item => 
            item.productId === productId 
              ? { ...item, quantity }
              : item
          );
        }
        
        setCart(newCart);
        saveLocalCart(newCart);
        toast.success(quantity === 0 ? 'Item removed from cart' : 'Cart updated');
      }
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    await updateCartItem(productId, 0);
  };

  const clearCart = async () => {
    setLoading(true);
    
    try {
      if (user) {
        // Clear server cart for authenticated users
        const response = await axios.delete('/api/cart/clear');
        
        if (response.data.success) {
          setCart([]);
          toast.success('Cart cleared');
        }
      } else {
        // Clear local cart for non-authenticated users
        setCart([]);
        localStorage.removeItem('cart');
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0).toFixed(2);
  };

  const value = {
    cart,
    itemCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
