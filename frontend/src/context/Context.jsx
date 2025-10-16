import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import { useScroll, useTransform } from "framer-motion";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "./Auth/AuthContext";
import { useCart } from "./CartContext";

export const ProductsData = createContext();

// Initialize socket connection
const socket = io('http://localhost:5000');

// Fallback products in case API is not available
const fallbackProducts = [
  {
    id: 1,
    title: "Pan Card",
    description: "Pan card use daily life",
    price: "200",
    src: "https://i.pinimg.com/736x/dd/19/b9/dd19b9cf4869fbf1d1583b58d472acea.jpg",
    category: "pan",
  },
  {
    id: 2,
    title: "Aadhar Services",
    description: "Link and update Aadhar easily",
    price: "150",
    src: "https://tse1.mm.bing.net/th/id/OIP.o6ileBbQ2OgIGwwfbvA1FgHaEK?pid=Api&P=0&h=180",
    category: "service",
  },
  {
    id: 3,
    title: "Driving License",
    description: "Apply or renew your driving license",
    price: "500",
    src: "https://tse3.mm.bing.net/th/id/OIP.LqR0EJ-AjUpJPEfPaQsUwwAAAA?pid=Api&P=0&h=180",
    category: "service",
  },
  {
    id: 4,
    title: "Library Membership",
    description: "Access thousands of books and journals",
    price: "300",
    src: "https://tse2.mm.bing.net/th/id/OIP.WvUt-DFKsFEl7x7ITQ3Y-QHaEK?pid=Api&P=0&h=180",
    category: "library",
  },
  {
    id: 5,
    title: "E-Library Access",
    description: "Online access to premium e-books",
    price: "250",
    src: "https://tse1.mm.bing.net/th/id/OIP.S6yPGpFAcbA7GdLp1ZBGxAHaEK?pid=Api&P=0&h=180",
    category: "library",
  },
  {
    id: 6,
    title: "Health Insurance",
    description: "Affordable health coverage plans",
    price: "2000",
    src: "https://d28c6jni2fmamz.cloudfront.net/Health_Insurance_69c35c8189.jpg",
    category: "insurance",
  },
  {
    id: 7,
    title: "Car Insurance",
    description: "Protect your vehicle against damages",
    price: "3500",
    src: "https://tse2.mm.bing.net/th/id/OIP.xm3dwe9AOwqKtZA8kD4-tgHaEC?pid=Api&P=0&h=180",
    category: "insurance",
  },
  {
    id: 8,
    title: "Life Insurance",
    description: "Secure your family's future",
    price: "5000",
    src: "https://tse3.mm.bing.net/th/id/OIP.u2stUyWPQ29LJa1UguBogQHaFL?pid=Api&P=0&h=180",
    category: "insurance",
  },
  {
    id: 9,
    title: "Travel Insurance",
    description: "Safe travel with full coverage",
    price: "1200",
    src: "https://tse3.mm.bing.net/th/id/OIP.b65CnF686bgukC1y2In1oAHaHa?pid=Api&P=0&h=180",
    category: "insurance",
  },
  {
    id: 10,
    title: "Partner Program",
    description: "Join our partner program & earn rewards",
    price: "0",
    src: "https://tse1.mm.bing.net/th/id/OIP.atW3AqAYCCC2odQATGJI7wHaEG?pid=Api&P=0&h=180",
    category: "partner",
  },
  {
    id: 11,
    title: "Business Partner",
    description: "Grow with our partnership opportunities",
    price: "0",
    src: "https://tse4.mm.bing.net/th/id/OIP.DCNb7PbC72YSD0oBoaVPQQHaHa?pid=Api&P=0&h=180",
    category: "partner",
  },
  {
    id: 12,
    title: "Digital Services",
    description: "Get access to online government services",
    price: "100",
    src: "https://tse4.mm.bing.net/th/id/OIP.UHbLZ8RpYt9AO-wJNlAkkwHaE8?pid=Api&P=0&h=180",
    category: "service",
  },
];

export function Context({ children }) {
  const { user } = useAuth();
  const { addToCart: addToCartDynamic, cart, itemCount } = useCart();
  
  const [product, setProduct] = useState(fallbackProducts);
  const [addCart, setAddCart] = useState([]); // Keep for backward compatibility
  const [isScroll, setIsScroll] = useState(false);
  const [isOpen, setisOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const { scrollY } = useScroll();

  // Logo animation values (aligned with Navbar logo behavior)
    const logoSize = useTransform(
    scrollY,
    [0, 200],
    isDesktop ? ["9vw", "5vw"] : ["20vw", "12vw"]
  );

  // 🔹 Y position transform
  const logoY = useTransform(
    scrollY,
    [0, 200],
    isDesktop ? ["0vh", "-3vh"] : ["0vh", "-4vh"]
  );

  // 🔹 X position transform (constant but still motion value → avoid jump)
  const logoX = useTransform(
    scrollY,
    [0, 200],
    isDesktop ? ["0vw", "0vw"] : ["-5vw", "-5vw"]
  );

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.success) {
        setProduct(response.data.products);
      }
    } catch (error) {
      console.log('Failed to fetch products from API, using fallback data');
      // Fallback products are already set in initial state
    } finally {
      setLoading(false);
    }
  };

  // Initialize app
  useEffect(() => {
    fetchProducts();

    // Socket event listeners for real-time updates
    socket.on('productAdded', (newProduct) => {
      setProduct(prevProducts => [...prevProducts, newProduct]);
      toast.success(`New product added: ${newProduct.title}`);
    });

    socket.on('productUpdated', (updatedProduct) => {
      setProduct(prevProducts => 
        prevProducts.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        )
      );
      toast.success(`Product updated: ${updatedProduct.title}`);
    });

    socket.on('productDeleted', (deletedProductData) => {
      setProduct(prevProducts => 
        prevProducts.filter(p => p.id !== parseInt(deletedProductData.id))
      );
      toast.success('Product removed');
    });

    // Cleanup socket listeners
    return () => {
      socket.off('productAdded');
      socket.off('productUpdated');
      socket.off('productDeleted');
    };
  }, []);

  // Scroll state
  useEffect(() => {
    const handleScroll = () => setIsScroll(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dropdown animation
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
  };

  // Search animation
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  // Add to cart handler - Updated to use dynamic cart
  const HandleClickAdd = async (id) => {
    const productData = product.find((item) => item.id === id);
    if (productData) {
      await addToCartDynamic(productData, 1);
      // Also update legacy addCart for backward compatibility
      setAddCart([...addCart, productData]);
    }
  };

  const Value = {
    product,
    HandleClickAdd,
    addCart: cart || addCart, // Use dynamic cart, fallback to legacy
    cartItemCount: itemCount,
    isScroll,
    isDesktop,
    logoSize,
    logoY,
    logoX,
    isOpen,
    setisOpen,
    isSearchOpen,
    setIsSearchOpen,
    profileOpen,
    setProfileOpen,
    dropdownVariants,
    overlayVariants,
    inputVariants,
    listItemVariants,
    loading,
    socket,
    fetchProducts,
    user, // Add user to context
  };

  return (
    <ProductsData.Provider value={Value}>{children}</ProductsData.Provider>
  );
}

export default Context;
