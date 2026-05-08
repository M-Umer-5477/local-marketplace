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
          name: account.name || account.fullName || account.shopName,
          email: account.email,
          role: account.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      if (token.name) session.user.name = token.name;
      if (token.email) session.user.email = token.email;
      return session;
    },
    async redirect({ baseUrl, user }) {
      if (user?.role === "seller") return `${baseUrl}/vendor/dashboard`;
      if (user?.role === "customer") return `${baseUrl}/dashboard`;
      if (user?.role === "admin") return `${baseUrl}/admin/dashboard`;
      return baseUrl;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
