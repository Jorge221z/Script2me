import { Head } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import { SEOData, generatePageTitle, generateKeywords, sanitizeUrl, generateSocialMeta } from '@/utils/seo'

interface UseSEOProps extends SEOData {
  pageName?: string
}

/**
 * Hook personalizado para manejar SEO de manera consistente
 */
export function useSEO({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  pageName
}: UseSEOProps = {}) {
  const { props } = usePage()
  const currentUrl = window.location.href

  // Generar título completo
  const fullTitle = generatePageTitle(title)

  // Generar URL canónica
  const canonicalUrl = canonical ? sanitizeUrl(canonical) : currentUrl

  // Generar meta datos sociales
  const socialMeta = generateSocialMeta({
    title: fullTitle,
    description,
    ogType,
    ogImage
  }, currentUrl)

  const SEOHead = () => (
    <Head>
      {title && <title>{fullTitle}</title>}
      {description && <meta name="description" content={description} />}
      {keywords.length > 0 && <meta name="keywords" content={generateKeywords(keywords)} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={socialMeta['og:title']} />
      <meta property="og:description" content={socialMeta['og:description']} />
      <meta property="og:url" content={socialMeta['og:url']} />
      <meta property="og:type" content={socialMeta['og:type']} />
      <meta property="og:image" content={socialMeta['og:image']} />

      {/* Twitter */}
      <meta name="twitter:card" content={socialMeta['twitter:card']} />
      <meta name="twitter:title" content={socialMeta['twitter:title']} />
      <meta name="twitter:description" content={socialMeta['twitter:description']} />
      <meta name="twitter:image" content={socialMeta['twitter:image']} />
    </Head>
  )

  return {
    SEOHead,
    title: fullTitle,
    description,
    canonicalUrl,
    socialMeta
  }
}
