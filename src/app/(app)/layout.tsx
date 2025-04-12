'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ClerkProvider, SignedIn, SignedOut, UserButton, useClerk, useUser } from '@clerk/nextjs';
import { AppContextProvider, useAppContext } from '../../context/AppContext'; // Corrected path
import Sidebar from '../../components/Sidebar'; // Corrected path
import MainHeader from '../../components/MainHeader'; // Corrected path
import QuestionModal from '../../components/QuestionModal'; // Corrected path
import Link from 'next/link';
import '../globals.css'; // Assuming globals.css is one level up

// Internal component to handle theme and modal effects, consuming context
function AppLayoutContent({ children }: { children: ReactNode }) {
  const { isDarkTheme, currentQuestionId, closeModal } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkTheme);
  }, [isDarkTheme]);

  // Handle modal open/close effects (body scroll, escape key)
  useEffect(() => {
    const body = document.body;
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (currentQuestionId !== null) {
      body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscKey);
    } else {
      // Only remove style if sidebar is also closed
      if (!isSidebarOpen) {
          body.style.overflow = '';
      }
    }

    return () => {
      // Clean up listener and style on component unmount or modal close
      window.removeEventListener('keydown', handleEscKey);
      // Ensure scrolling is re-enabled if component unmounts while modal is open
      // Check sidebar state again before removing
      if (!isSidebarOpen) {
        body.style.overflow = '';
      }
    };
  }, [currentQuestionId, closeModal, isSidebarOpen]);

  // Handle sidebar open/close effects (body scroll)
  useEffect(() => {
      const body = document.body;
      if (isSidebarOpen) {
          body.style.overflow = 'hidden';
      } else {
          // Only re-enable scroll if modal is also closed
          if (currentQuestionId === null) {
              body.style.overflow = '';
          }
      }
      // No cleanup needed here as the effect depends on isSidebarOpen state
  }, [isSidebarOpen, currentQuestionId]);

  const toggleMobileMenu = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className={`js-qa-app ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className="app-container">
        {/* Mobile Menu Button */}
        <button
          className="menu-btn"
          aria-label="Toggle navigation menu"
          onClick={toggleMobileMenu}
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Menu Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="menu-overlay active"
            onClick={() => setIsSidebarOpen(false)} // Close overlay and sidebar
          ></div>
        )}

        {/* App Header (Simplified for Layout) */}
        <header className="app-header">
          <div className="header-left">
            {/* Title might be dynamic based on page, handled by MainHeader? */}
            {/* <h1 className="app-title">JavaScript Interview Q&A</h1> */}
          </div>
          <div className="header-right">
            {/* UserButton visible on small screens, could be part of MainHeader */}
            <div className="sm:hidden">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </header>

        {/* Pass sidebar state and toggle function to Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleMenu={toggleMobileMenu} />

        {/* Main Content Area */}
        <main className="main-content">
          {/* Pass search state handling up via context or props */}
          <MainHeader />
          {children} {/* Page content will be rendered here */}
        </main>

        {/* Render modal if a question is selected */}
        {currentQuestionId !== null && <QuestionModal />}
      </div>
    </div>
  );
}

// Main Layout Component wrapping content with Providers
export default function AppLayout({ children }: { children: ReactNode }) {
  // Note: ClerkProvider should ideally be higher up in the layout tree (e.g., src/app/layout.tsx)
  // For now, we include it here to ensure context availability.
  // If you have a root layout.tsx, move ClerkProvider there.
  return (
    // <ClerkProvider> - Assuming ClerkProvider is in the root layout
      <AppContextProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </AppContextProvider>
    // </ClerkProvider>
  );
} 