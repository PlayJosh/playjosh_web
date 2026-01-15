'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";

function NavbarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide old navbar and footer for new pages that use AppLayout
  const newPages = ['/feed', '/discover', '/events', '/messages', '/coach'];
  const isNewPage = newPages.some(page => pathname.startsWith(page));
  const hideNavbar = pathname.startsWith('/profile') || isNewPage;

  return (
    <>
      {hideNavbar ? (
        <main className="grow">
          {children}
        </main>
      ) : (
        <NavbarWrapper>
          <main className="grow">
            {children}
          </main>
        </NavbarWrapper>
      )}

      {/* Hide footer for new pages that have their own bottom nav */}
      {!isNewPage && (
        <footer className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} PlayJosh. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </>
  );
}
