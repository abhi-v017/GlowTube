import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            🎨 AI Thumbnail & Description Generator
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            Boost your YouTube channel with AI-powered tools that create compelling thumbnails and descriptions
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/pages/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Get Started Free
            </Link>
            <Link
              href="/pages/pricing"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-lg font-medium"
            >
              View Pricing
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">AI Thumbnails</h3>
              <p className="text-gray-600">
                Generate eye-catching thumbnails that increase click-through rates
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Smart Descriptions</h3>
              <p className="text-gray-600">
                Create SEO-optimized descriptions that boost discoverability
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Get results in seconds, not hours. Focus on creating great content
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
