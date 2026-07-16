/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The record's URL matched its name in July 2026; keep old links alive
      {
        source: "/rankings",
        destination: "/record",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
