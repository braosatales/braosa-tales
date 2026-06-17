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
}

module.exports = nextConfig
