'use client';

import React, { createContext, useState, useEffect, useContext, useRef, useCallback, ReactNode } from 'react';
import { Chart, ChartItem } from 'chart.js/auto';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.min.css';
import { useUser } from '@clerk/nextjs';

// Define TypeScript interfaces
export interface Question {
  id: number;
  question: string;
  answer: string;
  topic?: string; // Optional topic property
}

export interface Categories {
  Basics: number;
  Functions: number;
  Objects: number;
  Arrays: number;
  Advanced: number;
  [key: string]: number; // Allow string indexing
}

// Interface for context state
interface AppContextState {
  questionsData: Question[]; // Raw data from API for lookups (e.g., modal)
  totalQuestions: number;
  filteredQuestions: Question[]; // Questions for the current view (page, filters applied)
  currentQuestionId: number | null;
  bookmarkedQuestions: number[];
  recentlyViewed: number[];
  currentPage: number;
  currentFilter: string;
  sortOrder: string;
  searchTerm: string;
  isDarkTheme: boolean;
  loading: boolean;
  questionsPerPage: number;
}

// Interface for context value (state + functions)
interface AppContextProps extends AppContextState {
  fetchQuestions: (page?: number, limit?: number) => Promise<void>;
  setCurrentFilter: React.Dispatch<React.SetStateAction<string>>;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  toggleTheme: () => void;
  toggleBookmark: (id: number) => void;
  openQuestionDetails: (question: Question) => void;
  closeModal: () => void;
  determineQuestionCategory: (question: Question) => string;
  createTopicsChart: (canvas: ChartItem) => Chart | null; // Takes ChartItem (Canvas element)
  getCurrentQuestion: () => Question | null;
  getBookmarkedQuestions: () => Question[]; // Derived from questionsData
  getRecentlyViewedQuestions: () => Question[]; // Derived from questionsData
  getPopularQuestions: () => Question[]; // Derived from questionsData
  getQuestionTopic: (question: Question) => string;
}

// Create Context with undefined initial value
const AppContext = createContext<AppContextProps | undefined>(undefined);

