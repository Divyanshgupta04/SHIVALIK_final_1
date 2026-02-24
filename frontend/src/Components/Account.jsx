import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/Auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  MapPin,
  ShieldCheck,
  LogOut,
  Plus,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  XCircle,
  RefreshCw,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Constants ---
const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

const Account = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeSection, setActiveSection] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sectionRefs = {
    profile: useRef(null),
    orders: useRef(null),
    addresses: useRef(null),
    security: useRef(null),
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    try {
      // Use existing endpoints from the previous implementation
      const [ordersRes, addrRes] = await Promise.all([
        axios.get('/api/payment/orders').catch(() => ({ data: { success: true, orders: [] } })),
        axios.get('/api/user-auth/address').catch(() => ({ data: { success: false } })),
      ]);

      if (ordersRes?.data?.success) setOrders(ordersRes.data.orders || []);
      if (addrRes?.data?.success) setAddress(addrRes.data.address || null);
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      if (!silent) setDataLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // --- Scroll & Intersection Observer ---
  useEffect(() => {
    if (dataLoading) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [dataLoading]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // --- Formatter ---
  const formatYear = (dateString) => {
    if (!dateString) return new Date().getFullYear();
    return new Date(dateString).getFullYear();
  };

  const handleRemoveAddress = async () => {
    if (!window.confirm('Are you sure you want to remove your saved address?')) return;
    try {
      const response = await axios.delete('/api/user-auth/address');
      if (response.data.success) {
        setAddress(null);
      }
    } catch (error) {
      console.error('Error removing address:', error);
    }
  };

  // --- Sub-components (Skeletons) ---
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-xl ${className}`} />
  );

  // --- Main Render Logic ---
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${isDark ? 'bg-white/5' : 'bg-purple-600/10'}`}>
          <ShieldCheck className="w-10 h-10 text-purple-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Access Denied</h1>
        <p className={`mb-8 max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please sign in to view your account dashboard and manage your orders.</p>
        <Link to="/signin" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-600/20">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-purple-500/30 ${isDark ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-28 z-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100'}`}
            >
              {/* Profile Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex flex-col items-center text-center mb-8 relative">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-[2px]">
                    <div className={`w-full h-full rounded-[22px] overflow-hidden flex items-center justify-center ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                      {(user.image || user.avatar) ? (
                        <img src={user.image || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className={`absolute -bottom-1 -right-1 w-8 h-8 backdrop-blur-md border rounded-xl flex items-center justify-center hover:bg-purple-600 transition-colors group-hover:scale-110 duration-300 ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-black/5 border-black/5 text-gray-700'}`}>
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h2 className={`mt-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</h2>
                <p className={`text-sm flex items-center justify-center gap-1.5 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {formatYear(user.createdAt)}
                </p>
              </div>

              <nav className="space-y-1">
                {SECTIONS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 group ${isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                        : isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-purple-600'
                        }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:translate-x-1'}`} />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={logout}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group`}
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 space-y-10 pb-20 w-full overflow-hidden">

            {/* PROFILE SECTION */}
            <section id="profile" ref={sectionRefs.profile} className="scroll-mt-28">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-600/10' : 'bg-purple-100'}`}>
                    <User className="text-purple-500 w-5 h-5" />
                  </span>
                  Account Profile
                </h3>
              </div>
              <div className={`border rounded-3xl p-6 sm:p-8 shadow-sm ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100'}`}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InfoField icon={User} label="Full Name" value={user.name} isDark={isDark} />
                    <InfoField icon={Mail} label="Email Address" value={user.email} isDark={isDark} />
                    <InfoField icon={Phone} label="Phone Number" value={user.phone || 'Not Added'} isDanger={!user.phone} isDark={isDark} />
                  </div>
                  <div className={`rounded-2xl p-6 flex flex-col justify-between border ${isDark ? 'bg-purple-600/5 border-purple-500/10' : 'bg-purple-50/50 border-purple-200/50'}`}>
                    <div>
                      <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Management</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Update your personal information and keep your contact details current.</p>
                    </div>
                    <button className={`mt-6 w-full py-3 font-medium rounded-xl border transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200'}`}>
                      Edit Personal Info
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ORDERS SECTION */}
            <section id="orders" ref={sectionRefs.orders} className="scroll-mt-28">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-600/10' : 'bg-blue-100'}`}>
                    <Package className="text-blue-500 w-5 h-5" />
                  </span>
                  Order History
                </h3>
                <button
                  onClick={() => { setRefreshing(true); fetchData(true); }}
                  className={`p-2 rounded-xl transition-all border ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {dataLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-40" />)}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order, idx) => (
                    <OrderCard key={order.id || order._id || idx} order={order} isDark={isDark} />
                  ))}
                </div>
              ) : (
                <div className={`border rounded-3xl p-10 sm:p-16 text-center shadow-sm ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100'}`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-white/5 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
                    <Package className="w-10 h-10" />
                  </div>
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>No orders yet</h4>
                  <p className={`mt-2 mb-8 max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Looks like you haven't placed any orders yet. Start exploring our latest products!</p>
                  <Link to="/products" className={`px-8 py-3 font-bold rounded-xl transition-colors inline-block shadow-lg ${isDark ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-gray-900 text-white hover:bg-black shadow-black/10'}`}>
                    Start Shopping
                  </Link>
                </div>
              )}
            </section>

            {/* ADDRESSES SECTION */}
            <section id="addresses" ref={sectionRefs.addresses} className="scroll-mt-28">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-100'}`}>
                    <MapPin className="text-indigo-500 w-5 h-5" />
                  </span>
                  Saved Addresses
                </h3>
                <Link to="/checkout/address" className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-600 hover:text-white transition-all text-sm font-semibold">
                  <Plus className="w-4 h-4" />
                  {address ? 'Add Another' : 'Add New'}
                </Link>
              </div>

              {dataLoading ? (
                <Skeleton className="h-44" />
              ) : address ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {(Array.isArray(address) ? address : [address]).map((addr, idx) => (
                    <div key={idx} className={`border rounded-3xl p-7 relative group overflow-hidden shadow-sm ${isDark ? 'bg-[#1a1a1a] border-purple-500/30' : 'bg-white border-purple-200'}`}>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-600/10 blur-3xl rounded-full" />
                      {idx === 0 && (
                        <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-500/20 z-10">
                          Default
                        </div>
                      )}
                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-purple-600/10' : 'bg-purple-50'}`}>
                          <MapPin className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{addr.fullName || user.name}</h4>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {addr.line1}<br />
                            {addr.line2 && <>{addr.line2}<br /></>}
                            {addr.city}, {addr.state} - {addr.postalCode}<br />
                            {addr.country}
                          </p>
                          <p className={`mt-3 text-sm flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <Phone className="w-3.5 h-3.5" /> {addr.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 mt-6 pt-5 border-t border-white/5 relative z-10">
                        <Link to="/checkout/address" className="text-sm font-bold text-purple-400 hover:text-purple-500 transition-colors">Edit Details</Link>
                        <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <button
                          onClick={handleRemoveAddress}
                          className="text-sm font-bold text-red-500/70 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`border rounded-3xl p-10 sm:p-12 text-center shadow-sm ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100'}`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-white/5 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
                    <MapPin className="w-10 h-10" />
                  </div>
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Shipping Address</h4>
                  <p className={`mt-2 mb-8 max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>You haven't added a shipping address yet. Add one to speed up checkout.</p>
                  <Link to="/checkout/address" className={`px-8 py-3 font-bold rounded-xl transition-colors inline-block border shadow-sm ${isDark ? 'bg-white text-black border-transparent hover:bg-gray-200' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'}`}>
                    Add Address
                  </Link>
                </div>
              )}
            </section>

            {/* SECURITY SECTION */}
            <section id="security" ref={sectionRefs.security} className="scroll-mt-28">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-600/10' : 'bg-green-100'}`}>
                    <ShieldCheck className="text-green-500 w-5 h-5" />
                  </span>
                  Security & Authentication
                </h3>
              </div>
              <div className="space-y-4">
                <SecurityItem
                  title="Two-Factor Authentication"
                  desc="Add an extra layer of security to your account."
                  icon={ShieldCheck}
                  enabled
                  isDark={isDark}
                />
                <div className={`border rounded-3xl p-6 flex items-center justify-between group transition-all cursor-pointer ${isDark ? 'bg-[#1a1a1a] border-red-500/10 hover:border-red-500/20' : 'bg-white border-red-100 hover:bg-red-50/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                      <LogOut className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Logout from all devices</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Securely sign out from all currently active sessions.</p>
                    </div>
                  </div>
                  <button onClick={logout} className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-red-500/10 text-gray-600 group-hover:text-red-500' : 'hover:bg-red-100 text-gray-400 group-hover:text-red-500'}`}>
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const InfoField = ({ icon: Icon, label, value, isDanger, isDark }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${isDanger ? 'bg-red-500/10 text-red-500 border-red-500/20' : (isDark ? 'bg-white/5 text-gray-400 border-white/5' : 'bg-gray-50 text-gray-500 border-gray-100')}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-0.5">{label}</p>
      <p className={`font-bold ${isDanger ? 'text-red-500/70 italic text-sm' : (isDark ? 'text-white' : 'text-gray-900')}`}>{value}</p>
    </div>
  </div>
);

const SecurityItem = ({ title, desc, icon: Icon, enabled, isDark }) => (
  <div className={`border rounded-3xl p-6 flex items-center justify-between group transition-all cursor-pointer ${isDark ? 'bg-[#1a1a1a] border-white/5 hover:border-purple-500/20' : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-purple-50/10'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 group-hover:bg-purple-600/10 text-gray-400 group-hover:text-purple-500' : 'bg-gray-50 group-hover:bg-purple-100 text-gray-500 group-hover:text-purple-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
          {enabled && <span className="bg-green-500/10 text-green-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-green-500/20 uppercase tracking-tighter">Enabled</span>}
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
      </div>
    </div>
    <div className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-white/5 text-gray-600 group-hover:text-white' : 'hover:bg-gray-100 text-gray-400 group-hover:text-gray-900'}`}>
      <ChevronRight className="w-6 h-6" />
    </div>
  </div>
);

const OrderCard = ({ order, isDark }) => {
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return { color: 'text-green-500', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: CheckCircle2 };
      case 'shipped': return { color: 'text-blue-500', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Truck };
      case 'processing': return { color: 'text-yellow-600', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: Clock };
      case 'cancelled': return { color: 'text-red-500', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: XCircle };
      default: return { color: 'text-gray-500', bg: 'bg-gray-400/10', border: 'border-gray-400/20', icon: AlertCircle };
    }
  };

  const status = getStatusStyle(order.status);
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-3xl p-6 transition-all group overflow-hidden relative shadow-sm ${isDark ? 'bg-[#1a1a1a] border-white/5 hover:border-white/10' : 'bg-white border-gray-100 hover:border-purple-200'}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none ${isDark ? 'bg-white/5' : 'bg-purple-100/50'}`} />

      <div className="flex flex-col sm:flex-row justify-between gap-6 relative z-10">
        <div className="flex gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${isDark ? 'bg-white/5 border-white/5 text-gray-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
            <Package className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>#{(order._id || order.id)?.toString().slice(-8).toUpperCase()}</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {order.status || 'Pending'}
              </span>
            </div>
            <p className={`text-sm flex items-center gap-1.5 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
          <span className={`text-2xl font-black leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{(order.total || order.amount || 0).toLocaleString()}</span>
          <Link to={`/order/${order.id || order._id}`} className="text-sm font-bold text-purple-600 hover:text-purple-500 flex items-center gap-1 group/link">
            View Details
            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Items Preview */}
      {order.items && order.items.length > 0 && (
        <div className={`mt-8 pt-6 border-t flex items-center justify-between relative z-10 ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-4 overflow-hidden">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className={`inline-block h-12 w-12 rounded-2xl ring-4 flex items-center justify-center text-[10px] font-bold overflow-hidden border ${isDark ? 'ring-[#1a1a1a] bg-[#2a2a2a] text-gray-400 border-white/5' : 'ring-white bg-gray-50 text-gray-400 border-gray-100'}`}>
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm">{item.title?.[0] || 'P'}</span>
                  )}
                </div>
              ))}
              {order.items.length > 3 && (
                <div className={`flex items-center justify-center h-12 w-12 rounded-2xl ring-4 text-xs font-black backdrop-blur-sm ${isDark ? 'bg-white/5 ring-[#1a1a1a] text-white/50' : 'bg-gray-100/50 ring-white text-gray-400'}`}>
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            <p className={`text-sm font-bold ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {order.items.length} {order.items.length === 1 ? 'Product' : 'Products'}
            </p>
          </div>
          <div className="hidden md:flex gap-1">
            {[1, 2, 3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Account;
