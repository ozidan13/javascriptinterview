'use client';

import { useAppContext } from '../context/AppContext'; // Adjust path

export default function StatsCard() {
  const {
    loading,
    totalQuestions,
    recentlyViewed,
    // Note: Number of topics is static (5) based on current category logic
  } = useAppContext();

  const topicsCount = 5;
  const viewedCount = recentlyViewed.length;

  return (
    <div className="card stats-card">
      <h3>Statistics</h3>
      <div className="stats-container">
        <div className="stat-box">
          <span className="stat-number">{loading ? '-' : totalQuestions}</span>
          <span className="stat-text">Total Questions</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{topicsCount}</span>
          <span className="stat-text">Topics</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{loading ? '-' : viewedCount}</span>
          <span className="stat-text">Questions Viewed</span>
        </div>
      </div>
    </div>
  );
} 