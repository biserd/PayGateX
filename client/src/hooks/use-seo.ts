import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
}

export function useSEO({ title, description, path = '', ogImage }: SEOProps) {
  useEffect(() => {
    const baseUrl = 'https://paygate-x402.replit.app';
    const fullTitle = `${title} | PayGate x402`;
    
    document.title = fullTitle;
    
    const metaTags = {
      'description': description,
      'og:title': fullTitle,
      'og:description': description,
      'og:url': `${baseUrl}${path}`,
      'twitter:title': fullTitle,
      'twitter:description': description,
    };
    
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
  }, [title, description, path, ogImage]);
}
