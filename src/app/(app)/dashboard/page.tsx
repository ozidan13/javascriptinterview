'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext'; // Corrected path
import ChartCard from '../../../components/ChartCard'; // Corrected path
import StatsCard from '../../../components/StatsCard'; // Corrected path
import RecentCard from '../../../components/RecentCard'; // Corrected path
import PopularCard from '../../../components/PopularCard'; // Corrected path

export default function DashboardPage() {
  const { loading } = useAppContext();

  // Update document title specifically for this page
  useEffect(() => {
    document.title = 'JS Q&A - Dashboard';
  }, []);

  if (loading) {
    // Optional: Show a page-specific loading state or rely on the layout's loading
    return (
      <div className="page-content active"> {/* Keep structure consistent */}
        <h2 className="page-title">Dashboard</h2>
        <div className="loading-container-small"><div className="loading-spinner-small"></div> Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-content active"> {/* Use 'active' to match original styling approach */}
      <h2 className="page-title">Interview Questions Dashboard</h2>

      <div className="dashboard-grid">
        {/* Replace inline card structure with imported components */}
        <StatsCard />
        <ChartCard />
        <RecentCard />
        <PopularCard />
      </div>
    </div>
  );
} 