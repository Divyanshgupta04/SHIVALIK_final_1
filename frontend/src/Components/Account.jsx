import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/Auth/AuthContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiRefreshCw, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi'

function Account() {
  const { user, loading } = useAuth()
  const { isDark } = useTheme()

  const [orders, setOrders] = useState([])
  const [userAddress, setUserAddress] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Function to fetch data
  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoadingData(true)
    try {
      // Fetch orders and address
      const [ordersRes, addrRes] = await Promise.all([
        axios.get('/api/payment/orders').catch(() => ({ data: { success: true, orders: [] } })),
        axios.get('/api/user-auth/address').catch(() => ({ data: { success: false } })),
      ])
      if (ordersRes?.data?.success) setOrders(ordersRes.data.orders || [])
      if (addrRes?.data?.success) setUserAddress(addrRes.data.address || null)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      if (showLoader) setLoadingData(false)
    }
  }, [])

  // Refresh orders function
  const refreshOrders = async () => {
    setRefreshing(true)
    await fetchData(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchData()
    
    // Set up interval to refresh orders every 30 seconds
    const interval = setInterval(() => {
      fetchData(false)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center`}>Loading...</div>
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Account Settings</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Manage your profile, orders and addresses</p>
          </div>
          <Link to="/products" className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Continue Shopping</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white border border-blue-100'} rounded-2xl p-5 h-max shadow-[0_10px_24px_rgba(0,0,0,0.08)]`}>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-lg font-bold">{user?.name || 'User'}</div>
                <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{user?.email}</div>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <a href="#profile" className="block px-3 py-2 rounded-lg bg-blue-600/10 text-blue-600 font-medium">Profile</a>
              <a href="#orders" className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} block px-3 py-2 rounded-lg`}>Orders</a>
              <a href="#addresses" className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} block px-3 py-2 rounded-lg`}>Addresses</a>
              <a href="#security" className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} block px-3 py-2 rounded-lg`}>Security</a>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile and Account Details */}
            <section id="profile" className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white border border-blue-100'} rounded-2xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]`}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-bold mb-4">Account Details</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{user?.name || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{user?.email || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{userAddress?.phone || 'Not added'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Member Since</span><span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
                  <div className={`${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-xl p-4 text-sm leading-6`}>
                    {userAddress ? (
                      <>
                        <div className="font-medium">{userAddress.fullName}</div>
                        <div>{userAddress.phone}</div>
                        <div>{userAddress.line1}</div>
                        {userAddress.line2 && <div>{userAddress.line2}</div>}
                        <div>{[userAddress.city, userAddress.state].filter(Boolean).join(', ')} {userAddress.postalCode}</div>
                        <div>{userAddress.country}</div>
                      </>
                    ) : (
                      <div className="text-gray-500">No address saved</div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Orders */}
            <section id="orders" className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white border border-blue-100'} rounded-2xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Order History</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={refreshOrders}
                    disabled={refreshing}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <Link to="/products" className="text-sm text-blue-600 hover:underline">Shop more</Link>
                </div>
              </div>
              {loadingData ? (
                <div className="py-6 text-center">
                  <FiRefreshCw className="animate-spin mx-auto text-2xl text-gray-400 mb-2" />
                  <div className="text-sm text-gray-500">Loading orders...</div>
                </div>
              ) : orders?.length ? (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const getStatusInfo = (status) => {
                      switch (status?.toLowerCase()) {
                        case 'pending':
                          return { icon: FiClock, color: 'text-yellow-600 bg-yellow-50', text: 'Pending' }
                        case 'confirmed':
                          return { icon: FiCheckCircle, color: 'text-blue-600 bg-blue-50', text: 'Confirmed' }
                        case 'processing':
                          return { icon: FiPackage, color: 'text-indigo-600 bg-indigo-50', text: 'Processing' }
                        case 'shipped':
                          return { icon: FiTruck, color: 'text-purple-600 bg-purple-50', text: 'Shipped' }
                        case 'delivered':
                          return { icon: FiCheckCircle, color: 'text-green-600 bg-green-50', text: 'Delivered' }
                        case 'cancelled':
                          return { icon: FiXCircle, color: 'text-red-600 bg-red-50', text: 'Cancelled' }
                        default:
                          return { icon: FiAlertCircle, color: 'text-gray-600 bg-gray-50', text: status || 'Unknown' }
                      }
                    }
                    
                    const statusInfo = getStatusInfo(order.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <motion.div 
                        key={order._id || order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} rounded-xl p-4 hover:shadow-md transition-all`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-lg">#{(order._id || order.id)?.toString().slice(-6)}</span>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.text}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div>Order Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}</div>
                              <div>Items: {order.items?.length || 0} item(s)</div>
                              {order.estimatedDelivery && (
                                <div>Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">₹{(order.total || order.amount || 0).toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Total Amount</div>
                          </div>
                        </div>
                        
                        {/* Order Items Preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200/30">
                            <div className="text-sm font-medium mb-2">Items:</div>
                            <div className="space-y-2">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold">
                                    {item.quantity || 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-gray-500">₹{item.price}</div>
                                  </div>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-sm text-gray-500">+{order.items.length - 2} more items</div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FiPackage className="mx-auto text-4xl text-gray-300 mb-4" />
                  <div className="text-lg font-medium mb-2">No orders yet</div>
                  <div className="text-sm text-gray-500 mb-4">Start shopping to see your orders here</div>
                  <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <FiPackage className="w-4 h-4" />
                    Browse Products
                  </Link>
                </div>
              )}
            </section>

            {/* Addresses */}
            <section id="addresses" className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white border border-blue-100'} rounded-2xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Saved Address</h2>
                <Link to="/checkout/address" className="text-sm text-blue-600 hover:underline">{userAddress ? 'Edit' : 'Add New'}</Link>
              </div>
              {loadingData ? (
                <div className="py-6 text-sm text-gray-500">Loading address...</div>
              ) : userAddress ? (
                <div className={`${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-xl p-4 text-sm leading-6`}>
                  <div className="font-semibold">{userAddress.fullName}</div>
                  <div>{userAddress.phone}</div>
                  <div>{userAddress.line1}</div>
                  {userAddress.line2 && <div>{userAddress.line2}</div>}
                  <div>{[userAddress.city, userAddress.state].filter(Boolean).join(', ')} {userAddress.postalCode}</div>
                  <div>{userAddress.country}</div>
                </div>
              ) : (
                <div className="py-6 text-sm text-gray-500">No address saved yet</div>
              )}
            </section>

            {/* Security placeholder */}
            <section id="security" className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white border border-blue-100'} rounded-2xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]`}>
              <h2 className="text-lg font-bold mb-4">Security</h2>
              <p className="text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}">For your security, we use OTP-based login. No password stored.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
