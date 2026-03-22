import React, { useContext } from 'react';
import Navbar from './Components/Navbar';
import HomePage from './Components/HomePage';
import Background from './assets/Background.png';
import Hero from './Components/Hero';
import Show from './Components/Show';
import CategoriesPage from './Components/CategoriesPage';
import BestSellingProduct from './Components/BestSellingProduct';
import Products from './Components/Products';
import { motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Cart from './Components/Cart';
import CartDetail from './Components/CartDetail';
import NotFound from './Components/NotFound';
import Footer from './Components/Footer';
import About from './Components/About';
import Contact from './Components/Contact';
import Account from './Components/Account';
import Payment from './Components/Payment';
import Card from './Components/Card';
import AdminLogin from './Components/Admin/AdminLogin';
import AdminDashboard from './Components/Admin/AdminDashboard';
import AdminProducts from './Components/Admin/AdminProducts';
import AdminUsers from './Components/Admin/AdminUsers';
import AdminOrders from './Components/Admin/AdminOrders';
import AdminHomeProducts from './Components/Admin/AdminHomeProducts';
import PaymentStatus from './Components/PaymentStatus';

import AdminCatalog from './Components/Admin/Catalog/AdminCatalog';
import BrowseCategories from './Components/BrowseCategories';
import AdminAnnouncements from './Components/Admin/AdminAnnouncements';
import AdminHeroManager from './Components/Admin/AdminHeroManager';

import SignIn from './Components/UserAuth/SignIn';
import SignUp from './Components/UserAuth/SignUp';
import AuthSuccess from './Components/UserAuth/AuthSuccess';
import ProtectedRoute from './Components/UserAuth/ProtectedRoute';
import Address from './Components/Checkout/Address';
import Checkout from './Components/Checkout/Checkout';
import { useTheme } from './context/ThemeContext';
import { ProductsData } from './context/Context';
import { StatsProvider } from './context/StatsContext';
import Category from './Components/Category';
import ProductDetail from './Components/ProductDetail';
import ApplyReview from './Components/ApplyReview';


import SEO from './Components/SEO';
import TermsAndConditions from './Components/TermsAndConditions';
import RefundPolicy from './Components/RefundPolicy';
import PrivacyPolicy from './Components/PrivacyPolicy';
import Wishlist from './Components/Wishlist';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  const { theme } = useTheme();
  const { isScroll } = useContext(ProductsData);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <WishlistProvider>
      <StatsProvider>
        <SEO
          title="Home"
          description="Shivalik Service Hub - Your trusted partner for PAN cards, digital services, and online solutions in India. Fast, reliable, and convenient."
          keywords="shivalik service hub, pan card apply online, digital services india, online service center, jammu kashmir services"
        />
        <div className={`min-h-screen w-full flex flex-col m-0 p-0 transition-colors duration-500 relative overflow-x-hidden ${theme === 'dark'
          ? 'bg-[#0a0a1a] text-white'
          : 'bg-gray-50 text-gray-900'
          }`}>
          {/* Global Background Decorative Elements */}
          {theme === 'dark' && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
              <div className="absolute top-[30%] left-[-5%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>
          )}

          <div className="relative z-10 flex flex-col min-h-screen">
            <Routes>
              {/* Admin Routes (without navbar and footer) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />

              <Route path="/admin/catalog" element={<AdminCatalog />} />

              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/home-products" element={<AdminHomeProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/hero" element={<AdminHeroManager />} />

              {/* User Auth Routes (without navbar and footer) */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/auth/success" element={<AuthSuccess />} />

              {/* Regular Routes (with navbar and footer) */}
              <Route path="/*" element={
                <>
                  {/* Single Navbar with dynamic behavior */}
                  <Navbar />

                  {/* Spacer to prevent content from going under the fixed navbar */}
                  <div
                    className={`block w-full m-0 p-0 ${isHomePage
                      ? 'h-0'
                      : 'h-[90px]'
                      }`}
                  ></div>

                  {/* Main content grows to push footer to the bottom */}
                  <main className="flex-1 w-full m-0 p-0">
                    <Routes>
                      {/* Home Page Route */}
                      <Route
                        path="/"
                        element={
                          <>
                            <HomePage />
                            <BrowseCategories />
                            <BestSellingProduct />
                            <Show />
                            {/* <Card/> */}
                          </>
                        }
                      />

                      {/* Other Routes */}
                      <Route path="/products" element={<Products />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      {/* <Route path="/library/book/:id" element={<ProductDetail/>}/> */}
                      <Route path="/category/:slug" element={<Category />} />

                      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path='/cart-Detail' element={<ProtectedRoute><CartDetail /></ProtectedRoute>} />
                      <Route path='/about' element={<About />} />
                      <Route path='/contact' element={<Contact />} />
                      <Route path='/terms' element={<TermsAndConditions />} />
                      <Route path='/refund-policy' element={<RefundPolicy />} />
                      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                      <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
                      <Route path='/wishlist' element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                      <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      {/* Legacy route kept for compatibility with existing Payment page */}
                      <Route path='/checkout/address' element={<ProtectedRoute><Address /></ProtectedRoute>} />
                      <Route path='/pay' element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                      <Route path='/payment-status' element={<PaymentStatus />} />
                      <Route path='/apply-review' element={<ProtectedRoute><ApplyReview /></ProtectedRoute>} />
                      <Route path='*' element={<NotFound />} />
                    </Routes>
                  </main>

                  {/* Footer stays at the bottom on every page */}
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </div>
      </StatsProvider>
    </WishlistProvider>
  );
}

export default App;