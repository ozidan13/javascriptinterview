'use client';

import { useEffect, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext'; // Adjust path as needed

export default function BookmarksPage() {
  const {
    loading,
    questionsData, // Use the raw data from the current page
    bookmarkedQuestions: bookmarkedIds, // Renamed for clarity
    openQuestionDetails,
    toggleBookmark,
  } = useAppContext();

  // Filter the *current page's* data to find bookmarked questions
  const currentBookmarks = useMemo(() => {
    return questionsData.filter(q => bookmarkedIds.includes(q.id));
  }, [questionsData, bookmarkedIds]);

  // Update document title specifically for this page
  useEffect(() => {
    document.title = 'JS Q&A - Bookmarks';
  }, []);

  return (
    <div className="page-content active"> {/* Use 'active' to match original styling */}
      <h2 className="page-title">Bookmarked Questions</h2>

      {loading ? (
        <div className="loading-container-small"><div className="loading-spinner-small"></div> Loading Bookmarks...</div>
      ) : (
        <div className="bookmarks-container">
          {currentBookmarks.length > 0 ? (
            currentBookmarks.map(question => (
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
                    onClick={() => toggleBookmark(question.id)} // Use toggleBookmark from context
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-bookmarks">
              <i className="far fa-bookmark"></i>
              <p>No bookmarked questions found</p>
              {/* Clarify that this shows bookmarks *on the current page* if using Option 3 */} 
              <p>Click the bookmark icon on any question to save it here.</p>
              <p className="text-xs text-gray-500 mt-2">(Note: Bookmarks are shown based on the currently loaded questions.)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 