// Provider Component
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn, user } = useUser();

  // --- State Variables ---
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]); // Holds the current page's filtered/sorted data
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('id');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [loading, setLoading] = useState(true);

  const questionsPerPage = 12;
  const topicsChartRef = useRef<Chart | null>(null); // Ref to manage the chart instance internally

  // --- Logic / Functions ---

  // Determine category based on question content
  const determineQuestionCategory = useCallback((question: Question): string => {
    const text = question.question.toLowerCase();
    if (text.includes('function') || text.includes('callback')) return 'functions';
    if (text.includes('object') || text.includes('json')) return 'objects';
    if (text.includes('array') || text.includes('splice')) return 'arrays';
    if (text.includes('promise') || text.includes('async') || text.includes('prototype') || text.includes('closure')) return 'advanced';
    return 'basics';
  }, []);

  // Fetch questions from the API for a specific page
  const fetchQuestions = useCallback(async (page = 1, limit = questionsPerPage) => {
    try {
      setLoading(true);
      setCurrentPage(page); // Update current page state
      const response = await fetch(`/api/questions?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }
      const data = await response.json();

      setQuestionsData(data.questions); // Store raw fetched data for this page
      setTotalQuestions(data.totalQuestions);

      // Apply filtering and sorting *to the fetched page data*
      let processedQuestions = [...data.questions];
      const searchLower = searchTerm.toLowerCase();
      if (searchTerm) {
        processedQuestions = processedQuestions.filter(q =>
          q.question.toLowerCase().includes(searchLower) ||
          q.answer.toLowerCase().includes(searchLower)
        );
      }
      if (currentFilter !== 'all') {
        processedQuestions = processedQuestions.filter(q => determineQuestionCategory(q) === currentFilter);
      }
      switch (sortOrder) {
        case 'id': processedQuestions.sort((a, b) => a.id - b.id); break;
        case 'id-desc': processedQuestions.sort((a, b) => b.id - a.id); break;
        case 'alpha': processedQuestions.sort((a, b) => a.question.localeCompare(b.question)); break;
        case 'alpha-desc': processedQuestions.sort((a, b) => b.question.localeCompare(a.question)); break;
      }
      setFilteredQuestions(processedQuestions); // Update the state holding the processed data for the current page

      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false); // Ensure loading is set to false on error
      setQuestionsData([]); // Clear data on error
      setFilteredQuestions([]);
      setTotalQuestions(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsPerPage, searchTerm, currentFilter, sortOrder, determineQuestionCategory]); // Dependencies for fetch logic

  // Function to create/update the topics chart
  const createTopicsChart = useCallback((canvas: ChartItem): Chart | null => {
    if (!canvas) return null;

    const categories: Categories = { 'Basics': 0, 'Functions': 0, 'Objects': 0, 'Arrays': 0, 'Advanced': 0 };
    // NOTE: This chart reflects the *currently fetched page* data (questionsData),
    // not necessarily all questions, unless the API changes or we fetch all data upfront.
    // For a chart of *all* questions, we'd need the full dataset or an aggregation API endpoint.
    questionsData.forEach(question => {
      const category = determineQuestionCategory(question);
      const key = category.charAt(0).toUpperCase() + category.slice(1);
      if (categories[key as keyof Categories] !== undefined) {
         categories[key as keyof Categories]++;
      }
    });

    const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'];

    if (topicsChartRef.current) {
      topicsChartRef.current.destroy(); // Destroy previous instance
    }

    // Create new chart instance
    topicsChartRef.current = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{ data: Object.values(categories), backgroundColor: colors, borderWidth: 0 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: isDarkTheme ? '#e6e6e6' : '#333', font: { family: 'Poppins, sans-serif', size: 12 }, padding: 20 } },
          tooltip: { callbacks: { label: (context) => {
            const total = context.dataset.data.reduce((acc, cur) => acc + cur, 0);
            const value = context.dataset.data[context.dataIndex];
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${value} questions (${percentage}%)`;
          }}}
        },
        animation: { animateScale: true, animateRotate: true }
      }
    });
    return topicsChartRef.current; // Return the new chart instance
  }, [questionsData, isDarkTheme, determineQuestionCategory]);

  // Toggle bookmark status
  const toggleBookmark = (id: number) => {
    setBookmarkedQuestions(prev =>
      prev.includes(id) ? prev.filter(bookmarkId => bookmarkId !== id) : [...prev, id]
    );
    // Note: Re-filtering logic if on bookmarks page will be handled by the bookmarks component
  };

  // Add question to recently viewed (keeping max 5)
  const addToRecentlyViewed = (id: number) => {
    setRecentlyViewed(prev => [id, ...prev.filter(viewedId => viewedId !== id)].slice(0, 5));
  };

  // Open question details modal
  const openQuestionDetails = (question: Question) => {
    setCurrentQuestionId(question.id);
    addToRecentlyViewed(question.id);
    // DOM manipulations (body scroll, title) will be handled in the Layout or Modal component
    // Syntax highlighting trigger will be in the Modal component
  };

  // Close question details modal
  const closeModal = () => {
    setCurrentQuestionId(null);
    // DOM manipulations (body scroll, title) will be handled in the Layout or Modal component
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  // --- Effects ---

  // Initialize theme and load initial data on mount
  useEffect(() => {
    // Load theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('darkTheme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkTheme(savedTheme ? JSON.parse(savedTheme) : prefersDark);
    }

    // Configure marked
    marked.setOptions({ breaks: true, gfm: true });

    // Fetch initial questions (page 1)
    fetchQuestions(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Load user-specific data when user context is available
  useEffect(() => {
    if (typeof window !== 'undefined' && isSignedIn && user) {
      const savedBookmarks = localStorage.getItem(`bookmarkedQuestions-${user.id}`);
      if (savedBookmarks) setBookmarkedQuestions(JSON.parse(savedBookmarks));

      const savedRecentlyViewed = localStorage.getItem(`recentlyViewed-${user.id}`);
      if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    } else if (!isSignedIn) {
      // Clear user-specific data on sign out
      setBookmarkedQuestions([]);
      setRecentlyViewed([]);
    }
  }, [isSignedIn, user]); // Run when auth state changes

  // Persist theme preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkTheme', JSON.stringify(isDarkTheme));
      // Applying class to body will be done in Layout
    }
  }, [isDarkTheme]);

  // Re-fetch page 1 when filters, sort order, or search term change
   useEffect(() => {
    // Avoid fetching immediately on mount if initial fetch is already running
    // Check if questionsData has content; prevents fetch before initial load completes.
    if (questionsData.length > 0 || totalQuestions > 0) {
      fetchQuestions(1); // Refetch page 1
    }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currentFilter, sortOrder, searchTerm]); // Dependencies that trigger a page 1 refetch


  // Persist bookmarks to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && isSignedIn && user) {
      localStorage.setItem(`bookmarkedQuestions-${user.id}`, JSON.stringify(bookmarkedQuestions));
    }
  }, [bookmarkedQuestions, isSignedIn, user]);

  // Persist recently viewed to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && isSignedIn && user) {
      localStorage.setItem(`recentlyViewed-${user.id}`, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, isSignedIn, user]);

  // --- Helper Getters ---

  // Get details for the currently selected question (for modal)
  const getCurrentQuestion = useCallback(() => {
    if (!currentQuestionId) return null;
    // Search within the raw data of the *currently fetched page*
    // Limitation: If the modal needs a question not on the current page, it won't find it.
    // A better approach might be a separate fetch or caching more data.
    return questionsData.find(q => q.id === currentQuestionId) || null;
  }, [currentQuestionId, questionsData]);

  // Get bookmarked questions *from the current page's data*
  const getBookmarkedQuestions = useCallback(() => {
    // This filters only the bookmarks present in the *currently fetched page's raw data* (questionsData).
    // The Bookmarks page will need a different strategy if it needs to show *all* bookmarks.
    // It might need to fetch specifically bookmarked question IDs.
    return questionsData.filter(q => bookmarkedQuestions.includes(q.id));
  }, [questionsData, bookmarkedQuestions]);

  // Get recently viewed questions *if they exist in the current page's data*
  const getRecentlyViewedQuestions = useCallback(() => {
    // Similar limitation as getBookmarkedQuestions.
    return recentlyViewed
      .map(id => questionsData.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
  }, [recentlyViewed, questionsData]);

  // Get popular questions (using first few from current page as placeholder)
  const getPopularQuestions = useCallback(() => {
    // Placeholder logic: Takes top 5 from the *currently fetched page*.
    return [...questionsData]
      .sort((a, b) => a.id - b.id) // Sort by ID if needed, or use original order
      .slice(0, 5);
  }, [questionsData]);

  // Get topic string for a question
  const getQuestionTopic = useCallback((question: Question) => {
    return determineQuestionCategory(question).charAt(0).toUpperCase() + determineQuestionCategory(question).slice(1);
  }, [determineQuestionCategory]);

  // --- Context Value ---
  const value: AppContextProps = {
    // State
    questionsData, totalQuestions, filteredQuestions, currentQuestionId, bookmarkedQuestions,
    recentlyViewed, currentPage, currentFilter, sortOrder, searchTerm, isDarkTheme, loading, questionsPerPage,
    // Functions
    fetchQuestions, setCurrentFilter, setSortOrder, setSearchTerm, toggleTheme, toggleBookmark,
    openQuestionDetails, closeModal, determineQuestionCategory, createTopicsChart,
    // Getters
    getCurrentQuestion, getBookmarkedQuestions, getRecentlyViewedQuestions, getPopularQuestions, getQuestionTopic,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom Hook to use the AppContext
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}; 