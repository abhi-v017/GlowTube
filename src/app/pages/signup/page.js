"use client";
import { useState } from "react";
import Link from "next/link";
import userService from "@/app/services/userServices";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/app/store/authSlice";

export default function SignupPage() {
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
      const result = await userService.register(email, password);
      
      if (result) {
        // Store user data in Redux
        dispatch(login(result));
        router.push("/pages/login");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError("Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen flex-col gap-4">
      <h1 className="font-bold text-xl underline">Sign up</h1>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          className="border-2 border-zinc-800 rounded-xl p-2"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border-2 border-zinc-800 rounded-xl p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 cursor-pointer disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </form>
      <span className="text-zinc-600">
        Already a user?{" "}
        <Link className="underline text-blue-700" href="/pages/login">
          login
        </Link>
      </span>
    </main>
  );
}