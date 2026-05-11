import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://braosatales.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://braosatales.com/atelier', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://braosatales.com/atelier/signet', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://braosatales.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://braosatales.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://braosatales.com/stories', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: 'https://braosatales.com/games', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ]
}
