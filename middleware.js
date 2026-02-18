import { withAuth } from "next-auth/middleware";

// ✅ Explicitly export the middleware function
export default withAuth({
  callbacks: {
    // Authorized returns true if the token exists
    authorized: ({ token }) => !!token,
  },
});

// ✅ Keep your matcher configuration
export const config = {
  matcher: [
    "/customer/dashboard/:path*",
    "/vendor/dashboard/:path*",
    "/orders/:path*" 
  ],
};