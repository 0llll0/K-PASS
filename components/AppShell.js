'use client';

import BottomNav from './BottomNav';

/**
 * AppShell — wraps page content with mobile container, optional BottomNav
 */
export default function AppShell({ children, showNav = true, className = '' }) {
  return (
    <div className="app-container">
      <main className={`min-h-screen ${showNav ? 'pb-safe' : ''} ${className}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
