'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";

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

  // Pages that use AppLayout (which already includes BottomNav)
  const appLayoutPages = ['/feed', '/discover', '/events', '/messages'];
  const usesAppLayout = appLayoutPages.some(page => pathname === page || pathname.startsWith(page + '/'));

  // Pages that should show the bottom tab navigation but don't use AppLayout
  const tabNavPages = ['/profile'];
  const shouldShowTabNav = tabNavPages.some(page => 
    pathname === page || 
    (page === '/profile' && pathname.startsWith('/profile'))
  ) && !usesAppLayout;

  // Hide old navbar and footer for new pages that use AppLayout
  const newPages = ['/feed', '/discover', '/events', '/messages', '/coach'];
  const isNewPage = newPages.some(page => pathname.startsWith(page));
  const hideNavbar = pathname.startsWith('/profile') || isNewPage;

  // Hide tab nav on auth pages, onboarding, and detail pages
  const hideTabNav = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/coach/') ||
    pathname.startsWith('/events/') ||
    pathname === '/';

  // Use static year to prevent hydration mismatch
  // The year is consistent across server and client renders
  const currentYear = 2024;

  return (
    <>
      {hideNavbar ? (
        <main className={shouldShowTabNav && !hideTabNav ? "grow pb-20" : "grow"}>
          {children}
        </main>
      ) : (
        <NavbarWrapper>
          <main className={shouldShowTabNav && !hideTabNav ? "grow pb-20" : "grow"}>
            {children}
          </main>
        </NavbarWrapper>
      )}

      {/* Show bottom tab navigation on profile and other pages that don't use AppLayout */}
      {shouldShowTabNav && !hideTabNav && <BottomNav />}

      {/* Hide footer for new pages that have their own bottom nav */}
      {!isNewPage && !shouldShowTabNav && (
        <footer className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {currentYear} PlayJosh. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </>
  );
}
