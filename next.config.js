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
      { source: '/tools', destination: '/atelier', permanent: true },
      // The Eight Adventurers hub became one campaign site among many
      { source: '/the8adventurers', destination: '/campaigns/the-8-adventurers', permanent: false },
      { source: '/the8adventurers/players/:rest*', destination: '/campaigns/the-8-adventurers/party/:rest*', permanent: false },
      { source: '/the8adventurers/players', destination: '/campaigns/the-8-adventurers/party', permanent: false },
      { source: '/the8adventurers/sessions/recaps', destination: '/campaigns/the-8-adventurers/recaps', permanent: false },
      { source: '/the8adventurers/sessions/notes', destination: '/campaigns/the-8-adventurers/journal', permanent: false },
      { source: '/the8adventurers/world-map', destination: '/campaigns/the-8-adventurers/map', permanent: false },
      { source: '/the8adventurers/:path*', destination: '/campaigns/the-8-adventurers/:path*', permanent: false },
    ]
  },
}

module.exports = nextConfig
