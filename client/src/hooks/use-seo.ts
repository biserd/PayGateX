import { createContext, useContext, useEffect } from 'react';
import { siteOrigin } from '@shared/public-pages';

export interface SEOProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string;
  structuredData?: Record<string, unknown>;
}

export const PageMetadataContext = createContext<((metadata: SEOProps) => void) | null>(null);

export function useSEO({ title, description, path = '', ogImage, keywords, structuredData }: SEOProps) {
  const capture = useContext(PageMetadataContext);
  capture?.({ title, description, path, ogImage, keywords, structuredData });
  useEffect(() => {
    const baseUrl = siteOrigin;
    const fullTitle = `${title} | PayGate402`;
    
    document.title = fullTitle;
    
    const metaTags: Record<string, string> = {
      'description': description,
      'og:title': fullTitle,
      'og:description': description,
      'og:url': `${baseUrl}${path}`,
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:url': `${baseUrl}${path}`,
    };
    
    if (keywords) {
      metaTags['keywords'] = keywords;
    }
    
    if (ogImage) {
      metaTags['og:image'] = ogImage;
      metaTags['twitter:image'] = ogImage;
    }
    
    Object.entries(metaTags).forEach(([key, value]) => {
      let selector = `meta[name="${key}"]`;
      if (key.startsWith('og:') || key.startsWith('twitter:')) {
        selector = `meta[property="${key}"]`;
      }
      
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', value);
      } else {
        element = document.createElement('meta');
        if (key.startsWith('og:') || key.startsWith('twitter:')) {
          element.setAttribute('property', key);
        } else {
          element.setAttribute('name', key);
        }
        element.setAttribute('content', value);
        document.head.appendChild(element);
      }
    });
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${baseUrl}${path}`);
    }
    
    // Handle structured data (JSON-LD)
    if (structuredData) {
      let structuredScript = document.querySelector('script[data-structure="page-schema"]');
      if (structuredScript) {
        structuredScript.innerHTML = JSON.stringify(structuredData);
      } else {
        structuredScript = document.createElement('script');
        structuredScript.type = 'application/ld+json';
        structuredScript.setAttribute('data-structure', 'page-schema');
        structuredScript.innerHTML = JSON.stringify(structuredData);
        document.head.appendChild(structuredScript);
      }
    } else {
      document.querySelector('script[data-structure="page-schema"]')?.remove();
    }
  }, [title, description, path, ogImage, keywords, structuredData]);
}
