import { useParams, Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, Menu, X } from "lucide-react";
import { docsData } from "@/docs/docsData";
import { DocsSidebar } from "@/components/DocsSidebar";
import { useSEO } from "@/hooks/use-seo";

// Helper function to find a specific documentation page
function findDocPage(sectionSlug: string, pageSlug?: string) {
  const section = docsData.find(s => s.slug === sectionSlug);
  if (!section) return null;
  
  if (!pageSlug) {
    return { section, page: section.pages[0] };
  }
  
  const page = section.pages.find(p => p.slug === pageSlug);
  if (!page) return null;
  
  return { section, page };
}

// Markdown content renderer
function MarkdownContent({ content }: { content: string }) {
  const renderContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) return null;
      
      // Headers
      if (trimmed.startsWith('### ')) {
        const headerText = trimmed.slice(4);
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-4 first:mt-0">
            {headerText}
          </h3>
        );
      }
      
      if (trimmed.startsWith('## ')) {
        const headerText = trimmed.slice(3);
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-6 first:mt-0">
            {headerText}
          </h2>
        );
      }
      
      if (trimmed.startsWith('# ')) {
        const headerText = trimmed.slice(2);
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-900 mt-12 mb-8 first:mt-0">
            {headerText}
          </h1>
        );
      }
      
      // Code blocks
      if (trimmed.startsWith('```')) {
        const codeContent = lines.slice(index + 1).join('\n').split('```')[0];
        const language = trimmed.slice(3) || 'text';
        return (
          <div key={index} className="my-6">
            <pre className="bg-gray-900 border border-gray-200 rounded-lg p-4 overflow-x-auto">
              <code className={`language-${language} text-sm text-green-400`}>
                {codeContent}
              </code>
            </pre>
          </div>
        );
      }
      
      // Skip lines that are part of code blocks
      if (lines[index - 1]?.includes('```') && !trimmed.includes('```')) {
        return null;
      }
      
      // Blockquotes
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.slice(2);
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-6 py-3 my-6 bg-blue-50 rounded-r-lg italic text-gray-700">
            {quoteText}
          </blockquote>
        );
      }
      
      // Lists
      if (trimmed.match(/^[\d]+\.\s/)) {
        const listText = trimmed.replace(/^[\d]+\.\s/, '');
        return (
          <li key={index} className="mb-2 text-gray-600 ml-6">
            {listText}
          </li>
        );
      }
      
      if (trimmed.startsWith('- ')) {
        const listText = trimmed.slice(2);
        return (
          <li key={index} className="mb-2 text-gray-600 ml-6 list-disc">
            {listText}
          </li>
        );
      }
      
      // Bold text, code inline, and links
      let processedText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedText = processedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-900 border border-gray-200">$1</code>');
      processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 transition-colors underline">$1</a>');

      // Regular paragraph
      return (
        <p 
          key={index} 
          className="mb-4 text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    }).filter(Boolean);
  };

  return <div className="prose-custom max-w-none">{renderContent(content)}</div>;
}

// Homepage component when no specific page is selected
function DocsHomepage() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        PayGate x402 Documentation
      </h1>
      <p className="text-xl text-gray-600 mb-12">
        Complete guide to implementing API monetization with the x402 payment protocol
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docsData.map((section) => (
          <div key={section.slug} className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{section.description}</p>
            <div className="space-y-2">
              {section.pages.slice(0, 3).map((page) => (
                <Button
                  key={page.slug}
                  asChild
                  variant="ghost"
                  className="w-full justify-start p-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Link href={`/docs/${section.slug}/${page.slug}`}>
                    {page.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Documentation Page
export default function DocsPage() {
  const params = useParams();
  const [location] = useLocation();
  
  const sectionSlug = params.section;
  const pageSlug = params.page;

  // Find the current page
  const result = findDocPage(sectionSlug || 'introduction', pageSlug);
  
  // Set page-specific SEO
  const seoTitle = result ? result.page.title : 'Documentation';
  const seoDescription = result 
    ? (result.page.seoDescription || result.page.summary)
    : 'Complete documentation for PayGate x402 API monetization platform. Learn how to implement blockchain payments with the x402 protocol.';
  const seoPath = result 
    ? `/docs/${result.section.slug}/${result.page.slug}`
    : '/docs';
  
  useSEO({
    title: seoTitle,
    description: seoDescription,
    path: seoPath,
    keywords: 'x402 documentation, API monetization guide, blockchain payments, integration guide, PayGate tutorial, x402 protocol implementation'
  });
  
  // Common layout wrapper
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    return (
      <div className="min-h-screen bg-white text-gray-900">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PayGate x402</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-home">
                Home
              </a>
              <a href="/directory" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-directory">
                Directory
              </a>
              <a href="/release-notes" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-release-notes">
                Release Notes
              </a>
              <a href="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-contact">
                Contact
              </a>
            </nav>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-600"
                data-testid="mobile-menu-button"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              
              <Button 
                onClick={() => window.location.href = "/auth"}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
                data-testid="button-login"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <nav className="container mx-auto px-4 py-4 space-y-2">
                <a href="/" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-home">Home</a>
                <a href="/directory" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-directory">Directory</a>
                <a href="/release-notes" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-release-notes">Release Notes</a>
                <a href="/contact" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-contact">Contact</a>
              </nav>
            </div>
          )}
        </header>

        <div className="relative flex">
          <DocsSidebar currentPath={location} />
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-6 md:mb-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">PayGate x402</span>
              </div>
              <div className="text-center md:text-right space-y-2">
                <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
                  <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="link-privacy">
                    Privacy Policy
                  </a>
                  <a href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="link-faq-footer">
                    FAQ
                  </a>
                  <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="link-terms">
                    Terms of Service
                  </a>
                </div>
                <p className="text-gray-500">
                  © 2025 PayGate x402. API monetization made simple.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };
  
  // Page not found
  if (!result) {
    return (
      <LayoutWrapper>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The documentation page you're looking for doesn't exist.
          </p>
          <Button asChild data-testid="back-to-docs" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/docs">
              Back to Documentation
            </Link>
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  const { section, page } = result;

  // Show docs homepage when no specific page is selected
  if (!pageSlug) {
    return (
      <LayoutWrapper>
        <DocsHomepage />
      </LayoutWrapper>
    );
  }

  // Show specific documentation page
  return (
    <LayoutWrapper>
      <div data-testid="docs-page">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6" data-testid="docs-breadcrumb">
          <Link href="/docs" className="hover:text-blue-600 transition-colors">
            Docs
          </Link>
          <span>/</span>
          <Link 
            href={`/docs/${section.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {section.title}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{page.title}</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3 bg-blue-100 text-blue-700 border-0" data-testid="section-badge">
            {section.title}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">
            {page.title}
          </h1>
          <p className="text-xl text-gray-600" data-testid="page-summary">
            {page.summary}
          </p>
        </div>

        <Separator className="mb-8 bg-gray-200" />

        {/* Content */}
        <div className="prose-custom max-w-none" data-testid="page-content">
          <MarkdownContent content={page.content} />
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex justify-between">
            <div>
              {/* Previous page logic would go here */}
            </div>
            <div>
              {/* Next page logic would go here */}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
