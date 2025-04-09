'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.min.css';
import './js-qa-styles.css';

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

  // Load initial data
  useEffect(() => {
    // Load questions data
    setQuestionsData(questionsDataImport as Question[]);
    setFilteredQuestions(questionsDataImport as Question[]);
    
    // Client-side only code that uses localStorage
    if (typeof window !== 'undefined') {
      // Load bookmarks from localStorage
      const savedBookmarks = localStorage.getItem('bookmarkedQuestions');
      if (savedBookmarks) {
        setBookmarkedQuestions(JSON.parse(savedBookmarks));
      }
      
      // Load recently viewed from localStorage
      const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
      if (savedRecentlyViewed) {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
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
  }, []);
  
  // Effect for creating/updating the topics chart
  useEffect(() => {
    if (questionsData.length > 0 && topicsChartCanvasRef.current) {
      createTopicsChart();
    }
  }, [questionsData, isDarkTheme]);
  
  // Effect for applying theme changes
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkTheme', JSON.stringify(isDarkTheme));
    }
  }, [isDarkTheme]);
  
  // Function to filter questions
  const filterQuestions = () => {
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
  };

  // Effect for filtering questions
  useEffect(() => {
    filterQuestions();
  }, [questionsData, currentFilter, sortOrder, searchTerm]);
  
  // Effect for storing bookmarks in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarkedQuestions', JSON.stringify(bookmarkedQuestions));
    }
  }, [bookmarkedQuestions]);
  
  // Effect for storing recently viewed in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  const createTopicsChart = () => {
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
  };

  // Function to determine a question's category based on content
  const determineQuestionCategory = (question: Question): string => {
    const text = question.question.toLowerCase();
    
    if (text.includes('function') || text.includes('callback')) {
      return 'functions';
    } else if (text.includes('object') || text.includes('json')) {
      return 'objects';
    } else if (text.includes('array') || text.includes('splice')) {
      return 'arrays';
    } else if (question.id > 50) {
      return 'advanced';
    } else {
      return 'basics';
    }
  };



  // Function to open question details in modal
  const openQuestionDetails = (question: Question) => {
    setCurrentQuestionId(question.id);
    addToRecentlyViewed(question.id);
    
    // Add modal open class
    if (modalRef.current) {
      modalRef.current.classList.add('open');
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
  };
  
  // Function to render pagination
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
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );
    
    // Calculate range of page numbers to display
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start if end is at max
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
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

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <i className="fas fa-code"></i>
          <h1>JS Q&A</h1>
        </div>
        
        <div className="theme-toggle">
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
        
        <div className="sidebar-footer">
          <p>&copy; 2025 JavaScript Q&A</p>
        </div>
      </aside>
      
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
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
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
      <div className="modal" ref={modalRef} id="question-modal">
        <div className="modal-content">
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
  );
}
