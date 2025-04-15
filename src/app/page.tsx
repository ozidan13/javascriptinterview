'use client';

import { useState, useEffect } from 'react';
import { UserButton, useUser, SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect signed-in users to the dashboard
  useEffect(() => {
    // Ensure user state is loaded before redirecting
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard'); // Use replace to avoid adding landing page to history
    }
  }, [isSignedIn, isLoaded, router]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If user is signed in but redirect hasn't happened yet (rare), show loading or null
  if (isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
        <p className="ml-4">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-logo">
            <i className="fas fa-code"></i>
          </div>
          <h1 className="hero-title">JavaScript Interview Q&A</h1>
          <p className="hero-subtitle">Master your JavaScript interviews with interactive exercises, structured learning paths, and comprehensive resources</p>
          
          <div className="hero-actions">
            <SignedOut>
              <div className="hero-buttons">
                <SignInButton mode="modal">
                  <button className="hero-btn primary">
                    <i className="fas fa-sign-in-alt"></i> Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="hero-btn secondary">
                    <i className="fas fa-user-plus"></i> Sign Up
                  </button>
                </SignUpButton>
                <Link href="/dashboard">
                  <button className="hero-btn tertiary">
                    <i className="fas fa-external-link-alt"></i> Continue as Guest
                  </button>
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="hero-btn primary">
                  <i className="fas fa-chart-bar"></i> Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
          
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <div className="feature-content">
                <h3>300+ Questions</h3>
                <p>Covering all major JavaScript concepts</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-road"></i>
              </div>
              <div className="feature-content">
                <h3>Learning Roadmap</h3>
                <p>Structured path to JavaScript mastery</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="fas fa-bookmark"></i>
              </div>
              <div className="feature-content">
                <h3>Bookmark System</h3>
                <p>Save and organize important concepts</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <section className="landing-benefits">
        <div className="benefit-container">
          <h2>Why JavaScript Q&A?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <i className="fas fa-graduation-cap"></i>
              <h3>Structured Learning</h3>
              <p>Progressive learning paths designed by industry experts to build solid foundations</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-code"></i>
              <h3>Real-world Examples</h3>
              <p>Practical code examples that demonstrate how concepts apply in actual projects</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-tasks"></i>
              <h3>Progress Tracking</h3>
              <p>Monitor your progress and identify areas for improvement</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-laptop-code"></i>
              <h3>Interactive Exercises</h3>
              <p>Reinforce learning with hands-on coding challenges</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <i className="fas fa-code"></i>
            <span>JavaScript Q&A</span>
          </div>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="GitHub"><i className="fab fa-github"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div className="footer-copyright">
          &copy; 2025 JavaScript Q&A. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
