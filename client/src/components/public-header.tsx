import { ArrowRight, BookOpen, Coins, Menu, Plug, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "/#how-it-works", label: "For sellers", icon: Plug },
  { href: "/#for-buyers", label: "For buyers", icon: ShoppingBag },
  { href: "/docs", label: "Documentation", icon: BookOpen },
];

export function SiteBrand() {
  return (
    <a href="/" className="inline-flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950" data-testid="logo-home">
      <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-blue-700 text-white">
        <Coins size={19} aria-hidden="true" />
      </span>
      PayGate402
    </a>
  );
}

export function PublicHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const docsActive = location === "/docs" || location.startsWith("/docs/");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white [font-family:Geist,system-ui,sans-serif]">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-10 md:grid md:grid-cols-[1fr_auto_1fr]">
        <SiteBrand />
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => (
            <a key={href} href={href} aria-current={href === "/docs" && docsActive ? "page" : undefined}
              className={cn("rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950",
                href === "/docs" && docsActive && "bg-blue-50 text-blue-800 hover:bg-blue-100")}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:justify-self-end">
          <a href={user ? "/dashboard" : "/auth"} data-testid="button-login"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 sm:px-4">
            {user ? "Seller console" : "Sign in"}
            <ArrowRight className="hidden size-4 sm:block" aria-hidden="true" />
          </a>
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" aria-label="Open menu" data-testid="mobile-menu-button"
                className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50 md:hidden">
                <Menu size={21} aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined} className="w-[min(92vw,22rem)] bg-white text-slate-950">
              <SheetTitle className="mb-5 text-xl">Menu</SheetTitle>
              <nav aria-label="Main navigation" className="space-y-1">
                {links.map(({ href, label, icon: Icon }) => (
                  <SheetClose key={href} asChild>
                    <a href={href} aria-current={href === "/docs" && docsActive ? "page" : undefined}
                      className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-800">
                      <Icon size={18} className="text-blue-700" aria-hidden="true" />
                      {label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <nav aria-label="Support" className="mt-5 flex gap-5 border-t border-slate-200 px-3 pt-5 text-sm font-medium text-slate-600">
                <SheetClose asChild><a href="/faq" className="hover:text-blue-700">FAQ</a></SheetClose>
                <SheetClose asChild><a href="/contact" className="hover:text-blue-700">Contact</a></SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
