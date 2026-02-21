import { withAuth } from "next-auth/middleware";

// ✅ Explicitly export the middleware function
export default withAuth({
  // 1. Point the middleware to your custom login page (stops the /api/auth/signin flash)
  pages: {
    signIn: "/login",
  },
  // 2. Give the edge middleware your secret so it can read the production cookie
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    // Authorized returns true if the token exists
    authorized: ({ token }) => !!token,
  },
});

// ✅ Keep your matcher configuration
export const config = {
  matcher: [
    "/customer/dashboard/:path*",
    
     
  ],
};