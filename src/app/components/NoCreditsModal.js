"use client";
import { useRouter } from "next/navigation";

export default function NoCreditsModal({ isOpen, onClose }) {
    const router = useRouter();

    if (!isOpen) return null;

    const goToPricing = () => {
        onClose && onClose();
        router.push("/pages/pricing");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-lg">
                <div className="px-6 py-5">
                    <h3 className="text-xl font-semibold text-gray-900">No credits left</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        You don&apos;t have enough credits to continue. Upgrade your plan to get more credits.
                    </p>
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={goToPricing}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                            View pricing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

