import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  lang?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'VIRSA | Luxury Menswear & Heritage Panjabi Atelier';
const DEFAULT_DESCRIPTION = 'Explore VIRSA’s signature collection of handcrafted Panjabis, Kablis, Italian velvet Kotis, imperial Sherwanis, and Jubbahs. Premier luxury traditional menswear in Dhaka.';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=85&fit=crop';
const SITE_NAME = 'VIRSA Atelier';

export function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://virsa-luxury.com';
}

export function formatCanonicalUrl(pathOrUrl?: string): string {
  const baseUrl = getBaseUrl();
  if (!pathOrUrl || pathOrUrl === '/') {
    return baseUrl;
  }
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${cleanPath}`;
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  twitterCard = 'summary_large_image',
  structuredData,
  lang = 'en',
  noindex = false,
}: SEOProps) {
  const pageTitle = title ? (title.includes('VIRSA') ? title : `${title} | VIRSA`) : DEFAULT_TITLE;
  const canonicalUrl = formatCanonicalUrl(canonical);
  const imageAlt = ogImageAlt || pageTitle;

  return (
    <Helmet>
      {/* HTML Language & Charset */}
      <html lang={lang} />
      
      {/* Primary Page Meta */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Favicon & Apple Touch Icons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="alternate icon" type="image/png" href="/apple-touch-icon.svg" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
      <meta name="theme-color" content="#121212" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((schema, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
    </Helmet>
  );
}
