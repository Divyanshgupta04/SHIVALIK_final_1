import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiLogOut, FiEye } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import config from '../../config/api'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ hasNext: false, hasPrev: false })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => { checkAuth(); fetchOrders(1) }, [statusFilter])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) navigate('/admin/login')
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchOrders = async (p = 1) => {
    try {
      const statusQuery = statusFilter !== 'all' ? `&status=${statusFilter}` : ''
      const res = await axios.get(`${config.apiUrl}/api/admin/orders?page=${p}&limit=10${statusQuery}`, getAuthHeaders())
      if (res.data.success) {
        setOrders(res.data.orders)
        setPagination(res.data.pagination || { hasNext: false, hasPrev: false })
        setPage(p)
      }
    } catch (e) {
      toast.error('Failed to fetch orders')
    } finally { setLoading(false) }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/admin/orders/${orderId}`, getAuthHeaders())
      if (res.data.success) {
        setSelectedOrder(res.data.order)
        setShowOrderModal(true)
      }
    } catch (e) {
      toast.error('Failed to fetch order details')
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true)
    try {
      const res = await axios.put(`${config.apiUrl}/api/admin/orders/${orderId}/status`,
        { status: newStatus }, 
        getAuthHeaders()
      )
      if (res.data.success) {
        toast.success('Order status updated successfully')
        setSelectedOrder(res.data.order)
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ))
      }
    } catch (e) {
      toast.error('Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
    toast.success('Logged out successfully')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-indigo-100 text-indigo-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg text-gray-700">Loading orders...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin • Orders</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              <FiLogOut /><span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
              <div className="flex gap-2">
                <button onClick={() => pagination.hasPrev && fetchOrders(page - 1)} disabled={!pagination.hasPrev} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 text-gray-700 hover:bg-gray-50">
                  Prev
                </button>
                <button onClick={() => pagination.hasNext && fetchOrders(page + 1)} disabled={!pagination.hasNext} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{(order._id || '').slice(-6)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>
                        <div className="font-medium text-gray-900">{order.userName}</div>
                        <div className="text-xs text-gray-500">{order.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button 
                        onClick={() => fetchOrderDetails(order._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <div className="text-gray-700">No orders found.</div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Order Details - #{selectedOrder._id.slice(-6)}</h3>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-gray-900">Order Information</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div><strong className="text-gray-900">Order ID:</strong> #{selectedOrder._id.slice(-6)}</div>
                    <div><strong className="text-gray-900">Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</div>
                    <div><strong className="text-gray-900">Total:</strong> ₹{selectedOrder.total}</div>
                    <div><strong className="text-gray-900">Payment ID:</strong> {selectedOrder.payment?.razorpay_payment_id}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-900">Customer Information</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div><strong className="text-gray-900">Name:</strong> {selectedOrder.userName}</div>
                    <div><strong className="text-gray-900">Email:</strong> {selectedOrder.userEmail}</div>
                    <div><strong className="text-gray-900">Phone:</strong> {selectedOrder.shippingAddress?.phone}</div>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div>
                <h4 className="font-medium mb-2 text-gray-900">Shipping Address</h4>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-800">
                  <div className="font-medium">{selectedOrder.shippingAddress?.fullName}</div>
                  <div>{selectedOrder.shippingAddress?.line1}</div>
                  {selectedOrder.shippingAddress?.line2 && <div>{selectedOrder.shippingAddress.line2}</div>}
                  <div>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}</div>
                  <div>{selectedOrder.shippingAddress?.country}</div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2 text-gray-900">Order Items</h4>
                <div className="border rounded">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Price</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.title}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-sm text-gray-700">₹{item.price}</td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 bg-gray-50 text-right">
                    <div className="text-sm text-gray-700">Subtotal: ₹{selectedOrder.subtotal}</div>
                    <div className="text-sm text-gray-700">Tax: ₹{selectedOrder.tax}</div>
                    <div className="text-sm text-gray-700">Shipping: ₹{selectedOrder.shipping}</div>
                    <div className="text-lg font-bold mt-1 text-gray-900">Total: ₹{selectedOrder.total}</div>
                  </div>
                </div>
              </div>
              
              {/* Status Update */}
              <div>
                <h4 className="font-medium mb-2 text-gray-900">Update Status</h4>
                <div className="flex gap-2 flex-wrap">
                  {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      disabled={updatingStatus || selectedOrder.status === status}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedOrder.status === status
                          ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
