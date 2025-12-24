import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Don’t block production builds on ESLint errors/warnings
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["property.ulbharyana.gov.in"], // Add your API host here
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.29.175",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname:
          "property.ulbharyana.gov.in/NDCImages/fdrive/Thumb/037/1G11DBF1/1G11DBF1",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
