import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/Auth/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-hot-toast'
import axios from 'axios'

function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [orderProcessing, setOrderProcessing] = useState(false)
  const [userAddress, setUserAddress] = useState(null)
  const [addressLoading, setAddressLoading] = useState(true)

  const buyNowItem = location.state?.buyNowItem

  // Derived state to handle either "Buy Now" item or normal Cart
  const currentCart = buyNowItem ? [{ ...buyNowItem, quantity: 1 }] : cart

  // Redirect if cart is empty
  useEffect(() => {
    // If neither global cart nor buyNowItem exists, redirect
    if ((!cart || cart.length === 0) && !buyNowItem) {
      toast.error('Your cart is empty')
      navigate('/products')
    }
  }, [cart, buyNowItem, navigate])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to continue')
      navigate('/signin')
    }
  }, [user, navigate])

  // Fetch user address
  const fetchAddress = async () => {
    if (user) {
      setAddressLoading(true)
      try {
        const res = await axios.get('/api/user-auth/address')
        if (res.data.success && res.data.address) {
          setUserAddress(res.data.address)
        } else {
          setUserAddress(null)
        }
      } catch (error) {
        console.log('No address found')
        setUserAddress(null)
      } finally {
        setAddressLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchAddress()
  }, [user])

  // Refresh address when returning from address page
  useEffect(() => {
    if (location.state?.addressUpdated) {
      fetchAddress()
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Calculate totals based on currentCart (Buy Now or Global)
  const subtotal = buyNowItem
    ? Number(buyNowItem.price || 0)
    : parseFloat(getCartTotal())

  const tax = subtotal * 0.18 // 18% GST
  const shipping = subtotal > 500 ? 0 : 50 // Free shipping above ₹500
  const total = subtotal + tax + shipping

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in to continue')
      return
    }

    setLoading(true)

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway')
        return
      }

      // Create order on backend
      const orderResponse = await axios.post('/api/payment/create-order', {
        amount: total
      })

      if (!orderResponse.data.success) {
        toast.error('Failed to create payment order')
        return
      }

      const { data: order, key_id } = orderResponse.data

      // Prepare order data for verification
      const orderData = {
        items: currentCart, // usage of new variable
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        identityFormId: location.state?.idData?.identityFormId || null
      }

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Shivalik Service Hub',
        description: 'Payment for your order',
        order_id: order.id,
        handler: async (response) => {
          setOrderProcessing(true)
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post('/api/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderData
            })

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Order placed.')
              // Clear cart after successful payment
              await clearCart()
              // Redirect to order confirmation or account page
              navigate('/account', {
                state: {
                  orderSuccess: true,
                  orderId: verifyResponse.data.orderId
                }
              })
            } else {
              toast.error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
          } finally {
            setOrderProcessing(false)
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: userAddress?.phone || ''
        },
        notes: {
          address: userAddress ? `${userAddress.line1}, ${userAddress.city}` : ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled')
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error.response?.data?.message || 'Payment failed'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if ((!cart || cart.length === 0) && !buyNowItem) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Payment</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg p-6 shadow-lg h-fit`}>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              {currentCart.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-semibold">
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg p-6 shadow-lg h-fit`}>
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

            {addressLoading ? (
              <div className="mb-6">
                <div className="animate-pulse bg-gray-300 h-4 w-32 mb-2 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
              </div>
            ) : userAddress ? (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg text-sm`}>
                  <p className="font-medium">{userAddress.fullName}</p>
                  <p>{userAddress.phone}</p>
                  <p>{userAddress.line1}</p>
                  {userAddress.line2 && <p>{userAddress.line2}</p>}
                  <p>{userAddress.city}, {userAddress.state} {userAddress.postalCode}</p>
                  <p>{userAddress.country}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/checkout/address')
                  }}
                  className="text-blue-600 text-sm mt-2 hover:underline"
                >
                  Change Address
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className={`${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border p-4 rounded-lg mb-4`}>
                  <p className="text-red-800">Please add a shipping address before proceeding with payment.</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/checkout/address')
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Address
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-5 bg-blue-600 rounded"></div>
                  <span className="font-medium">Razorpay Secure Payment</span>
                </div>
                <p className="text-sm text-gray-600">Pay securely using Credit Card, Debit Card, Net Banking, UPI, or Wallet</p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || orderProcessing || !userAddress || addressLoading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${loading || orderProcessing || !userAddress || addressLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {orderProcessing ? (
                  'Processing Order...'
                ) : loading ? (
                  'Loading Payment...'
                ) : (
                  `Pay ₹${total.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By clicking "Pay", you agree to our terms and conditions. Your payment information is secured with 256-bit SSL encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
