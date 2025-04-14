'use client';

import { useAppContext } from '../context/AppContext'; // Adjust if needed

export default function Pagination() {
  const { currentPage, totalQuestions, questionsPerPage, fetchQuestions, loading } = useAppContext();

  // Calculate total pages with a safety check to ensure it's at least 1
  const totalPages = totalQuestions ? Math.max(1, Math.ceil(totalQuestions / questionsPerPage)) : 1;
  
  // Show pagination if we know there are more pages or currently on a page > 1
  if ((totalPages <= 1 && currentPage <= 1) || loading) return null;

  const handlePageClick = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.max(totalPages, currentPage)) {
      fetchQuestions(newPage); // Fetch data for the new page
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(Math.max(totalPages, currentPage), startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} className="pagination-btn" onClick={() => handlePageClick(1)} aria-label="Go to page 1">1</button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageClick(i)}
          aria-label={`Go to page ${i}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} className="pagination-btn" onClick={() => handlePageClick(totalPages)} aria-label={`Go to page ${totalPages}`}>{totalPages}</button>
      );
    }
    return pages;
  };

  return (
    <div className="pagination">
      {/* Previous button */}
      <button
        key="prev"
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      {renderPageNumbers()}

      {/* Next button */}
      <button
        key="next"
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
} 