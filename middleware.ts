import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/pricing(.*)',
    '/atelier(.*)',
    '/stories(.*)',
    '/games(.*)',
    '/blog(.*)',
    '/login(.*)',
    '/signup(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhook(.*)',
    '/api/webhooks/clerk',
    '/api/waitlist',
    '/api/newsletter',
    '/api/webhooks/stripe',
    '/api/checkout',
    '/atelier/signet(.*)',
  ],
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
