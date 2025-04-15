'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, useClerk, useUser } from '@clerk/nextjs';
import { useAppContext } from '../context/AppContext'; // Adjust path

interface SidebarProps {
  isOpen: boolean;
  toggleMenu: () => void; // Function to close the menu (passed from layout)
}

export default function Sidebar({ isOpen, toggleMenu }: SidebarProps) {
  const { isDarkTheme, toggleTheme } = useAppContext();
  const { signOut } = useClerk();
  const { user } = useUser();
  const pathname = usePathname(); // Hook to get current path for active link styling

  const handleLogout = () => {
    signOut();
  };

  // Function to close sidebar when a link is clicked
  const handleLinkClick = () => {
    if (isOpen) {
      toggleMenu(); // Close the sidebar
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="logo">
        <i className="fas fa-code"></i>
        <h1>JS Q&A</h1>
      </div>

      {/* Theme Toggle */}
      <div className="theme-toggle mb-4">
        <span className="toggle-label">
          {isDarkTheme ? (
            <>
              <i className="fas fa-moon mr-2"></i> Dark Mode
            </>
          ) : (
            <>
              <i className="fas fa-sun mr-2"></i> Light Mode
            </>
          )}
        </span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isDarkTheme}
            onChange={toggleTheme}
            aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Main Menu</h3>
        <nav className="sidebar-nav">
          <Link
            href="/dashboard"
            className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
            onClick={handleLinkClick} // Close sidebar on click
          >
            <i className="fas fa-chart-bar"></i>
            <span>Statistics</span>
          </Link>
          <Link
            href="/questions"
            className={`nav-item ${pathname === '/questions' ? 'active' : ''}`}
            onClick={handleLinkClick} // Close sidebar on click
          >
            <i className="fas fa-list"></i>
            <span>All Questions</span>
          </Link>
          <Link
            href="/bookmarks"
            className={`nav-item ${pathname === '/bookmarks' ? 'active' : ''}`}
            onClick={handleLinkClick} // Close sidebar on click
          >
            <i className="fas fa-bookmark"></i>
            <span>Bookmarks</span>
          </Link>
          <Link
            href="/roadmap"
            className={`nav-item ${pathname === '/roadmap' ? 'active' : ''}`}
            onClick={handleLinkClick} // Close sidebar on click
          >
            <i className="fas fa-road"></i>
            <span>Learning Roadmap</span>
          </Link>
        </nav>
      </div>

      {/* Auth Section */}
      <div className="sidebar-auth">
        <h3 className="sidebar-heading">Account</h3>
        <SignedOut>
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal">
              <button className="auth-button auth-button-primary">
                <i className="fas fa-sign-in-alt mr-2"></i> Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="auth-button auth-button-secondary">
                <i className="fas fa-user-plus mr-2"></i> Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col gap-3">
            <div className="user-info">
              <UserButton afterSignOutUrl="/" />
              <div>
                {/* Display user info safely */}
                <div className="font-medium">{user?.firstName || user?.username || 'User'}</div>
                <div className="text-gray-500 text-xs">{user?.primaryEmailAddress?.emailAddress || ''}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="auth-button auth-button-danger"
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
          </div>
        </SignedIn>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>&copy; 2025 JavaScript Q&A</p>
        <div className="social-links">
          <a href="#" aria-label="GitHub"><i className="fab fa-github"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
        </div>
      </div>
    </aside>
  );
} 