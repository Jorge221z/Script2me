/**
 * Utilidades SEO para la aplicación Script2me
 */

export interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  structuredData?: Record<string, any>
  noindex?: boolean
}

export interface PageSEOConfig extends SEOData {
  titleTemplate?: string
}

/**
 * Configuraciones SEO por página
 */
export const seoConfigs: Record<string, PageSEOConfig> = {
  landing: {
    title: "Script2me - Herramientas de IA para Desarrolladores",
    description: "Potencia tu desarrollo con herramientas de IA avanzadas: refactorización inteligente de código, constructor de prompts y análisis de seguridad automatizado.",
    keywords: [
      "herramientas IA desarrolladores",
      "refactoring código automático",
      "constructor prompts IA",
      "análisis seguridad código",
      "AI code tools",
      "development automation",
      "script2me"
    ],
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Script2me",
      "description": "Herramientas de IA para desarrolladores",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web"
    }
  },
  dashboard: {
    title: "Dashboard - Constructor de Prompts",
    description: "Crea prompts de IA poderosos y efectivos con nuestro constructor inteligente. Optimiza tus resultados de IA con plantillas profesionales.",
    keywords: [
      "constructor prompts",
      "prompt builder",
      "AI prompts",
      "plantillas IA",
      "optimización prompts"
    ]
  },
  refactor: {
    title: "Refactorización de Código - IA",
    description: "Refactoriza y mejora tu código automáticamente con IA. Soporte para múltiples lenguajes de programación y mejores prácticas.",
    keywords: [
      "refactoring código",
      "mejora código automática",
      "AI code refactoring",
      "optimización código",
      "clean code IA"
    ]
  },
  security: {
    title: "Análisis de Seguridad - Scanner IA",
    description: "Escanea tu código en busca de vulnerabilidades de seguridad con IA avanzada. Detecta problemas antes de que lleguen a producción.",
    keywords: [
      "análisis seguridad código",
      "scanner vulnerabilidades",
      "security code analysis",
      "detección vulnerabilidades IA",
      "código seguro"
    ]
  }
}

/**
 * Genera el título completo de la página
 */
export function generatePageTitle(pageTitle?: string, siteName: string = "Script2me"): string {
  if (!pageTitle) return siteName
  return `${pageTitle} | ${siteName}`
}

/**
 * Genera meta keywords como string
 */
export function generateKeywords(keywords: string[]): string {
  return keywords.join(", ")
}

/**
 * Valida y sanitiza URLs
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.toString()
  } catch {
    return window.location.origin + (url.startsWith('/') ? url : '/' + url)
  }
}

/**
 * Genera structured data como JSON-LD
 */
export function generateStructuredData(data: Record<string, any>): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Obtiene la configuración SEO para una página específica
 */
export function getPageSEO(pageName: string): PageSEOConfig {
  return seoConfigs[pageName] || {}
}

/**
 * Genera meta datos para compartir en redes sociales
 */
export function generateSocialMeta(data: SEOData, currentUrl: string) {
  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:url': currentUrl,
    'og:type': data.ogType || 'website',
    'og:image': data.ogImage || '/images/logo.png',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.ogImage || '/images/logo.png'
  }
}
