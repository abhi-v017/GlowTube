"use client";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "../store/authSlice";
import userService from "../services/userServices";

export default function Navbar() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { status, userData } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            await userService.logout();
            dispatch(logout());
            router.push('/pages/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still logout locally even if API call fails
            dispatch(logout());
            router.push('/pages/login');
        }
    };

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="flex gap-6">
                <Link href="/" className="hover:text-blue-400 transition-colors">
                    Home
                </Link>
                <Link href="/pages/pricing" className="hover:text-blue-400 transition-colors">
                    Pricing
                </Link>
                {status && userData && (
                    <Link href="/pages/dashboard" className="hover:text-blue-400 transition-colors">
                        Dashboard
                    </Link>
                )}
            </div>
            <div className="flex gap-4">
                {status && userData ? (
                    // Show user info and logout when logged in
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">
                            Welcome, {userData.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    // Show login/signup when not logged in
                    <>
                        <Link 
                            href="/pages/login" 
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link 
                            href="/pages/signup" 
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
