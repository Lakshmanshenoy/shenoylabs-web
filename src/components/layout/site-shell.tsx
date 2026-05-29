import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="site-shell relative flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="site-navbar">
        <Navbar />
      </div>
      <main
        id="main-content"
        className="page-enter flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[calc(3.75rem+env(safe-area-inset-top))]"
      >
        {children}
      </main>
      <div className="site-footer">
        <Footer />
      </div>
    </div>
  );
}
