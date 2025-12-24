const nextConfig = {
  eslint: {
    // ✅ Don’t block production builds on ESLint errors/warnings
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["property.ulbharyana.gov.in"],
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
        hostname: "property.ulbharyana.gov.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
