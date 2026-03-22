import React, { createContext, useMemo, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import { useScroll, useTransform } from "framer-motion";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "./Auth/AuthContext";
import { useCart } from "./CartContext";
import { useCatalog } from "./CatalogContext";
import { slugifyName } from "../utils/slug";
import config from "../config/api";

export const ProductsData = createContext();

// Initialize socket connection
const socket = io(config.socketUrl);

export function Context({ children }) {
  const { user } = useAuth();
  const { addToCart: addToCartDynamic, cart, itemCount } = useCart();
  const {
    products: catalogProducts,
    categoriesById: catalogCategoriesById,
    subCategoriesById: catalogSubCategoriesById,
  } = useCatalog();

  const [product, setProduct] = useState([]);
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

  // Fetch products for home page ONLY (fast)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/products/home/list`);
      if (response.data.success) {
        setProduct(response.data.products);
      }
    } catch (error) {
      console.log('Failed to fetch home products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL products (for products page or admin)
  const fetchAllProducts = async (params = {}) => {
    try {
      setLoading(true);
      const { limit = 100, page = 1, categoryId, subCategoryId } = params;
      let url = `${config.apiUrl}/api/products?limit=${limit}&page=${page}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (subCategoryId) url += `&subCategoryId=${subCategoryId}`;

      const response = await axios.get(url);
      if (response.data.success) {
        // Merge with existing products to avoid losing home products
        setProduct(prev => {
          const map = new Map();
          // Add existing ones first
          prev.forEach(p => map.set(String(p.id), p));
          // Overwrite/Add new ones
          response.data.products.forEach(p => map.set(String(p.id), p));
          return Array.from(map.values());
        });
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      toast.error('Failed to load products');
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

  const catalogProductsMapped = useMemo(() => {
    // Map admin-catalog products into the public product card shape used by the UI.
    // This makes /admin/catalog products show up in /products and be cart-addable.
    return (catalogProducts || []).map((p) => {
      const category = catalogCategoriesById?.get?.(p.categoryId);
      const subCategory = catalogSubCategoriesById?.get?.(p.subCategoryId);

      return {
        id: p.id,
        title: p.name,
        description: subCategory?.name
          ? `${subCategory.name} • ${category?.name || 'Service'}`
          : (category?.name || 'Service'),
        price: String(p.price),
        src: p.imageDataUrl || 'https://via.placeholder.com/600x400?text=Service',

        // Extra fields for better storefront filtering + future UI.
        categoryId: p.categoryId,
        subCategoryId: p.subCategoryId,
        categoryName: category?.name || '',
        subCategoryName: subCategory?.name || '',

        // Store as a slug so routing and filtering work (e.g. "Aadhaar Services" -> "aadhaar-services").
        category: slugifyName(category?.name || ''),
        productType: p.productType || '',
        isInsurance: !!p.isInsurance,
        externalLink: p.externalLink || '',
        homePageOrder: p.homePageOrder || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });
  }, [catalogProducts, catalogCategoriesById, catalogSubCategoriesById]);

  const mergedProducts = useMemo(() => {
    // API/fallback products first, then admin-catalog products.
    // If Catalog Manager is connected to DB, the same product can appear in both sources.
    const map = new Map();
    for (const p of [...(product || []), ...(catalogProductsMapped || [])]) {
      if (!p) continue;
      map.set(String(p.id), p);
    }
    return Array.from(map.values());
  }, [product, catalogProductsMapped]);

  // Add to cart handler - Updated to use dynamic cart
  const HandleClickAdd = async (id) => {
    const productData = mergedProducts.find((item) => String(item.id) === String(id));
    if (productData) {
      await addToCartDynamic(productData, 1);
      // Also update legacy addCart for backward compatibility
      setAddCart([...addCart, productData]);
    }
  };

  const Value = {
    product: mergedProducts,
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
    fetchAllProducts,
    user, // Add user to context
  };

  return (
    <ProductsData.Provider value={Value}>{children}</ProductsData.Provider>
  );
}

export default Context;
