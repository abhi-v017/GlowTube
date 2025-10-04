"use client";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import userService from "../../services/userServices";
import { updateProfile } from "../../store/authSlice";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import PaymentModal from "../../components/PaymentModal";

export default function PricingPage() {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.auth);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState("pro");
    const user = useMemo(() => {
        if (!userData) return null;
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        return {
            email: userData.email,
            name: userData.fullName || userData.email,
            token: accessToken
        };
    }, [userData]);

    const plans = [
        {
        id: "free",
        name: "Free",
        price: 0,
        credits: 10,
        features: [
            "10 AI generations per month",
            "Basic thumbnail generation",
            "Basic description generation",
            "Community support"
        ],
        buttonText: "Current Plan",
        buttonStyle: "bg-gray-400 cursor-not-allowed"
        },
        {
        id: "pro",
        name: "Pro",
        price: 99,
        credits: 100,
        features: [
            "100 AI generations per month",
            "Premium thumbnail generation",
            "Advanced description generation",
            "Priority support",
            "Custom templates",
            "Bulk generation"
        ],
        buttonText: "Upgrade to Pro",
        buttonStyle: "bg-blue-600 hover:bg-blue-700"
        },
        {
        id: "agency",
        name: "Agency",
        price: 999,
        credits: 500,
        features: [
        "500 AI generations per month",
        "All Pro features",
        "White-label solution",
        "API access",
        "Dedicated support",
        "Custom integrations"
        ],
        buttonText: "Upgrade to Agency",
        buttonStyle: "bg-purple-600 hover:bg-purple-700"
        }
    ];


    const handleSubscribe = async (planId) => {
        if (planId === "free") return;
        
        // Set the current plan ID and show payment modal
        setCurrentPlanId(planId);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (paymentResponse) => {
        console.log('Payment successful:', paymentResponse);
        
        // Close modal immediately
        setShowPaymentModal(false);
        
        // Check if we have immediate payment confirmation data
        if (paymentResponse.userData) {
            // Update user data immediately with confirmed payment info
            dispatch(updateProfile(paymentResponse.userData));
            alert(`Account successfully upgraded to ${paymentResponse.userData.planType.toUpperCase()}! You now have ${paymentResponse.userData.creditsLeft} credits.`);
        } else {
            // Fallback: Show success message and try to refresh user data
            alert('Payment successful! Your account is being upgraded...');
            
            // Wait a bit for webhook to process, then refresh user data
            setTimeout(async () => {
                try {
                    const updatedUser = await userService.getCurrentUser();
                    if (updatedUser) {
                        dispatch(updateProfile(updatedUser));
                        alert('Account successfully upgraded! Your new plan and credits are now active.');
                    }
                } catch (e) {
                    console.error('Failed to refresh user data:', e);
                    alert('Payment was successful, but there was an issue updating your account. Please refresh the page.');
                }
            }, 3000); // Wait 3 seconds for webhook processing
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-gray-600">
                    Boost your YouTube channel with AI-powered tools
                </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <div
                    key={plan.id}
                    className="bg-white rounded-2xl shadow-lg p-8 relative transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-102 hover:-translate-y-1"
                    >
                    {plan.id === "pro" && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Most Popular
                        </span>
                        </div>
                    )}

                    <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                        </h3>
                        <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                            ₹{plan.price}
                        </span>
                        <span className="text-gray-600">/month</span>
                        </div>
                        <p className="text-gray-600">
                        {plan.credits} AI generations
                        </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <svg
                            className="w-5 h-5 text-green-500 mr-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                        </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full py-3 px-6 rounded-xl text-white font-medium transition-all duration-200 ${
                        plan.id === "free"
                            ? plan.buttonStyle
                            : plan.buttonStyle + " hover:shadow-lg hover:scale-105"
                        }`}
                        disabled={plan.id === "free"}
                    >
                        {plan.buttonText}
                    </button>
                    </div>
                ))}
            </div>

            <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                    Need a custom plan?{" "}
                    <Link href="/contact" className="text-blue-600 hover:underline">
                    Contact us
                    </Link>
                </p>
                <div className="flex justify-center space-x-8 text-sm text-gray-500">
                    <span>✓ Cancel anytime</span>
                    <span>✓ 30-day money back</span>
                    <span>✓ Secure payments</span>
                </div>
                </div>
            </div>

        {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                planId={currentPlanId}
                user={user}
                onSuccess={handlePaymentSuccess}
            />
            </div>
        </div>
    );
}
