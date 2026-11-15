import type { ReactNode } from "react";
import { BookOpen, ChevronDown, KeyRound, LogOut, Plug } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SiteBrand } from "@/components/public-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const workspaceLinks = [
  { href: "/dashboard", label: "Paid tools", icon: Plug },
  { href: "/api-keys", label: "API keys", icon: KeyRound },
];

export function SellerLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const active = location === "/endpoints" ? "/dashboard" : location;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 [font-family:Geist,system-ui,sans-serif]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <SiteBrand />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50">
                Account <ChevronDown size={15} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white text-slate-950">
              {user?.email && <DropdownMenuLabel className="break-all text-xs font-normal text-slate-600">{user.email}</DropdownMenuLabel>}
              <DropdownMenuItem asChild><a href="/docs"><BookOpen size={16} /> Documentation</a></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
                <LogOut size={16} /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <nav aria-label="Seller workspace" className="mx-auto flex max-w-6xl gap-2 px-4 sm:px-8">
          {workspaceLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active === href ? "page" : undefined}
              className={cn("inline-flex min-h-11 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-slate-600 hover:text-slate-950",
                active === href && "border-blue-700 bg-blue-50/70 font-semibold text-blue-800")}>
              <Icon size={17} aria-hidden="true" /> {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-8 sm:py-9">{children}</main>
    </div>
  );
}
