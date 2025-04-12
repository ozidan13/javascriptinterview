'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext'; // Adjust path as needed
import QuestionCard from '../../../components/QuestionCard'; // Adjust path
import Pagination from '../../../components/Pagination'; // Adjust path

export default function AllQuestionsPage() {
  const {
    loading,
    filteredQuestions,
    currentFilter,
    setCurrentFilter,
    sortOrder,
    setSortOrder,
  } = useAppContext();

  // Update document title specifically for this page
  useEffect(() => {
    document.title = 'JS Q&A - All Questions';
  }, []);

  return (
    <div className="page-content active"> {/* Use 'active' to match original styling */}
      <h2 className="page-title">All Questions</h2>

      <div className="filters-container">
        <div className="filter-group">
          {/* Filter Buttons - Reflect context state and update context on click */}
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
          {/* Sort Select - Reflect context state and update context on change */}
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

      {loading ? (
        <div className="loading-container-small"><div className="loading-spinner-small"></div> Loading Questions...</div>
      ) : (
        <>
          <div className="questions-grid">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(question => (
                <QuestionCard key={question.id} question={question} />
              ))
            ) : (
              <div className="empty-list">No questions match the current filters.</div>
            )}
          </div>
          <Pagination />
        </>
      )}
    </div>
  );
} 