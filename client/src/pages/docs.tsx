import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { docsData, findDocPage, type DocSection, type DocPage } from "@/docs/docsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface DocsLayoutProps {
  children: React.ReactNode;
}

// Sidebar Navigation Component
function DocsSidebar({ currentPath }: { currentPath: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Auto-expand section containing current page
  useEffect(() => {
    const pathParts = currentPath.split('/');
    if (pathParts.length > 2) {
      const sectionSlug = pathParts[2];
      setExpandedSections(prev => {
      const newSet = new Set([...Array.from(prev)]);
      newSet.add(sectionSlug);
      return newSet;
    });
    }
  }, [currentPath]);

  const toggleSection = (sectionSlug: string) => {
    setExpandedSections(prev => {
      const next = new Set([...Array.from(prev)]);
      if (next.has(sectionSlug)) {
        next.delete(sectionSlug);
      } else {
        next.add(sectionSlug);
      }
      return next;
    });
  };

  const filteredData = docsData.map(section => ({
    ...section,
    pages: section.pages.filter(page => 
      searchTerm === "" || 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.summary.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.pages.length > 0);

  return (
    <div className="w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2 mb-4">
          <Book className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            PayGate x402 Docs
          </h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-900"
            data-testid="docs-search"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredData.map((section) => {
            const isExpanded = expandedSections.has(section.slug);
            return (
              <div key={section.slug} className="mb-2">
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(section.slug)}
                  className="w-full justify-start p-2 h-auto text-left font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-testid={`section-toggle-${section.slug}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{section.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </Button>
                
                {isExpanded && (
                  <div className="ml-2 mt-1 space-y-1">
                    {section.pages.map((page) => {
                      const pagePath = `/docs/${section.slug}/${page.slug}`;
                      const isActive = currentPath === pagePath;
                      
                      return (
                        <Button
                          key={page.slug}
                          asChild
                          variant="ghost"
                          className={`w-full justify-start p-2 h-auto text-left text-sm ${
                            isActive 
                              ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-l-2 border-blue-600" 
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <Link href={pagePath} data-testid={`page-link-${section.slug}-${page.slug}`}>
                            <div className="flex flex-col items-start w-full">
                              <span className="font-medium">{page.title}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {page.summary}
                              </span>
                            </div>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// Code Block Component with Copy Button
function CodeBlock({ children, language = "bash" }: { children: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-mono">
          {language}
        </span>
        <Button
          size="sm" 
          variant="ghost"
          onClick={copyToClipboard}
          className="h-6 px-2"
          data-testid="copy-code-button"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono">{children}</code>
      </pre>
    </div>
  );
}

// Markdown-like Content Renderer
function MarkdownContent({ content }: { content: string }) {
  const renderContent = (text: string) => {
    // Split content into sections for processing
    const sections = text.split('\n\n');
    
    return sections.map((section, index) => {
      const trimmed = section.trim();
      if (!trimmed) return null;

      // Headers
      if (trimmed.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{trimmed.substring(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mb-4 mt-8 text-gray-900 dark:text-white">{trimmed.substring(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">{trimmed.substring(4)}</h3>;
      }

      // Code blocks
      if (trimmed.startsWith('```')) {
        const lines = trimmed.split('\n');
        const language = lines[0].substring(3).trim() || 'bash';
        const code = lines.slice(1, -1).join('\n');
        return <CodeBlock key={index} language={language}>{code}</CodeBlock>;
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        const content = trimmed.substring(2);
        return (
          <div key={index} className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400 p-4 my-4">
            <p className="text-yellow-800 dark:text-yellow-200">{content}</p>
          </div>
        );
      }

      // Lists
      if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '));
        return (
          <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                {item.substring(2).trim()}
              </li>
            ))}
          </ul>
        );
      }

      if (trimmed.includes('\n1. ') || /^\d+\./.test(trimmed)) {
        const items = trimmed.split('\n').filter(line => /^\d+\./.test(line.trim()));
        return (
          <ol key={index} className="list-decimal pl-6 mb-4 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }

      // Bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      let processedText = trimmed.replace(boldRegex, '<strong>$1</strong>');
      
      // Code inline
      const codeRegex = /`([^`]+)`/g;
      processedText = processedText.replace(codeRegex, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

      // Links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      processedText = processedText.replace(linkRegex, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

      // Regular paragraph
      return (
        <p 
          key={index} 
          className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    }).filter(Boolean);
  };

  return <div className="prose dark:prose-invert max-w-none">{renderContent(content)}</div>;
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
  
  if (!result) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex">
        <DocsSidebar currentPath={location} />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Page Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The documentation page you're looking for doesn't exist.
              </p>
              <Button asChild data-testid="back-to-docs">
                <Link href="/docs">
                  Back to Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { section, page } = result;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex" data-testid="docs-page">
      <DocsSidebar currentPath={location} />
      
      <div className="flex-1">
        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6" data-testid="docs-breadcrumb">
              <Link href="/docs" className="hover:text-gray-700 dark:hover:text-gray-200">
                Docs
              </Link>
              <span>/</span>
              <Link 
                href={`/docs/${section.slug}`}
                className="hover:text-gray-700 dark:hover:text-gray-200"
              >
                {section.title}
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">{page.title}</span>
            </div>

            {/* Page Header */}
            <div className="mb-8">
              <Badge variant="secondary" className="mb-3" data-testid="section-badge">
                {section.title}
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="page-title">
                {page.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300" data-testid="page-summary">
                {page.summary}
              </p>
            </div>

            <Separator className="mb-8" />

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none" data-testid="page-content">
              <MarkdownContent content={page.content} />
            </div>

            {/* Footer Navigation */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
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
        </div>
      </div>
    </div>
  );
}