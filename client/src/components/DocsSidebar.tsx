import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Book,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { docsData } from "@/docs/docsData";

interface DocsSidebarProps {
  currentPath: string;
}

export function DocsSidebar({ currentPath }: DocsSidebarProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    introduction: true, // Default expanded
  });

  const toggleSection = (sectionSlug: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionSlug]: !prev[sectionSlug]
    }));
  };

  const filteredData = docsData.map(section => ({
    ...section,
    pages: section.pages.filter(page => 
      !searchQuery || 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.pages.length > 0);

  return (
    <div className="w-80 bg-slate-900/50 border-r border-white/10 backdrop-blur-sm text-white flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative w-8 h-8 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="w-4 h-4 text-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg blur opacity-50 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayGate x402</span>
            <p className="text-xs text-gray-400">Documentation</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 text-white placeholder-gray-400"
              data-testid="docs-search"
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {filteredData.map((section) => {
            const isExpanded = expandedSections[section.slug];
            const sectionPath = `/docs/${section.slug}`;
            const isSectionActive = location.startsWith(sectionPath);
            
            return (
              <div key={section.slug} className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.slug)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200",
                    "hover:bg-slate-800/50 group",
                    isSectionActive && "bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30"
                  )}
                  data-testid={`docs-section-${section.slug}`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className={cn(
                      "w-4 h-4 transition-colors",
                      isSectionActive ? "text-violet-400" : "text-gray-400 group-hover:text-white"
                    )} />
                    <span className={cn(
                      "font-medium transition-colors",
                      isSectionActive ? "text-white" : "text-gray-300 group-hover:text-white"
                    )}>
                      {section.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Section Pages */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {section.pages.map((page) => {
                      const pagePath = `/docs/${section.slug}/${page.slug}`;
                      const isPageActive = location === pagePath;
                      
                      return (
                        <Link
                          key={page.slug}
                          href={pagePath}
                          className={cn(
                            "block p-2 pl-6 rounded-lg text-sm transition-all duration-200",
                            "hover:bg-slate-800/30 hover:text-white border border-transparent",
                            isPageActive && "bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border-violet-500/30 text-white font-medium"
                          )}
                          data-testid={`docs-page-${section.slug}-${page.slug}`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              isPageActive ? "bg-gradient-to-r from-violet-400 to-cyan-400" : "bg-gray-600"
                            )} />
                            <span className={cn(
                              "transition-colors",
                              isPageActive ? "text-white" : "text-gray-400"
                            )}>
                              {page.title}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Home Link at Bottom */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Link
            href="/docs"
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
              "hover:bg-slate-800/50 group",
              location === "/docs" && "bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30"
            )}
            data-testid="docs-home-link"
          >
            <Book className={cn(
              "w-4 h-4 transition-colors",
              location === "/docs" ? "text-violet-400" : "text-gray-400 group-hover:text-white"
            )} />
            <span className={cn(
              "font-medium transition-colors",
              location === "/docs" ? "text-white" : "text-gray-300 group-hover:text-white"
            )}>
              Documentation Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}