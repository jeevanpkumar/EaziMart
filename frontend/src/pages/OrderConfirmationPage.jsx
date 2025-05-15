import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { getCheckout } from '../redux/slices/checkoutSlice';
import { clearCart } from '../redux/slices/cartSlice';
import axios from 'axios';

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkout } = useSelector((state) => state.checkout);
  const [loading, setLoading] = useState(true);

  const stripeSessionId = localStorage.getItem("stripeId");

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  const handlePaymentSuccess = async (details, checkoutId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        {
          paymentStatus: "paid",
          paymentDetails: details,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      await handleFinalizeCheckout(checkoutId);
    } catch (error) {
      console.error("Error in HandlePaymentSuccess:", error);
    }
  };

  const handleFinalizeCheckout = async (checkoutId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error in Finalize Checkout:", error);
    }
  };

  useEffect(() => {
    const orderSuccess = async () => {
      try {
        if (!stripeSessionId) {
          console.error("No Stripe session ID found.");
          setLoading(false);
          return;
        }

        // Get checkout object using Stripe session ID
        const { data: checkout } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/checkout/stripe/${stripeSessionId}`
        );

        // Call payment & finalize logic
        await handlePaymentSuccess(stripeSessionId, checkout._id);

        // Fetch full checkout info via Redux
        dispatch(getCheckout(checkout._id));
        dispatch(clearCart());

        // Clean up localStorage
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutId");
        localStorage.removeItem("stripeId");

        setLoading(false);
      } catch (error) {
        console.error("Error fetching checkout by Stripe ID:", error);
        setLoading(false);
      }
    };

    orderSuccess();
  }, [dispatch, stripeSessionId]);

  if (loading) {
    return <p className="text-center mt-20">Processing your order...</p>;
  }

  if (!checkout) {
    return <p className="text-center mt-20 text-red-500">Order not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white mt-16">
      <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
        Thank You for Your Order!
      </h1>
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
    </div>
  );
};

export default OrderConfirmationPage;
