import { useParams, Link, useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sparkles } from "lucide-react";
import { docsData } from "@/docs/docsData";
import { DocsSidebar } from "@/components/DocsSidebar";

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
          <h3 key={index} className="text-xl font-semibold text-white mt-8 mb-4 first:mt-0">
            {headerText}
          </h3>
        );
      }
      
      if (trimmed.startsWith('## ')) {
        const headerText = trimmed.slice(3);
        return (
          <h2 key={index} className="text-2xl font-bold text-white mt-10 mb-6 first:mt-0">
            {headerText}
          </h2>
        );
      }
      
      if (trimmed.startsWith('# ')) {
        const headerText = trimmed.slice(2);
        return (
          <h1 key={index} className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mt-12 mb-8 first:mt-0">
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
            <pre className="bg-slate-900/80 border border-white/10 rounded-lg p-4 overflow-x-auto backdrop-blur-sm">
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
          <blockquote key={index} className="border-l-4 border-violet-500/50 pl-6 py-3 my-6 bg-violet-500/5 backdrop-blur-sm rounded-r-lg italic text-gray-300">
            {quoteText}
          </blockquote>
        );
      }
      
      // Lists
      if (trimmed.match(/^[\d]+\.\s/)) {
        const listText = trimmed.replace(/^[\d]+\.\s/, '');
        return (
          <li key={index} className="mb-2 text-gray-300 ml-6">
            {listText}
          </li>
        );
      }
      
      if (trimmed.startsWith('- ')) {
        const listText = trimmed.slice(2);
        return (
          <li key={index} className="mb-2 text-gray-300 ml-6 list-disc">
            {listText}
          </li>
        );
      }
      
      // Bold text, code inline, and links
      let processedText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedText = processedText.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-2 py-1 rounded text-sm font-mono text-cyan-300 border border-white/10">$1</code>');
      processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-violet-400 hover:text-cyan-400 transition-colors underline decoration-violet-400/50 hover:decoration-cyan-400/50">$1</a>');

      // Regular paragraph
      return (
        <p 
          key={index} 
          className="mb-4 text-gray-300 leading-relaxed"
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
      <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
        PayGate x402 Documentation
      </h1>
      <p className="text-xl text-gray-300 mb-12">
        Complete guide to implementing API monetization with the x402 payment protocol
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docsData.map((section) => (
          <div key={section.slug} className="bg-slate-900/50 border border-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{section.description}</p>
            <div className="space-y-2">
              {section.pages.slice(0, 3).map((page) => (
                <Button
                  key={page.slug}
                  asChild
                  variant="ghost"
                  className="w-full justify-start p-2 text-left text-sm text-gray-300 hover:bg-slate-800/50 hover:text-white"
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

  // Set page title and meta description
  useEffect(() => {
    const result = findDocPage(sectionSlug || 'introduction', pageSlug);
    if (result) {
      document.title = `${result.page.title} | PayGate x402 Docs`;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = result.page.seoDescription || result.page.summary;
    } else {
      document.title = 'PayGate x402 Documentation';
    }
  }, [sectionSlug, pageSlug]);

  // Find the current page
  const result = findDocPage(sectionSlug || 'introduction', pageSlug);
  
  // Common layout wrapper
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-blue-950/10 to-cyan-950/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%), 
                           radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.15) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Header */}
      <header className="relative border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.location.href = "/"}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
                <Sparkles className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl blur opacity-50 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayGate x402</h1>
                <p className="text-xs text-gray-400 font-medium">Developer Documentation</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = "/auth"}
            className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0 px-6 py-2.5 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/25"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      <div className="relative flex">
        <DocsSidebar currentPath={location} />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Page not found
  if (!result) {
    return (
      <LayoutWrapper>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-300 mb-6">
            The documentation page you're looking for doesn't exist.
          </p>
          <Button asChild data-testid="back-to-docs" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500">
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
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6" data-testid="docs-breadcrumb">
          <Link href="/docs" className="hover:text-violet-400 transition-colors">
            Docs
          </Link>
          <span>/</span>
          <Link 
            href={`/docs/${section.slug}`}
            className="hover:text-violet-400 transition-colors"
          >
            {section.title}
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{page.title}</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3 bg-violet-500/20 text-violet-300 border-violet-500/30" data-testid="section-badge">
            {section.title}
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4" data-testid="page-title">
            {page.title}
          </h1>
          <p className="text-xl text-gray-300" data-testid="page-summary">
            {page.summary}
          </p>
        </div>

        <Separator className="mb-8 bg-white/10" />

        {/* Content */}
        <div className="prose-custom max-w-none" data-testid="page-content">
          <MarkdownContent content={page.content} />
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-white/10">
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