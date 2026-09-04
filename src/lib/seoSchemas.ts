import { Product } from '../types';
import { getBaseUrl, formatCanonicalUrl } from '../components/SEO';

export function getOrganizationSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${baseUrl}/#organization`,
    name: 'VIRSA Atelier',
    alternateName: 'VIRSA Premium Menswear',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=85&fit=crop',
    description: 'VIRSA is a premier luxury traditional menswear atelier specializing in handcrafted Panjabis, Royal Kablis, Italian Velvet Kotis, and Imperial Sherwanis.',
    telephone: '+880 1711-000000',
    email: 'concierge@virsa.luxury',
    priceRange: '৳৳৳',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, Credit Card, Debit Card, bKash, Nagad',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'House 42, Road 11, Block D, Banani',
      addressLocality: 'Dhaka',
      postalCode: '1213',
      addressCountry: 'BD'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.7937,
      longitude: 90.4043
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '22:00'
      }
    ],
    sameAs: [
      'https://www.facebook.com/virsa',
      'https://www.instagram.com/virsa',
      'https://www.linkedin.com/company/virsa'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880 1711-000000',
      contactType: 'Customer Concierge & Styling Service',
      areaServed: 'BD',
      availableLanguage: ['English', 'Bengali']
    }
  };
}

export function getProductSchema(product: Product, canonicalPathOrUrl?: string) {
  const canonicalUrl = formatCanonicalUrl(canonicalPathOrUrl || `/product/${product.slug || product.id}`);
  const totalStock = product.variants ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 10;
  const inStock = totalStock > 0;

  const images = (product.images && product.images.length > 0)
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop'];

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: product.name,
    image: images,
    description: product.description,
    sku: product.sku || `VRS-${product.id}`,
    mpn: product.id,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'VIRSA'
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'BDT',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'VIRSA Atelier'
      }
    }
  };

  if (product.ratings && product.ratings.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.ratings.average.toFixed(1),
      reviewCount: product.ratings.count,
      bestRating: '5',
      worstRating: '1'
    };
  }

  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.slice(0, 5).map((rev) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.author || 'Verified Customer'
      },
      datePublished: rev.date || '2026-06-01',
      reviewBody: rev.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.rating,
        bestRating: '5',
        worstRating: '1'
      }
    }));
  }

  return schema;
}

export function getBreadcrumbListSchema(items: Array<{ name: string; path: string }>) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const itemUrl = item.path.startsWith('http') ? item.path : formatCanonicalUrl(item.path);
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: itemUrl
      };
    })
  };
}
