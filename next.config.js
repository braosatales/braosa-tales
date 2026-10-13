/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spg-images.s3.us-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'irvixvhpwgsubwbxninv.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      // Old auth URLs → new pages
      { source: '/login', destination: '/sign-in', permanent: false },
      { source: '/signup', destination: '/sign-up', permanent: false },
    ]
  },
}

module.exports = nextConfig
