'use client';

import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { useAppContext } from '../context/AppContext'; // Adjust path

export default function QuestionModal() {
  const {
    currentQuestionId, // Check if a question is selected
    getCurrentQuestion, // Function to get the question details
    closeModal,         // Function to close the modal
    toggleBookmark,     // Function to toggle bookmark
    bookmarkedQuestions // State for bookmark icon
  } = useAppContext();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const currentQuestion = getCurrentQuestion(); // Get the current question details

  // Effect to handle modal opening animation and focus trapping (basic)
  useEffect(() => {
    if (currentQuestionId !== null && modalRef.current) {
      // Add slight delay for CSS transition
      setTimeout(() => {
        modalRef.current?.classList.add('open');
      }, 10);
      // Basic focus management: focus the modal content when opened
      modalRef.current?.focus();
    }
    // Cleanup handled by the layout (Escape key, body scroll)
  }, [currentQuestionId]);

  // Effect to apply syntax highlighting when the question content changes
  useEffect(() => {
    if (currentQuestion && modalBodyRef.current) {
      // Update document title
      document.title = `JS Q&A - ${currentQuestion.question}`;

      // Apply syntax highlighting
      const codeBlocks = modalBodyRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    } else {
      // Reset title if no question is selected (modal closed)
      document.title = 'JavaScript Interview Q&A';
    }
    // Dependency array includes currentQuestion to re-run when modal content changes
  }, [currentQuestion]);

  // Handle clicks outside the modal content but inside the modal overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  if (!currentQuestion) {
    return null; // Don't render anything if no question is selected
  }

  const isBookmarked = bookmarkedQuestions.includes(currentQuestion.id);

  return (
    <div
      className="modal" // Initial state is hidden, 'open' class controls visibility
      ref={modalRef}
      id="question-modal"
      onClick={handleOverlayClick} // Close on overlay click
      tabIndex={-1} // Make the modal focusable
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside content */}
        <div className="modal-header">
          <h2 id="modal-title">{currentQuestion.question}</h2>
          <button
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => toggleBookmark(currentQuestion.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <i className={`${isBookmarked ? 'fas' : 'far'} fa-bookmark`}></i>
          </button>
          <button
            className="close-btn"
            onClick={closeModal}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body" ref={modalBodyRef}>
          {/* Render markdown answer */}
          <div
            className="answer-content"
            dangerouslySetInnerHTML={{ __html: marked.parse(currentQuestion.answer || '') }}
          />
        </div>
      </div>
    </div>
  );
} 