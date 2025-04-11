'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chart } from 'chart.js/auto';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.min.css';
import { UserButton, useUser, SignInButton, SignUpButton, SignedIn, SignedOut, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

// Importing data - we'll move this to public/datajs.json
import questionsDataImport from '../../public/datajs.json';

// Define TypeScript interfaces
interface Question {
  id: number;
  question: string;
  answer: string;
  topic?: string;
}

interface Categories {
  Basics: number;
  Functions: number;
  Objects: number;
  Arrays: number;
  Advanced: number;
  [key: string]: number;
}

export default function Home() {
  // Auth state
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  
  // State variables
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('id');
  const [activePage, setActivePage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Constants
  const questionsPerPage = 12;
  
  // Refs
  const topicsChartRef = useRef<Chart | null>(null);
  const topicsChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Function to determine a question's category based on content
  const determineQuestionCategory = useCallback((question: Question): string => {
    const text = question.question.toLowerCase();
    
    if (text.includes('function') || text.includes('callback')) {
      return 'functions';
    } else if (text.includes('object') || text.includes('json')) {
      return 'objects';
    } else if (text.includes('array') || text.includes('splice')) {
      return 'arrays';
    } else if (text.includes('promise') || text.includes('async') || text.includes('prototype') || text.includes('closure')) {
      return 'advanced';
    } else {
      return 'basics';
    }
  }, []);

  // Function to create topics chart
  const createTopicsChart = useCallback(() => {
    if (!topicsChartCanvasRef.current) return;
    
    // Initialize categories with default counts
    const categories: Categories = {
      'Basics': 0,
      'Functions': 0,
      'Objects': 0,
      'Arrays': 0,
      'Advanced': 0
    };
    
    // Count questions by category using the same logic as filtering
    questionsData.forEach(question => {
      const category = determineQuestionCategory(question);
      const key = category.charAt(0).toUpperCase() + category.slice(1);
      categories[key as keyof Categories]++;
    });
    
    // Define chart colors
    const colors = [
      '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'
    ];
    
    // Create or update chart
    if (topicsChartRef.current) {
      topicsChartRef.current.destroy();
    }
    
    topicsChartRef.current = new Chart(topicsChartCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: isDarkTheme ? '#e6e6e6' : '#333',
              font: {
                family: 'Poppins, sans-serif',
                size: 12
              },
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: {dataIndex: number; dataset: {data: number[]}}) {
                const dataset = context.dataset;
                const total = dataset.data.reduce((acc: number, cur: number) => acc + cur, 0);
                const value = dataset.data[context.dataIndex];
                const percentage = Math.round((value / total) * 100);
                return `${value} questions (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }, [questionsData, isDarkTheme, determineQuestionCategory]);

  // Function to filter questions
  const filterQuestions = useCallback(() => {
    let filtered = [...questionsData];
    
    // Apply search filter - only search in question text, not answer
    // This matches the original implementation
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(q => q.question.toLowerCase().includes(search));
    }
    
    // Apply category filter based on question content
    if (currentFilter !== 'all') {
      filtered = filtered.filter(q => determineQuestionCategory(q) === currentFilter);
    }
    
    // Apply sort order
    switch (sortOrder) {
      case 'id':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'id-desc':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'alpha':
        filtered.sort((a, b) => a.question.localeCompare(b.question));
        break;
      case 'alpha-desc':
        filtered.sort((a, b) => b.question.localeCompare(a.question));
        break;
    }
    
    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [questionsData, currentFilter, sortOrder, searchTerm, determineQuestionCategory]);

  // Load initial data
  useEffect(() => {
    // Load questions data
    setQuestionsData(questionsDataImport as Question[]);
    setFilteredQuestions(questionsDataImport as Question[]);
    
    // Client-side only code that uses localStorage
    if (typeof window !== 'undefined') {
      // Only load data if user is signed in
      if (isSignedIn) {
        // Load bookmarks from localStorage
        const savedBookmarks = localStorage.getItem(`bookmarkedQuestions-${user?.id}`);
        if (savedBookmarks) {
          setBookmarkedQuestions(JSON.parse(savedBookmarks));
        }
        
        // Load recently viewed from localStorage
        const savedRecentlyViewed = localStorage.getItem(`recentlyViewed-${user?.id}`);
        if (savedRecentlyViewed) {
          setRecentlyViewed(JSON.parse(savedRecentlyViewed));
        }
      }
      
      // Initialize theme
      const savedTheme = localStorage.getItem('darkTheme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme ? JSON.parse(savedTheme) : prefersDark;
      setIsDarkTheme(initialTheme);
      
      // Apply initial theme to body
      document.body.classList.toggle('dark-theme', initialTheme);
    }
    
    // Set up marked.js with default options, we'll handle syntax highlighting separately
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }, [isSignedIn, user]);
  
  // Effect for creating/updating the topics chart
  useEffect(() => {
    if (questionsData.length > 0 && topicsChartCanvasRef.current) {
      createTopicsChart();
    }
  }, [questionsData, isDarkTheme, createTopicsChart]);
  
  // Effect for applying theme changes
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkTheme', JSON.stringify(isDarkTheme));
    }
  }, [isDarkTheme]);
  
  // Effect for filtering questions
  useEffect(() => {
    filterQuestions();
  }, [filterQuestions]);
  
  // Effect for storing bookmarks in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isSignedIn && user) {
      localStorage.setItem(`bookmarkedQuestions-${user.id}`, JSON.stringify(bookmarkedQuestions));
    }
  }, [bookmarkedQuestions, isSignedIn, user]);
  
  // Effect for storing recently viewed in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isSignedIn && user) {
      localStorage.setItem(`recentlyViewed-${user.id}`, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, isSignedIn, user]);
  
  // Function to open question details in modal
  const openQuestionDetails = (question: Question) => {
    setCurrentQuestionId(question.id);
    addToRecentlyViewed(question.id);
    
    // Add modal open class
    if (modalRef.current) {
      modalRef.current.classList.add('open');
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    // Update document title
    document.title = `JS Q&A - ${question.question}`;
    
    // Apply syntax highlighting after the modal is opened
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 100);
  };
  
  // Function to close modal
  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove('open');
      // Re-enable body scrolling when modal is closed
      document.body.style.overflow = '';
    }
    document.title = 'JavaScript Interview Q&A';
  };
  
  // Function to toggle bookmark status
  const toggleBookmark = (id: number) => {
    setBookmarkedQuestions(prev => {
      // Check if already bookmarked
      if (prev.includes(id)) {
        // Remove from bookmarks
        return prev.filter(bookmarkId => bookmarkId !== id);
      } else {
        // Add to bookmarks
        return [...prev, id];
      }
    });
    
    // If we're in the bookmarks page and removing a bookmark,
    // we need to refilter the questions to update the UI immediately
    if (activePage === 'bookmarks' && bookmarkedQuestions.includes(id)) {
      setTimeout(() => filterQuestions(), 10);
    }
  };
  
  // Function to add question to recently viewed
  const addToRecentlyViewed = (id: number) => {
    // Add to recently viewed list
    setRecentlyViewed(prev => {
      // Remove the id if it already exists
      const filtered = prev.filter(viewedId => viewedId !== id);
      // Add the id at the beginning
      return [id, ...filtered].slice(0, 5); // Keep only the 5 most recent
    });
  };
  
  // Function to switch between pages
  const switchPage = (page: string) => {
    setActivePage(page);
    // Reset search when changing pages
    if (page !== 'all-questions') {
      setSearchTerm('');
    }
  };
  
  // Function to toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };
  
  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsSidebarOpen(prev => !prev);
    // When sidebar is opened, prevent body scrolling
    if (!isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Function to handle logout
  const handleLogout = () => {
    signOut();
  };
  
  // Function to render pagination with improved handling for many pages
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
    const pages = [];
    
    // Only show pagination if there are more than one page
    if (totalPages <= 1) return null;
    
    // Previous button
    pages.push(
      <button 
        key="prev" 
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );
    
    // Calculate range of page numbers to display
    // Show a maximum of 5 pages
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust startPage if endPage is at max
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    // Show first page with ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(1)}
          aria-label="Go to page 1"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="pagination-ellipsis">...</span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) { // Skip first and last page as they're handled separately
        pages.push(
          <button
            key={i}
            className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
            onClick={() => setCurrentPage(i)}
            aria-label={`Go to page ${i}`}
          >
            {i}
          </button>
        );
      }
    }
    
    // Show last page with ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="pagination-ellipsis">...</span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          className={`pagination-btn ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => setCurrentPage(totalPages)}
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button 
        key="next" 
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    );
    
    return <div className="pagination">{pages}</div>;
  };
  
  // Get current questions for pagination
  const getCurrentQuestions = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + questionsPerPage);
  };
  
  // Get current question detail
  const getCurrentQuestion = () => {
    if (!currentQuestionId) return null;
    return questionsData.find(q => q.id === currentQuestionId) || null;
  };
  
  // Get bookmarked questions
  const getBookmarkedQuestions = () => {
    return questionsData.filter(q => bookmarkedQuestions.includes(q.id));
  };
  
  // Get recently viewed questions
  const getRecentlyViewedQuestions = () => {
    return recentlyViewed
      .map(id => questionsData.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
  };
  
  // Get popular questions - using first several questions as in original implementation
  const getPopularQuestions = () => {
    return [...questionsData]
      .sort((a, b) => a.id - b.id)
      .slice(0, 5);
  };
  
  // Get topic for a question
  const getQuestionTopic = (question: Question) => {
    return determineQuestionCategory(question);
  };

  // Add event listener for escape key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Check for and handle any gear icon / settings button
  useEffect(() => {
    // Find any gear icon or settings button that might be duplicating functionality
    const gearButtons = document.querySelectorAll('.js-qa-app .settings-btn, .js-qa-app .gear-icon');
    
    // If there are multiple gear buttons/icons, hide all but one
    if (gearButtons.length > 1) {
      // Convert NodeList to Array and skip the first element (keep that one visible)
      Array.from(gearButtons).slice(1).forEach((button) => {
        if (button instanceof HTMLElement) {
          button.style.display = 'none';
        }
      });
    }
  }, []);

  return (
    <div className={`js-qa-app ${isDarkTheme ? 'dark-theme' : ''}`}>
      <div className="app-container">
        {/* Mobile Menu Button - visible only on mobile */}
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
            onClick={() => {
              setIsSidebarOpen(false);
              document.body.style.overflow = '';
            }}
          ></div>
        )}
        
        {/* Improved app header - removing theme toggle */}
        <header className="app-header">
          <div className="header-left">
            <h1 className="app-title">JavaScript Interview Q&A</h1>
          </div>
          <div className="header-right">
            {/* Theme toggle removed from here */}
            {/* Keep a minimal user button in the header for mobile */}
            <div className="sm:hidden">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </header>
        
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="logo">
            <i className="fas fa-code"></i>
            <h1>JS Q&A</h1>
          </div>
          
          <div className="theme-toggle mb-4">
            <span className="toggle-label">Theme</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isDarkTheme}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <nav className="sidebar-nav">
            <a 
              href="#" 
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); switchPage('dashboard'); }}
            >
              <i className="fas fa-home"></i>
              <span>Statistics</span>
            </a>
            <a 
              href="#" 
              className={`nav-item ${activePage === 'all-questions' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); switchPage('all-questions'); }}
            >
              <i className="fas fa-list"></i>
              <span>All Questions</span>
            </a>
            <a 
              href="#" 
              className={`nav-item ${activePage === 'bookmarks' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); switchPage('bookmarks'); }}
            >
              <i className="fas fa-bookmark"></i>
              <span>Bookmarks</span>
            </a>
          </nav>
          
          {/* Auth section in sidebar */}
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
                    <div className="font-medium">{user?.firstName || user?.username || 'User'}</div>
                    <div className="text-gray-500 text-xs">{user?.primaryEmailAddress?.emailAddress || ''}</div>
                  </div>
                </div>
                <Link href="/dashboard" className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-all text-sm flex items-center justify-center">
                  <i className="fas fa-user-circle mr-2"></i> Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all text-sm flex items-center justify-center"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i> Logout
                </button>
              </div>
            </SignedIn>
          </div>
          
          <div className="sidebar-footer">
            <p>&copy; 2025 JavaScript Q&A</p>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="main-content">
          <header className="main-header">
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{questionsData.length}</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{bookmarkedQuestions.length}</span>
                <span className="stat-label">Bookmarked</span>
              </div>
            </div>
          </header>
          
          {/* Dashboard Page */}
          <div className={`page-content ${activePage === 'dashboard' ? 'active' : ''}`}>
            <h2 className="page-title">Interview Questions</h2>
            
            <div className="dashboard-grid">
              <div className="card stats-card">
                <h3>Statistics</h3>
                <div className="stats-container">
                  <div className="stat-box">
                    <span className="stat-number">{questionsData.length}</span>
                    <span className="stat-text">Total Questions</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number">5</span>
                    <span className="stat-text">Topics</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number">{recentlyViewed.length}</span>
                    <span className="stat-text">Questions Viewed</span>
                  </div>
                </div>
              </div>
              
              <div className="card chart-card">
                <h3>Questions by Topic</h3>
                <div className="chart-container">
                  <canvas ref={topicsChartCanvasRef}></canvas>
                </div>
              </div>
              
              <div className="card recent-card">
                <h3>Recently Viewed</h3>
                <ul className="recent-list">
                  {getRecentlyViewedQuestions().length > 0 ? (
                    getRecentlyViewedQuestions().map(question => (
                      <li key={`recent-${question.id}`}>
                        <a href="#" onClick={(e) => { e.preventDefault(); openQuestionDetails(question); }}>
                          {question.question}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="empty-list">No questions viewed yet</li>
                  )}
                </ul>
              </div>
              
              <div className="card popular-card">
                <h3>Popular Questions</h3>
                <ul className="popular-list">
                  {getPopularQuestions().map(question => (
                    <li key={`popular-${question.id}`}>
                      <a href="#" onClick={(e) => { e.preventDefault(); openQuestionDetails(question); }}>
                        {question.question}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* All Questions Page */}
          <div className={`page-content ${activePage === 'all-questions' ? 'active' : ''}`}>
            <h2 className="page-title">All Questions</h2>
            
            <div className="filters-container">
              <div className="filter-group">
                <button 
                  className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'basics' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('basics')}
                >
                  Basics
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'advanced' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('advanced')}
                >
                  Advanced
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'functions' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('functions')}
                >
                  Functions
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'objects' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('objects')}
                >
                  Objects
                </button>
                <button 
                  className={`filter-btn ${currentFilter === 'arrays' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('arrays')}
                >
                  Arrays
                </button>
              </div>
              <div className="sort-group">
                <label htmlFor="sort-select">Sort By:</label>
                <select 
                  id="sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="id">ID (Ascending)</option>
                  <option value="id-desc">ID (Descending)</option>
                  <option value="alpha">Alphabetical</option>
                  <option value="alpha-desc">Reverse Alphabetical</option>
                </select>
              </div>
            </div>
            
            <div className="questions-grid">
              {getCurrentQuestions().map(question => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-id">#{question.id}</span>
                    <button 
                      className={`bookmark-icon ${bookmarkedQuestions.includes(question.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking bookmark
                        toggleBookmark(question.id);
                      }}
                      aria-label={bookmarkedQuestions.includes(question.id) ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      <i className={`${bookmarkedQuestions.includes(question.id) ? 'fas' : 'far'} fa-bookmark`}></i>
                    </button>
                  </div>
                  <h3 className="question-title">{question.question}</h3>
                  <div className="question-tags">
                    <span className="question-tag">{getQuestionTopic(question)}</span>
                  </div>
                  <button 
                    className="view-btn"
                    onClick={() => openQuestionDetails(question)}
                  >
                    View Answer
                  </button>
                  {/* Add bookmark indicator as in the original implementation */}
                  {/* Show bookmark indicator on the card */}
                  {bookmarkedQuestions.includes(question.id) && (
                    <i className="fas fa-bookmark bookmark-indicator"></i>
                  )}
                </div>
              ))}
            </div>
            
            {renderPagination()}
          </div>
          
          {/* Bookmarks Page */}
          <div className={`page-content ${activePage === 'bookmarks' ? 'active' : ''}`}>
            <h2 className="page-title">Bookmarked Questions</h2>
            
            <div className="bookmarks-container">
              {getBookmarkedQuestions().length > 0 ? (
                getBookmarkedQuestions().map(question => (
                  <div key={`bookmark-${question.id}`} className="bookmark-item">
                    <div className="bookmark-content">
                      <h3>{question.question}</h3>
                    </div>
                    <div className="bookmark-actions">
                      <button 
                        className="view-answer-btn"
                        onClick={() => openQuestionDetails(question)}
                      >
                        View Answer
                      </button>
                      <button 
                        className="remove-bookmark-btn"
                        onClick={() => toggleBookmark(question.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-bookmarks">
                  <i className="far fa-bookmark"></i>
                  <p>No bookmarked questions yet</p>
                  <p>Click the bookmark icon on any question to save it here</p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        {/* Question Detail Modal */}
        <div className="modal" ref={modalRef} id="question-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {getCurrentQuestion() && (
                <>
                  <h2>{getCurrentQuestion()?.question}</h2>
                  <button 
                    className={`bookmark-btn ${bookmarkedQuestions.includes(getCurrentQuestion()?.id || 0) ? 'active' : ''}`}
                    onClick={() => getCurrentQuestion() && toggleBookmark(getCurrentQuestion()!.id)}
                    aria-label="Bookmark question"
                  >
                    <i className={`${bookmarkedQuestions.includes(getCurrentQuestion()?.id || 0) ? 'fas' : 'far'} fa-bookmark`}></i>
                  </button>
                </>
              )}
              <button 
                className="close-btn" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {getCurrentQuestion() && (
                <div 
                  className="answer-content"
                  dangerouslySetInnerHTML={{ 
                    __html: marked.parse(getCurrentQuestion()?.answer || '') 
                  }}
                  ref={(node) => {
                    // Apply syntax highlighting after content is rendered
                    if (node) {
                      node.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block as HTMLElement);
                      });
                    }
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
