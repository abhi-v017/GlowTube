"use client";
import { useState } from "react";
import { createSubscription, handleRazorpayPayment, getPlanDetails } from "../utils/razorpay";

export default function PaymentModal({ isOpen, onClose, planId, user, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const planKey = planId;
    const plan = getPlanDetails(planKey) || { name: 'Selected Plan', price: '', features: [] };

    const handlePayment = async () => {
        if (!user || !user.token) {
        setError("User not authenticated");
        return;
        }

        setLoading(true);
        setError(null);

        try {
        // Create subscription on backend using simple planKey
        const subscription = await createSubscription(planKey, user.token);
        
        // Handle Razorpay payment
        const paymentResponse = await handleRazorpayPayment(
            subscription.id,
            user.email,
            user.name || user.email
        );

        // Payment successful
        onSuccess(paymentResponse);
        onClose();
        
        } catch (error) {
        console.error('Payment failed:', error);
        setError(error.message || 'Payment failed. Please try again.');
        } finally {
        setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
                Complete Your Subscription
            </h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
            >
                ×
            </button>
            </div>

            <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                {plan.name} {plan.price ? `- ₹${plan.price}/month` : ''}
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                {plan.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                ))}
                </ul>
            </div>
            </div>

            {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
            </div>
            )}

            <div className="flex space-x-4">
            <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
            >
                Cancel
            </button>
            <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                </div>
                ) : (
                plan.price ? `Pay ₹${plan.price}` : 'Pay'
                )}
            </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
            Secure payment powered by Razorpay. Cancel anytime.
            </p>
        </div>
        </div>
    );
}
