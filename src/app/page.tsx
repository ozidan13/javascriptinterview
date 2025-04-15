'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chart } from 'chart.js/auto';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.min.css';
import { UserButton, useUser, SignInButton, SignUpButton, SignedIn, SignedOut, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use App Router's navigation hook

// Define TypeScript interfaces
interface Question {
  id: number;
  question: string;
  answer: string;
  topic?: string;
}

interface Categories {
  Basics: number;
  Functions: number;
  Objects: number;
  Arrays: number;
  Advanced: number;
  [key: string]: number;
}

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
      ); // Or null, redirect should be fast
  }

  // Render landing/login prompt for signed-out users
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center p-4">
        <i className="fas fa-code text-6xl text-blue-600 mb-6"></i>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">JavaScript Interview Q&A</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
            Master your JavaScript interviews. Explore questions, track your progress, and bookmark key concepts.
        </p>
        <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4">
                <SignInButton mode="modal">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-lg shadow-md flex items-center justify-center">
                        <i className="fas fa-sign-in-alt mr-2"></i> Sign In
                    </button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all text-lg shadow-md flex items-center justify-center">
                        <i className="fas fa-user-plus mr-2"></i> Sign Up
                    </button>
                </SignUpButton>
            </div>
            <p className="mt-6 text-gray-500 text-sm">Sign in or sign up to access the questions.</p>
        </SignedOut>
        {/* This part should technically not be reachable if SignedIn redirects */}
        <SignedIn>
            <p className="text-green-600">You are signed in.</p>
            <Link href="/dashboard">
                <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-lg shadow-md">
                    Go to Dashboard
                </button>
            </Link>
        </SignedIn>
        <Link href="/dashboard">
                <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-lg shadow-md">
                    Continue without signing in
                </button>
        </Link>
        <footer className="absolute bottom-4 text-gray-400 text-xs">
            &copy; 2025 JavaScript Q&A
        </footer>
    </div>
  );
}
