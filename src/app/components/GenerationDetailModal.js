"use client";
import { useState } from "react";
import Image from "next/image";

export default function GenerationDetailModal({ isOpen, onClose, generation }) {
    if (!isOpen || !generation) return null;

    const handleDownload = (imageUrl, title) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `thumbnail-${title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success': return 'Completed';
            case 'pending': return 'Generating...';
            case 'failed': return 'Failed';
            default: return 'Unknown';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {generation.type === 'thumbnail' ? 'Thumbnail Generation' : 'Description Generation'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {generation.input?.title || 'Generated Content'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Status and Info */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(generation.status)}`}>
                                {getStatusText(generation.status)}
                            </span>
                            <span className="text-sm text-gray-500">
                                Created: {new Date(generation.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Input Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Details</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <p className="text-sm text-gray-900">{generation.input?.title || 'N/A'}</p>
                                </div>
                                {generation.type === 'thumbnail' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Style</label>
                                            <p className="text-sm text-gray-900">{generation.input?.style || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Color Scheme</label>
                                            <p className="text-sm text-gray-900">{generation.input?.colorScheme || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Include Text</label>
                                            <p className="text-sm text-gray-900">{generation.input?.includeText ? 'Yes' : 'No'}</p>
                                        </div>
                                    </>
                                )}
                                {generation.type === 'description' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Topic</label>
                                            <p className="text-sm text-gray-900">{generation.input?.topic || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Duration</label>
                                            <p className="text-sm text-gray-900">{generation.input?.duration || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                                            <p className="text-sm text-gray-900">{generation.input?.targetAudience || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tone</label>
                                            <p className="text-sm text-gray-900">{generation.input?.tone || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Output */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Output</h3>
                        
                        {generation.status === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                                <p className="text-yellow-800">Generation in progress...</p>
                            </div>
                        )}

                        {generation.status === 'failed' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-red-800">Generation failed. Please try again.</p>
                            </div>
                        )}

                        {generation.status === 'success' && (
                            <>
                                {generation.type === 'thumbnail' && generation.output?.imageUrl && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <Image 
                                                src={generation.output.imageUrl} 
                                                alt="Generated thumbnail"
                                                width={800}
                                                height={450}
                                                className="max-w-full h-auto rounded-lg mx-auto"
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleDownload(generation.output.imageUrl, generation.input?.title)}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Download Thumbnail
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {generation.type === 'description' && generation.output?.description && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                                {generation.output.description}
                                            </pre>
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleCopy(generation.output.description)}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Copy Description
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!generation.output && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                        <p className="text-gray-500">No output available</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
