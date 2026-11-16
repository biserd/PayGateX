import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Book,
  ChevronDown,
  ChevronRight,
  Search,
  Coins,
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
    seller: true,
    introduction: true,
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
    <div className="hidden h-screen w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white text-gray-900 md:block lg:w-80">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Coins className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">PayGate402</span>
            <p className="text-xs text-gray-500">Documentation</p>
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
              className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900 placeholder-gray-400"
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
                  aria-expanded={!!isExpanded}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200",
                    "hover:bg-gray-50 group",
                    isSectionActive && "bg-blue-50 border border-blue-200"
                  )}
                  data-testid={`docs-section-${section.slug}`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className={cn(
                      "w-4 h-4 transition-colors",
                      isSectionActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                    )} />
                    <span className={cn(
                      "font-medium transition-colors",
                      isSectionActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
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
                          aria-current={isPageActive ? "page" : undefined}
                          className={cn(
                            "block p-2 pl-6 rounded-lg text-sm transition-all duration-200",
                            "hover:bg-gray-100 hover:text-gray-900 border border-transparent",
                            isPageActive && "bg-blue-50 border-blue-200 text-gray-900 font-medium"
                          )}
                          data-testid={`docs-page-${section.slug}-${page.slug}`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              isPageActive ? "bg-blue-600" : "bg-gray-300"
                            )} />
                            <span className={cn(
                              "transition-colors",
                              isPageActive ? "text-gray-900" : "text-gray-500"
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
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/docs"
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
              "hover:bg-gray-50 group",
              location === "/docs" && "bg-blue-50 border border-blue-200"
            )}
            data-testid="docs-home-link"
          >
            <Book className={cn(
              "w-4 h-4 transition-colors",
              location === "/docs" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
            )} />
            <span className={cn(
              "font-medium transition-colors",
              location === "/docs" ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
            )}>
              Documentation Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
