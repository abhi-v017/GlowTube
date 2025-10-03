"use client";
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import PaymentModal from "../../components/PaymentModal";
import GenerationDetailModal from "../../components/GenerationDetailModal";
import generateService from "../../services/generateServices.js";
import userService from "../../services/userServices.js";
import { updateProfile } from "../../store/authSlice";

export default function Dashboard() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { status, userData } = useSelector((state) => state.auth);
    const [generations, setGenerations] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [selectedGeneration, setSelectedGeneration] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!status || !userData) {
            router.push('/pages/login');
            return;
        }
    }, [status, userData, router]);

    const refreshUserData = useCallback(async () => {
        try {
            const updatedUser = await userService.getCurrentUser();
            if (updatedUser) {
                dispatch(updateProfile(updatedUser));
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    }, [dispatch]);

    useEffect(() => {
        const fetchGenerates = async () => {
            if (!userData) return;
            
            setLoading(true);
            try {
                const response = await generateService.getAllGenerates();
                if (response) {
                    setGenerations(response || []);
                }
                // Refresh user data to get updated credits
                await refreshUserData();
            } catch (error) {
                console.error('Error fetching generations:', error);
                setGenerations([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (userData) {
            fetchGenerates();
        }
    }, [userData, refreshUserData]);

    const handleUpgrade = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (paymentResponse) => {
        console.log('Payment successful:', paymentResponse);
        
        // Show immediate success message
        alert('Payment successful! Your account is being upgraded. Please wait a moment for the changes to reflect.');
        
        // Close modal immediately
        setShowPaymentModal(false);
        
        // Wait a bit for webhook to process, then refresh user data
        setTimeout(async () => {
            try {
                await refreshUserData();
                alert('Account successfully upgraded! Your new plan and credits are now active.');
            } catch (e) {
                console.error('Failed to refresh user data:', e);
                alert('Payment was successful, but there was an issue updating your account. Please refresh the page.');
            }
        }, 3000); // Wait 3 seconds for webhook processing
    };

    const handleGenerationClick = (generation) => {
        setSelectedGeneration(generation);
        setShowGenerationModal(true);
    };

    const handleCloseGenerationModal = () => {
        setShowGenerationModal(false);
        setSelectedGeneration(null);
    };


    const getPlanColor = (planType) => {
        switch (planType) {
        case 'free': return 'bg-gray-100 text-gray-800';
        case 'pro': return 'bg-blue-100 text-blue-800';
        case 'agency': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCreditsColor = (creditsLeft) => {
        if (creditsLeft > 50) return 'text-green-600';
        if (creditsLeft > 10) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Show loading if not authenticated or still loading data
    if (!status || !userData || loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
        <Navbar />
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
                <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {userData?.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(userData?.planType)}`}>
                    {userData?.planType?.toUpperCase()}
                </span>
                <Link
                    href="/pages/pricing"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Upgrade Plan
                </Link>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    </div>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Credits Left</p>
                    <p className={`text-2xl font-semibold ${getCreditsColor(userData?.creditsLeft)}`}>
                    {userData?.creditsLeft}
                    </p>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    </div>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Generations</p>
                    <p className="text-2xl font-semibold text-gray-900">{generations.length}</p>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    </div>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">98%</p>
                </div>
                </div>
            </div>
            </div>

            {/* Plan Upgrade Banner */}
            {userData?.planType === 'free' && userData?.creditsLeft < 5 && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Running low on credits?</h3>
                    <p className="text-blue-100">
                    Upgrade to Pro and get 100 credits plus premium features!
                    </p>
                </div>
                <button
                    onClick={handleUpgrade}
                    className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                    Upgrade Now
                </button>
                </div>
            </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/pages/generate/thumbnail"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    </div>
                    <div>
                    <h3 className="font-medium text-gray-900">Generate Thumbnail</h3>
                    <p className="text-sm text-gray-600">Create eye-catching thumbnails</p>
                    </div>
                </Link>

                <Link
                    href="/pages/generate/description"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    </div>
                    <div>
                    <h3 className="font-medium text-gray-900">Generate Description</h3>
                    <p className="text-sm text-gray-600">Write compelling descriptions</p>
                    </div>
                </Link>
                </div>
            </div>
            </div>

            {/* Recent Generations */}
            <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Generations</h2>
            </div>
            <div className="p-6">
                {generations.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No generations yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first AI generation.</p>
                </div>
                ) : (
                <div className="space-y-4">
                    {generations.map((generation, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleGenerationClick(generation)}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                            {generation.type === 'thumbnail' ? (
                                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 capitalize">{generation.type}</p>
                            <p className="text-sm text-gray-600">
                                {generation.input?.title || 'Generated Content'} • {new Date(generation.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                generation.status === 'success' 
                                    ? 'bg-green-100 text-green-800' 
                                    : generation.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {generation.status}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            planId={'pro'}
            user={{
                email: userData?.email,
                name: userData?.fullName || userData?.email,
                token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
            }}
            onSuccess={handlePaymentSuccess}
        />

        {/* Generation Detail Modal */}
        <GenerationDetailModal
            isOpen={showGenerationModal}
            onClose={handleCloseGenerationModal}
            generation={selectedGeneration}
        />
        </div>
    );
}