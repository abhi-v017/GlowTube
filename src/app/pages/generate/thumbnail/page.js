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

export default function GenerateThumbnail() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { status, userData } = useSelector((state) => state.auth);
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        style: "modern",
        colorScheme: "vibrant",
        includeText: true,
        textPosition: "center"
    });
    
    const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
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
            setError("You don't have enough credits to generate thumbnails. Please upgrade your plan.");
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
            setError("You don't have enough credits to generate thumbnails.");
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
            const response = await generateService.generateThumbnail({
                title: formData.title,
                description: formData.description,
                style: formData.style,
                colorScheme: formData.colorScheme,
                includeText: formData.includeText,
                textPosition: formData.textPosition
            });

            if (response) {
                setGeneratedThumbnails(prev => [response, ...prev]);
                // Refresh user data to get updated credits
                const updatedUser = await userService.getCurrentUser();
                if (updatedUser) {
                    dispatch(updateProfile(updatedUser));
                }
                setError("");
            } else {
                setError("Failed to generate thumbnail. Please try again.");
            }
        } catch (error) {
            console.error('Generation error:', error);
            setError("An error occurred while generating the thumbnail.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (thumbnailUrl, title) => {
        const link = document.createElement('a');
        link.href = thumbnailUrl;
        link.download = `thumbnail-${title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Thumbnail</h1>
                    <p className="text-gray-600">Create eye-catching thumbnails for your YouTube videos</p>
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
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thumbnail Settings</h2>
                        
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
                                    Video Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief description of your video content"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Style
                                </label>
                                <select
                                    name="style"
                                    value={formData.style}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    <option value="modern">Modern</option>
                                    <option value="vintage">Vintage</option>
                                    <option value="minimalist">Minimalist</option>
                                    <option value="bold">Bold</option>
                                    <option value="elegant">Elegant</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Color Scheme
                                </label>
                                <select
                                    name="colorScheme"
                                    value={formData.colorScheme}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    <option value="vibrant">Vibrant</option>
                                    <option value="monochrome">Monochrome</option>
                                    <option value="pastel">Pastel</option>
                                    <option value="dark">Dark</option>
                                    <option value="warm">Warm</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="includeText"
                                    checked={formData.includeText}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-black">
                                    Include text overlay
                                </label>
                            </div>

                            {formData.includeText && (
                                <div>
                                        <label className="block text-sm font-medium text-black mb-2">
                                        Text Position
                                    </label>
                                    <select
                                        name="textPosition"
                                        value={formData.textPosition}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    >
                                        <option value="center">Center</option>
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            )}

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
                                {loading ? "Generating..." : "Generate Thumbnail"}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generated Thumbnails</h2>
                        
                        {generatedThumbnails.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No thumbnails generated yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Fill out the form and click generate to create your first thumbnail.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {generatedThumbnails.map((thumbnail, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                            {thumbnail.output?.imageUrl ? (
                                                <img 
                                                    src={thumbnail.output.imageUrl} 
                                                    alt={`Generated thumbnail ${index + 1}`}
                                                    className="max-w-full max-h-full object-contain rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-gray-500">
                                                    {thumbnail.status === 'pending' ? 'Generating...' : 'Thumbnail preview'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">{thumbnail.input?.title || 'Generated Thumbnail'}</p>
                                                <p className="text-sm text-gray-500">
                                                    {thumbnail.status === 'success' ? 'Generated' : 
                                                     thumbnail.status === 'pending' ? 'Generating...' : 
                                                     'Failed'}
                                                </p>
                                            </div>
                                            {thumbnail.output?.imageUrl && (
                                                <button
                                                    onClick={() => handleDownload(thumbnail.output.imageUrl, thumbnail.input?.title)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Download
                                                </button>
                                            )}
                                        </div>
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
