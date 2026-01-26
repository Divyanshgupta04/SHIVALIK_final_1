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

  // Enhanced Invoice Generator
  const downloadInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');

    // Calculate totals
    const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = 0; // Assuming tax inclusive or 0 for now
    const total = order.total;

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order._id.slice(-6)}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px; }
          .logo h1 { color: #2563eb; margin: 0; font-size: 28px; text-transform: uppercase; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { margin: 0 0 10px 0; color: #2563eb; }
          .billing-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .bill-to, .bill-from { flex: 1; }
          .bill-from { text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 14px; text-transform: uppercase; color: #64748b; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-table { width: 300px; }
          .totals-table td { padding: 8px 0; border: none; }
          .totals-table .total-row { border-top: 2px solid #2563eb; font-weight: bold; font-size: 18px; color: #2563eb; }
          .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          @media print { .print-btn { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" class="print-btn">Print Invoice</button>
        
        <div class="header">
          <div class="logo">
            <h1>Tax Invoice</h1>
            <p>Shivalik Service Hub</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> INV-${order._id.slice(-6).toUpperCase()}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
          </div>
        </div>

        <div class="billing-info">
          <div class="bill-to">
            <h3 style="color: #64748b; font-size: 14px; margin-bottom: 10px; text-transform: uppercase;">Bill To:</h3>
            <strong>${order.shippingAddress?.fullName}</strong><br>
            ${order.shippingAddress?.line1}<br>
            ${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br>` : ''}
            ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}<br>
            ${order.shippingAddress?.country}<br>
            Phone: ${order.shippingAddress?.phone}
          </div>
          <div class="bill-from">
             <h3 style="color: #64748b; font-size: 14px; margin-bottom: 10px; text-transform: uppercase;">From:</h3>
             <strong>Shivalik Service Hub</strong><br>
             Digital Service Center<br>
             Email: support@shivalik.com
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <strong>${item.title}</strong>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₹${item.price}</td>
                <td class="text-right">₹${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-table">
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
              <span style="color: #64748b;">Subtotal:</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
              <span style="color: #64748b;">Tax (0%):</span>
              <span>₹0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #2563eb; margin-top: 5px;">
              <span style="font-weight: bold;">Total:</span>
              <span style="font-weight: bold; color: #2563eb; font-size: 18px;">₹${total}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and requires no signature.</p>
        </div>
      </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceContent);
    invoiceWindow.document.close();
  };

  const exportToCSV = async () => {
    try {
      const loadingToast = toast.loading('Generating CSV...');
      // Fetch all orders
      const res = await axios.get(`${config.apiUrl}/api/admin/orders?page=1&limit=10000`, getAuthHeaders());

      if (!res.data.success) {
        toast.dismiss(loadingToast);
        toast.error('Failed to fetch orders for export');
        return;
      }

      const allOrders = res.data.orders;

      // Define headers
      const headers = [
        'Order ID',
        'Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Status',
        'Total Amount',
        'Shipping Address',
        'Items',
        'Identity Verified'
      ];

      // Convert orders to CSV rows
      const rows = allOrders.map(order => {
        const itemsSummary = order.items.map(i => `${i.title} (${i.quantity})`).join('; ');
        const address = `${order.shippingAddress?.line1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state}`;
        const identityVerified = order.identityFormId ? 'Yes' : 'No';

        return [
          order._id,
          new Date(order.orderDate).toLocaleDateString(),
          `"${order.userName}"`, // Quote to handle commas
          order.userEmail,
          order.shippingAddress?.phone || 'N/A',
          order.status,
          order.total,
          `"${address}"`,
          `"${itemsSummary}"`,
          identityVerified
        ].join(',');
      });

      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss(loadingToast);
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    }
  }

  const downloadOrderDetails = (order) => {
    if (!order) return;

    // Create HTML content for download
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Details - #${order._id.slice(-6)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto; }
    h1 { color: #1f2937; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-row { margin: 8px 0; }
    .label { font-weight: bold; color: #4b5563; }
    .value { color: #1f2937; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; color: #374151; }
    .total-row { font-weight: bold; background: #f9fafb; }
    .document-img { max-width: 100%; height: auto; border: 2px solid #e5e7eb; border-radius: 8px; margin: 10px 0; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 500; }
    .status-confirmed { background: #dbeafe; color: #1e40af; }
    .status-processing { background: #fef3c7; color: #92400e; }
    .status-shipped { background: #dbeafe; color: #1e40af; }
    .status-delivered { background: #d1fae5; color: #065f46; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <h1>Order Details</h1>
  
  <div class="section">
    <h2>Order Information</h2>
    <div class="grid">
      <div>
        <div class="info-row"><span class="label">Order ID:</span> <span class="value">#${order._id.slice(-6)}</span></div>
        <div class="info-row"><span class="label">Order Date:</span> <span class="value">${new Date(order.orderDate).toLocaleString()}</span></div>
        <div class="info-row"><span class="label">Status:</span> <span class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
      </div>
      <div>
        <div class="info-row"><span class="label">Total Amount:</span> <span class="value">₹${order.total}</span></div>
        <div class="info-row"><span class="label">Payment ID:</span> <span class="value">${order.payment?.razorpay_payment_id || 'N/A'}</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Customer Information</h2>
    <div class="info-row"><span class="label">Name:</span> <span class="value">${order.userName}</span></div>
    <div class="info-row"><span class="label">Email:</span> <span class="value">${order.userEmail}</span></div>
    <div class="info-row"><span class="label">Phone:</span> <span class="value">${order.shippingAddress?.phone || 'N/A'}</span></div>
  </div>

  <div class="section">
    <h2>Shipping Address</h2>
    <div class="info-row"><span class="value">${order.shippingAddress?.fullName}</span></div>
    <div class="info-row"><span class="value">${order.shippingAddress?.line1}</span></div>
    ${order.shippingAddress?.line2 ? `<div class="info-row"><span class="value">${order.shippingAddress.line2}</span></div>` : ''}
    <div class="info-row"><span class="value">${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}</span></div>
    <div class="info-row"><span class="value">${order.shippingAddress?.country}</span></div>
  </div>

  <div class="section">
    <h2>Order Items</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>${item.title}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3">Subtotal</td>
          <td>₹${order.subtotal}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">Tax (GST)</td>
          <td>₹${order.tax}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">Shipping</td>
          <td>₹${order.shipping}</td>
        </tr>
        <tr class="total-row" style="font-size: 16px;">
          <td colspan="3">Total</td>
          <td>₹${order.total}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${order.identityForm ? `
  <div class="section">
    <h2>Identity Verification Documents</h2>
    <div class="info-row"><span class="label">Full Name:</span> <span class="value">${order.identityForm.fullName}</span></div>
    <div class="info-row"><span class="label">Date of Birth:</span> <span class="value">${order.identityForm.dob}</span></div>
    ${order.identityForm.mobile ? `<div class="info-row"><span class="label">Mobile:</span> <span class="value">${order.identityForm.mobile}</span></div>` : ''}
    ${order.identityForm.fatherName ? `<div class="info-row"><span class="label">Father's Name:</span> <span class="value">${order.identityForm.fatherName}</span></div>` : ''}
    
    ${order.identityForm.aadhaarNumber ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #374151; margin-bottom: 10px;">Aadhaar Card</h3>
      <div class="info-row"><span class="label">Aadhaar Number:</span> <span class="value">${order.identityForm.aadhaarNumber}</span></div>
      ${order.identityForm.aadhaarPhoto ? `<img src="${order.identityForm.aadhaarPhoto}" alt="Aadhaar Card" class="document-img" />` : ''}
    </div>
    ` : ''}
    
    ${order.identityForm.panNumber ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #374151; margin-bottom: 10px;">PAN Card</h3>
      <div class="info-row"><span class="label">PAN Number:</span> <span class="value">${order.identityForm.panNumber}</span></div>
      ${order.identityForm.panPhoto ? `<img src="${order.identityForm.panPhoto}" alt="PAN Card" class="document-img" />` : ''}
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>This is a system-generated document</p>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Order_${order._id.slice(-6)}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Order details downloaded successfully');
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
            <div className="flex justify-between items-center">
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
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                📊 Export to Excel
              </button>
            </div>
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
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => downloadOrderDetails(selectedOrder)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Download Details
                  </button>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
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

              {/* Identity Documents */}
              {selectedOrder.identityForm && (
                <div>
                  <h4 className="font-medium mb-2 text-gray-900">Identity Documents</h4>
                  <div className="bg-gray-50 p-4 rounded space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedOrder.identityForm.aadhaarPhoto && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Aadhaar Card</p>
                          <div className="border border-gray-300 rounded overflow-hidden">
                            <img
                              src={selectedOrder.identityForm.aadhaarPhoto}
                              alt="Aadhaar Card"
                              className="w-full h-auto"
                              style={{ maxHeight: '300px', objectFit: 'contain' }}
                            />
                          </div>
                          {selectedOrder.identityForm.aadhaarNumber && (
                            <p className="text-xs text-gray-600 mt-1">Number: {selectedOrder.identityForm.aadhaarNumber}</p>
                          )}
                        </div>
                      )}
                      {selectedOrder.identityForm.panPhoto && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">PAN Card</p>
                          <div className="border border-gray-300 rounded overflow-hidden">
                            <img
                              src={selectedOrder.identityForm.panPhoto}
                              alt="PAN Card"
                              className="w-full h-auto"
                              style={{ maxHeight: '300px', objectFit: 'contain' }}
                            />
                          </div>
                          {selectedOrder.identityForm.panNumber && (
                            <p className="text-xs text-gray-600 mt-1">Number: {selectedOrder.identityForm.panNumber}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-700">
                      <p><strong>Name:</strong> {selectedOrder.identityForm.fullName}</p>
                      <p><strong>DOB:</strong> {selectedOrder.identityForm.dob}</p>
                      {selectedOrder.identityForm.mobile && <p><strong>Mobile:</strong> {selectedOrder.identityForm.mobile}</p>}
                      {selectedOrder.identityForm.fatherName && <p><strong>Father's Name:</strong> {selectedOrder.identityForm.fatherName}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h4 className="font-medium mb-2 text-gray-900">Update Status</h4>
                <div className="flex gap-2 flex-wrap">
                  {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      disabled={updatingStatus || selectedOrder.status === status}
                      className={`px-3 py-1 text-sm rounded ${selectedOrder.status === status
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

