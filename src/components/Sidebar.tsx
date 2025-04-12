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
        <span className="toggle-label">Theme</span>
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

      {/* Navigation - Use Next.js Link and check pathname */}
      <nav className="sidebar-nav">
        <Link
          href="/dashboard"
          className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
          onClick={handleLinkClick} // Close sidebar on click
        >
          <i className="fas fa-home"></i>
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
      </nav>

      {/* Auth Section */}
      <div className="sidebar-auth">
        <SignedOut>
          <div className="flex flex-col gap-3">
            <h3>Account</h3>
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm flex items-center justify-center">
                <i className="fas fa-sign-in-alt mr-2"></i> Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-all text-sm flex items-center justify-center">
                <i className="fas fa-user-plus mr-2"></i> Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col gap-3">
            <h3>My Account</h3>
            <div className="user-info">
              <UserButton afterSignOutUrl="/" />
              <div>
                {/* Display user info safely */}
                <div className="font-medium">{user?.firstName || user?.username || 'User'}</div>
                <div className="text-gray-500 text-xs">{user?.primaryEmailAddress?.emailAddress || ''}</div>
              </div>
            </div>
            {/* Link to external dashboard if needed, or remove */}
            {/* <Link href="/dashboard" ... > ... </Link> */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all text-sm flex items-center justify-center"
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
          </div>
        </SignedIn>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>&copy; 2025 JavaScript Q&A</p>
      </div>
    </aside>
  );
} 