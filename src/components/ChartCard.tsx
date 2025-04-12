'use client';

import { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext'; // Adjust path
import { Chart } from 'chart.js';

export default function ChartCard() {
  const { createTopicsChart, isDarkTheme, questionsData } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (canvasRef.current && questionsData.length > 0) {
      // Destroy previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      // Create new chart and store instance
      chartInstanceRef.current = createTopicsChart(canvasRef.current);
    }

    // Cleanup function to destroy chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  // Re-run effect if chart creation logic, theme, or data changes
  }, [createTopicsChart, isDarkTheme, questionsData]);

  return (
    <div className="card chart-card">
      <h3>Questions by Topic</h3>
      <div className="chart-container">
        {/* Render canvas only when data is available to avoid Chart.js errors */}
        {questionsData.length > 0 ? (
          <canvas ref={canvasRef}></canvas>
        ) : (
          <p>Loading chart data...</p> // Or some placeholder
        )}
      </div>
    </div>
  );
} 