import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCheckout } from '../redux/slices/checkoutSlice';
import { clearCart } from '../redux/slices/cartSlice';
import axios from 'axios';

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkout } = useSelector((state) => state.checkout);
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const checkoutId = localStorage.getItem("checkoutId");

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  // Confirm payment by sending sessionId to backend to verify and update checkout
  const confirmPayment = async (sessionId, checkoutId) => {
    try {
      // Call backend route to mark payment as paid and fetch payment details
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        { sessionId, paymentStatus: "paid" }, // backend should accept sessionId & verify
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      // Finalize order on backend
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      // Clear cart locally
      dispatch(clearCart());
      localStorage.removeItem("cart");

      // Load updated checkout info
      dispatch(getCheckout(checkoutId));

    } catch (error) {
      console.error("Error confirming payment:", error);
      // Optionally, navigate to error or cancel page
      navigate("/purchase-cancel");
    }
  };

  useEffect(() => {
    if (sessionId && checkoutId) {
      confirmPayment(sessionId, checkoutId);
    } else {
      // If missing sessionId or checkoutId, redirect back or show error
      navigate("/");
    }
  }, [sessionId, checkoutId, dispatch, navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white mt-16">
      <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
        Thank You for Your Order!
      </h1>
      {checkout ? (
        <div className="p-6 rounded-lg border">
          <div className="flex justify-between mb-20">
            <div>
              <h2 className="text-xl font-semibold">Order ID: {checkout._id}</h2>
              <p className="text-gray-500">
                Order Date: {new Date(checkout.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-emerald-700 text-sm">
                Estimated Delivery: {calculateEstimatedDelivery(checkout.createdAt)}
              </p>
            </div>
          </div>

          <div className="mb-20">
            {checkout.checkoutItems.map((item) => (
              <div key={item.productId} className="flex items-center mb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h4 className="text-md font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    {item.color} | {item.size}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-md">${item.price}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-2">Payment</h4>
              <p className="text-gray-600">{checkout.paymentMethod}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Delivery</h4>
              <p className="text-gray-600">{checkout.shippingAddress.address}</p>
              <p className="text-gray-600">
                {checkout.shippingAddress.city}, {checkout.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading order details...</p>
      )}
    </div>
  );
};

export default OrderConfirmationPage;
