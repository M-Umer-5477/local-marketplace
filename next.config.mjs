/** @type {import('next').NextConfig} */
const nextConfig = {

eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ 2. Ignore TypeScript Errors (If any)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ 3. Allow Images from Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
