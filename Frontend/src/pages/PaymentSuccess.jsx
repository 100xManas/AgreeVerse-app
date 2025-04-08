import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag, Download } from "lucide-react";
import confetti from "canvas-confetti";

const PaymentSuccess = () => {
  const { state } = useLocation();

  const { orderId, paymentId, paymentMethod, amount } = state || {};

  useEffect(() => {
    // Launch confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  });

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-green-500 p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
          <p className="text-green-100 mt-1">Your order has been confirmed</p>
        </div>

        {/* Order Details */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-700 pb-3">
              <span className="text-gray-400">Order ID</span>
              <span className="font-semibold text-white">{orderId}</span>
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-3">
              <span className="text-gray-400">Date</span>
              <span className="font-semibold text-white">{new Date().toLocaleString()}</span>
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-3">
              <span className="text-gray-400">Payment ID</span>
              <span className="font-semibold text-white">
                {paymentId}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-700 pb-3">
              <span className="text-gray-400">Amount Paid</span>
              <span className="font-semibold text-white">
                ₹{parseFloat(amount).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Payment Method</span>
              <span className="font-semibold text-white">{paymentMethod || "Razorpay"}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/user/home" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md flex items-center justify-center transition-colors">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Link>

              <Link to="/" className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition-colors">
                <ShoppingBag className="mr-2 h-5 w-5" />
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-gray-400 text-center max-w-md">
        <p>A confirmation email has been sent to your registered email address.</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;