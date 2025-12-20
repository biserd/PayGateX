import { Coins } from "lucide-react";

interface FooterLink {
  href: string;
  label: string;
  testId?: string;
}

interface FooterProps {
  email?: string;
  footerText?: string;
  showVersion?: boolean;
  version?: string;
  showAbout?: boolean;
}

export function Footer({
  email = "hello@paygate402.com",
  footerText = "API monetization made simple.",
  showVersion = false,
  version = "1.3.0",
  showAbout = false
}: FooterProps) {
  const defaultLinks: FooterLink[] = [
    { href: "/directory", label: "Directory", testId: "link-directory-footer" },
    { href: "/privacy", label: "Privacy Policy", testId: "link-privacy" },
    ...(showAbout ? [{ href: "/about", label: "About", testId: "link-about" }] : []),
    { href: "/faq", label: "FAQ", testId: "link-faq-footer" },
    { href: "/terms", label: "Terms of Service", testId: "link-terms" },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
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
              {defaultLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  data-testid={link.testId}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} PayGate x402. {footerText}
            </p>
            {email && <p className="text-sm text-gray-500">{email}</p>}
            {showVersion && <p className="text-sm text-gray-500">Version {version}</p>}
          </div>
        </div>
      </div>
    </footer>
  );
}
