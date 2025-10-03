import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@backend/models/user.model";
import connectdb from "@backend/config/db";
import bcrypt from "bcrypt";

export const runtime = 'nodejs';

const handler = NextAuth({
providers: [
    // Email/password login only
    CredentialsProvider({
    name: "Credentials",
    credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        await connectdb();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return user;
    },
    }),
],

callbacks: {
    async jwt({ token, user }) {
    if (user) {
        token.id = user.id || user._id;
        token.email = user.email;
    }
    return token;
    },
    async session({ session, token }) {
    if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
    }
    return session;
    },
},

secret: process.env.NEXTAUTH_SECRET,
session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
