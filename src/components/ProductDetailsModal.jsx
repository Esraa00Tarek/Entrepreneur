import React, { useState } from 'react';
import { X, Star, Package, ShoppingCart, Users, Calendar, Award, Truck, AlertTriangle, TrendingUp, Eye, ChevronRight, XCircle } from 'lucide-react';

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  const [showOrdersList, setShowOrdersList] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showShippingPage, setShowShippingPage] = useState(false);
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      entrepreneur: 'Ahmed Mohamed',
      company: 'Success Furniture Company',
      quantity: 5,
      orderDate: '2024-01-15',
      status: 'pending',
      totalAmount: 1495,
      address: 'Cairo, Heliopolis, Al-Hegaz Street 45',
      phone: '+20 100 123 4567'
    },
    {
      id: 'ORD-002',
      entrepreneur: 'Fatima Ahmed',
      company: 'Creative Trading Foundation',
      quantity: 3,
      orderDate: '2024-01-14',
      status: 'pending',
      totalAmount: 897,
      address: 'Giza, Mohandessin, Arab League Street 12',
      phone: '+20 101 234 5678'
    },
    {
      id: 'ORD-003',
      entrepreneur: 'Mohamed Ali',
      company: 'Modern Vision Company',
      quantity: 8,
      orderDate: '2024-01-13',
      status: 'pending',
      totalAmount: 2392,
      address: 'Alexandria, Smouha, Fouad Street 78',
      phone: '+20 102 345 6789'
    }
  ]);

  if (!isOpen || !product) return null;

  const productImages = [
    'https://images.pexels.com/photos/586999/pexels-photo-586999.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];

  const shippingCompanies = [
    { id: 1, name: 'Aramex', cost: 50, estimatedDays: '2-3' },
    { id: 2, name: 'FedEx', cost: 75, estimatedDays: '1-2' },
    { id: 3, name: 'DHL', cost: 80, estimatedDays: '1-2' },
    { id: 4, name: 'Egypt Post', cost: 25, estimatedDays: '5-7' }
  ];

  const specifications = [
    { label: 'Material', value: 'Premium Leather & Steel' },
    { label: 'Dimensions', value: '66cm × 71cm × 107-117cm' },
    { label: 'Weight Capacity', value: '136 kg' },
    { label: 'Warranty', value: '5 Years' },
    { label: 'Color Options', value: 'Black, Brown, Gray' },
    { label: 'Assembly Required', value: 'Yes (Tools Included)' },
  ];

  const handleViewOrders = () => {
    setShowOrdersList(true);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setShowShippingPage(true);
    setShowOrdersList(false);
  };

  const handleDeclineOrder = (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
      setShowShippingPage(false);
      setShowOrdersList(true);
    }
  };

  const handleBackToOrders = () => {
    setShowShippingPage(false);
    setShowOrdersList(true);
    setSelectedOrder(null);
  };

  const handleBackToProduct = () => {
    setShowOrdersList(false);
    setShowShippingPage(false);
    setSelectedOrder(null);
  };

  const handleCloseModal = () => {
    setShowOrdersList(false);
    setShowShippingPage(false);
    setSelectedOrder(null);
    onClose();
  };

  // Orders List View
  if (showOrdersList) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={handleCloseModal} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handleBackToProduct} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Product Orders</h2>
                  <p className="text-gray-600">{product.name}</p>
                </div>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Orders</h3>
                  <p className="text-gray-600">All orders have been processed or declined</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{order.entrepreneur}</h3>
                          <p className="text-gray-600">{order.company}</p>
                          <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${order.totalAmount}</p>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-semibold text-gray-900">{order.quantity}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Order Date</p>
                          <p className="font-semibold text-gray-900">{order.orderDate}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold text-gray-900">{order.phone}</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <Truck className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold text-gray-900">Ready to Ship</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 flex-1">{order.address}</p>
                        <div className="flex items-center gap-2 ml-4">
                          <button 
                            onClick={() => handleSelectOrder(order)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                          >
                            <Truck className="w-4 h-4" />
                            Ship Order
                          </button>
                          <button 
                            onClick={() => handleDeclineOrder(order.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Shipping Page View
  if (showShippingPage && selectedOrder) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={handleCloseModal} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200">
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handleBackToOrders} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Management</h2>
                  <p className="text-gray-600">Order ID: {selectedOrder.id}</p>
                </div>
              </div>
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <p className="text-gray-700">{selectedOrder.entrepreneur}</p>
                    <p className="text-gray-600">{selectedOrder.company}</p>
                    <p className="text-gray-600">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <p className="text-gray-700">{selectedOrder.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Quantity Ordered</p>
                    <p className="text-xl font-bold text-gray-900">{selectedOrder.quantity}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">${selectedOrder.totalAmount}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="text-xl font-bold text-gray-900">{selectedOrder.orderDate}</p>
                  </div>
                </div>
                {/* Profit/Commission Section */}
                {selectedOrder.totalAmount && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div></div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700 font-medium">Platform Commission (2%)</p>
                      <p className="text-lg font-bold text-yellow-800">
                        ${ (selectedOrder.totalAmount * 0.02).toFixed(2) }
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">Net Amount</p>
                      <p className="text-lg font-bold text-green-800">
                        ${ (selectedOrder.totalAmount * 0.98).toFixed(2) }
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  * A 2% platform commission is applied to every successful deal.
                </div>
              </div>
              {/* Product Info */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                <div className="flex items-center gap-4">
                  <img src={productImages[0]} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-gray-600">{product.category}</p>
                    <p className="text-lg font-bold text-gray-900">${product.price} per unit</p>
                  </div>
                </div>
              </div>
              {/* Shipping Companies */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Shipping Company</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingCompanies.map((company) => (
                    <div key={company.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{company.name}</h4>
                        <span className="text-lg font-bold text-gray-900">${company.cost}</span>
                      </div>
                      <p className="text-sm text-gray-600">Delivery time: {company.estimatedDays} days</p>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-600">Live tracking</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Shipping Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Shipping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Will be generated automatically" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Shipping Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="3" placeholder="Any special shipping notes..."></textarea>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                    <Truck className="w-5 h-5" />
                    Confirm Shipping
                  </button>
                  <button 
                    onClick={() => handleDeclineOrder(selectedOrder.id)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Decline Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Product Details View
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={handleCloseModal} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <button onClick={handleCloseModal} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Images */}
            <div className="lg:w-1/2 p-6">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img src={productImages[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-3">
                  {productImages.slice(1).map((image, index) => (
                    <div key={index} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={image} alt={`${product.name} ${index + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Side - Details */}
            <div className="lg:w-1/2 p-6 overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    {product.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{product.category}</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{product.rating}</span>
                  <span className="text-gray-500">({product.orders} reviews)</span>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                </div>
              </div>
              {/* Supplier Dashboard Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Available Stock</p>
                    <p className="text-xl font-bold text-gray-900">{product.stock}</p>
                    {product.stock < 20 && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-orange-600">Low stock</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">{product.orders}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">+12% this month</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Pending Orders Alert */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Pending Orders</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  You have {orders.length} new orders that need review and shipping
                </p>
                <button 
                  onClick={handleViewOrders}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Orders
                </button>
              </div>
              {/* Specifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="space-y-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">{spec.label}</span>
                      <span className="font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={handleViewOrders}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  Ship To
                </button>
                <button className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors duration-200">
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal; 