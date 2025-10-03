"use client";
import { useState } from "react";
import Link from "next/link";
import userService from "@/app/services/userServices";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/app/store/authSlice";


export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      const result = await userService.login(email, password);
      
      if (result && result.user) {
        // Store user data in Redux
        dispatch(login(result.user));
        router.push("/pages/dashboard");
      } else {
        setError("Invalid credentials or server error.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen flex-col gap-4">
      <h1 className="font-bold text-xl underline">Login</h1>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          className="border-2 border-zinc-800 rounded-xl p-2"
          type="text"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border-2 border-zinc-800 rounded-xl p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 cursor-pointer disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </form>
      <span className="text-zinc-600">
        don't have an account?{" "}
        <Link className="underline text-blue-700" href="/pages/signup">
          signup
        </Link>
      </span>
    </main>
  );
}
