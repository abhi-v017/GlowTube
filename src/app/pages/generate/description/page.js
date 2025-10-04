"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import generateService from "../../../services/generateServices";
import userService from "../../../services/userServices";
import { updateProfile } from "../../../store/authSlice";
import NoCreditsModal from "../../../components/NoCreditsModal";

export default function GenerateDescription() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { status, userData } = useSelector((state) => state.auth);
    
    const [formData, setFormData] = useState({
        title: "",
        topic: "",
        duration: "",
        targetAudience: "general",
        tone: "professional",
        includeHashtags: true,
        includeCallToAction: true,
        maxLength: "medium"
    });
    
    const [generatedDescriptions, setGeneratedDescriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showNoCredits, setShowNoCredits] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!status || !userData) {
            router.push('/pages/login');
            return;
        }
    }, [status, userData, router]);

    // Check if user has credits
    useEffect(() => {
        if (userData && userData.creditsLeft <= 0) {
            setError("You don't have enough credits to generate descriptions. Please upgrade your plan.");
            setShowNoCredits(true);
        } else {
            setShowNoCredits(false);
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        
        if (!userData || userData.creditsLeft <= 0) {
            setError("You don't have enough credits to generate descriptions.");
            setShowNoCredits(true);
            return;
        }

        if (!formData.title.trim()) {
            setError("Please enter a video title.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await generateService.generateDescription({
                title: formData.title,
                topic: formData.topic,
                duration: formData.duration,
                targetAudience: formData.targetAudience,
                tone: formData.tone,
                includeHashtags: formData.includeHashtags,
                includeCallToAction: formData.includeCallToAction,
                maxLength: formData.maxLength
            });

            if (response) {
                // Check if response includes updated credits (new backend response format)
                if (response.updatedCredits !== undefined) {
                    // Immediately update credits in Redux store
                    dispatch(updateProfile({ ...userData, creditsLeft: response.updatedCredits }));
                } else {
                    // Fallback: Refresh user data to get updated credits
                    const updatedUser = await userService.getCurrentUser();
                    if (updatedUser) {
                        dispatch(updateProfile(updatedUser));
                    }
                }
                
                setGeneratedDescriptions(prev => [response.generate || response, ...prev]);
                setError("");
            } else {
                setError("Failed to generate description. Please try again.");
            }
        } catch (error) {
            console.error('Generation error:', error);
            setError("An error occurred while generating the description.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const getWordCount = (text) => {
        return text ? text.split(' ').length : 0;
    };

    if (!status || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Description</h1>
                    <p className="text-gray-600">Create compelling YouTube video descriptions that engage your audience</p>
                    <div className="mt-4 flex items-center gap-4">
                        <span className="text-sm text-gray-500">Credits left: </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userData.creditsLeft > 10 ? 'bg-green-100 text-green-800' : 
                            userData.creditsLeft > 0 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                        }`}>
                            {userData.creditsLeft}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Description Settings</h2>
                        
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Video Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter your video title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Video Topic/Subject
                                </label>
                                <input
                                    type="text"
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleInputChange}
                                    placeholder="What is your video about?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Video Duration
                                </label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    <option value="">Select duration</option>
                                    <option value="short">Short (1-3 minutes)</option>
                                    <option value="medium">Medium (4-10 minutes)</option>
                                    <option value="long">Long (11-20 minutes)</option>
                                    <option value="extended">Extended (20+ minutes)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Target Audience
                                </label>
                                <select
                                    name="targetAudience"
                                    value={formData.targetAudience}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    <option value="general">General Audience</option>
                                    <option value="beginners">Beginners</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="professionals">Professionals</option>
                                    <option value="students">Students</option>
                                    <option value="parents">Parents</option>
                                    <option value="entrepreneurs">Entrepreneurs</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Tone
                                </label>
                                <select
                                    name="tone"
                                    value={formData.tone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="friendly">Friendly</option>
                                    <option value="authoritative">Authoritative</option>
                                    <option value="humorous">Humorous</option>
                                    <option value="educational">Educational</option>
                                    <option value="inspirational">Inspirational</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Description Length
                                </label>
                                <select
                                    name="maxLength"
                                    value={formData.maxLength}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    <option value="short">Short (50-100 words)</option>
                                    <option value="medium">Medium (100-200 words)</option>
                                    <option value="long">Long (200-400 words)</option>
                                    <option value="extended">Extended (400+ words)</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="includeHashtags"
                                        checked={formData.includeHashtags}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                        <label className="ml-2 block text-sm text-black">
                                        Include relevant hashtags
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="includeCallToAction"
                                        checked={formData.includeCallToAction}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                        <label className="ml-2 block text-sm text-black">
                                        Include call-to-action
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || userData.creditsLeft <= 0}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? "Generating... (This may take up to 2 minutes on free tier)" : "Generate Description"}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generated Descriptions</h2>
                        
                        {generatedDescriptions.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No descriptions generated yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Fill out the form and click generate to create your first description.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {generatedDescriptions.map((description, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{description.input?.title || 'Generated Description'}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {description.status === 'success' ? 'Generated' : 
                                                        description.status === 'pending' ? 'Generating...' : 
                                                        'Failed'} • {getWordCount(description.output?.description)} words
                                                </p>
                                            </div>
                                            {description.output?.description && (
                                                <button
                                                    onClick={() => handleCopy(description.output.description)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Copy
                                                </button>
                                            )}
                                        </div>
                                        
                                        {description.output?.description ? (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                                    {description.output.description}
                                                </pre>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                                                {description.status === 'pending' ? 'Generating description...' : 'Description not available'}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="mt-8 text-center">
                    <Link 
                        href="/pages/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
            <NoCreditsModal isOpen={showNoCredits} onClose={() => setShowNoCredits(false)} />
        </div>
    );
}
