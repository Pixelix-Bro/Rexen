import { SITE } from '../lib/ site';

const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      legalName: SITE.legalName,
      url: SITE.url,
      logo: `${SITE.url}/icon.png`,
      email: SITE.email,
      description: SITE.description,
      sameAs: SITE.social,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: 'en',
      publisher: { '@id': `${SITE.url}/#organization` },
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE.url}/#service`,
      name: SITE.name,
      url: SITE.url,
      image: `${SITE.url}/opengraph-image`,
      description: SITE.description,
      provider: { '@id': `${SITE.url}/#organization` },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Digital engineering services',
        itemListElement: SITE.services.map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    },
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  )
}
