'use client';

import { useAppContext } from '../context/AppContext'; // Adjust path

export default function MainHeader() {
  const {
    searchTerm,
    setSearchTerm,
    totalQuestions,
    bookmarkedQuestions,
    loading,
  } = useAppContext();

  return (
    <header className="main-header">
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
        <div className="search-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search for questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for questions"
            className="focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{loading ? '-' : totalQuestions}</span>
            <span className="stat-label">Total Questions</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{bookmarkedQuestions.length}</span>
            <span className="stat-label">Bookmarked</span>
          </div>
        </div>
      </div>
    </header>
  );
} 