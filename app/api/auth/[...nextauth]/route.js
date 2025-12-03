import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import User from "@/models/user";
import Seller from "@/models/seller";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await db.connect();
        const { identifier, password } = credentials;

        let account = await User.findOne({
          $or: [{ email: identifier }, { phone: identifier }],
        }).select("+password");
        if (!account) {
          account = await Seller.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
          }).select("+password");
        }

        if (!account) throw new Error("No user or seller found with that identifier");

        if (account.constructor.modelName === "User") {
          if (!account.isVerified) throw new Error("Please verify your email first");
        } else if (account.constructor.modelName === "Seller") {
          if (!account.isVerified) throw new Error("Please verify your email first");
          if (account.verificationStatus !== "Approved")
            throw new Error("Seller account is not yet approved.");
        }

        const valid = await bcrypt.compare(password, account.password);
        if (!valid) throw new Error("Invalid password");

        return {
          id: account._id.toString(),
          name: account.name,
          email: account.email,
          role: account.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
