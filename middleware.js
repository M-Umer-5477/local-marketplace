export { default } from "next-auth/middleware";

export const config = {
  // Only these paths require login immediately
  matcher: [
    "/customer/dashboard/:path*",
    "/vendor/dashboard/:path*",
    "/orders/:path*" 
  ],
};