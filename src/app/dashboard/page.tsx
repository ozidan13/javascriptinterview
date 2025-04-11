'use client';

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication status when component mounts
    if (isLoaded) {
      if (!isSignedIn) {
        // Redirect to sign-in if not authenticated
        router.push("/sign-in");
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  const handleLogout = () => {
    signOut().then(() => {
      router.push("/");
    });
  };

  const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Show loading state while checking authentication
  if (loading || !isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-user-circle text-blue-600 mr-2"></i>
                Account Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <i className="fas fa-envelope text-blue-500 mr-2"></i>
                    Email Address
                  </p>
                  <p className="font-medium text-gray-800">{user?.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <i className="fas fa-calendar-plus text-blue-500 mr-2"></i>
                    Account Created
                  </p>
                  <p className="font-medium text-gray-800">{formatDate(user?.createdAt)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <i className="fas fa-sign-in-alt text-blue-500 mr-2"></i>
                    Last Sign In
                  </p>
                  <p className="font-medium text-gray-800">{formatDate(user?.lastSignInAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 transition-all hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-rocket text-blue-600 mr-2"></i>
                  Getting Started
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs mr-3 mt-0.5 transform transition-transform group-hover:scale-110 shadow-md">1</div>
                    <div>
                      <p className="font-semibold text-gray-800">Browse Interview Questions</p>
                      <p className="text-gray-500 text-sm mt-1">Explore our collection of JavaScript interview questions.</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs mr-3 mt-0.5 transform transition-transform group-hover:scale-110 shadow-md">2</div>
                    <div>
                      <p className="font-semibold text-gray-800">Bookmark Questions</p>
                      <p className="text-gray-500 text-sm mt-1">Save important questions to review later.</p>
                    </div>
                  </li>
                  <li className="flex items-start group">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs mr-3 mt-0.5 transform transition-transform group-hover:scale-110 shadow-md">3</div>
                    <div>
                      <p className="font-semibold text-gray-800">Track Your Progress</p>
                      <p className="text-gray-500 text-sm mt-1">Monitor which questions you've reviewed and bookmarked.</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/" className="inline-flex items-center px-5 py-2.5 rounded bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium text-sm hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <span>Start exploring</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 transition-all hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-history text-blue-600 mr-2"></i>
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 py-2 hover:bg-blue-50 rounded transition-colors">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 mr-2">
                        <i className="fas fa-sign-in-alt text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Signed in to your account</p>
                        <p className="text-xs text-gray-400 mt-1">Just now</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-green-500 pl-4 py-2 hover:bg-green-50 rounded transition-colors">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-1.5 rounded-full text-green-600 mr-2">
                        <i className="fas fa-user-plus text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Account created</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(user?.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Connect More Accounts</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2 text-red-500">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                      </svg>
                      Google
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2 text-gray-800">
                        <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                      </svg>
                      GitHub
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <i className="fas fa-chart-line mr-2"></i>
                  Your Learning Progress
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-6 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Questions Viewed</span>
                    <span className="text-sm font-medium text-gray-700">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div className="mb-6 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Questions Bookmarked</span>
                    <span className="text-sm font-medium text-gray-700">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <div className="mb-6 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Days Active</span>
                    <span className="text-sm font-medium text-gray-700">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white shadow-md rounded-lg border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <i className="fas fa-user-circle mr-2"></i>
                Profile Information
              </h3>
            </div>
            <div className="p-6">
              <div className="max-w-xl">
                <div className="flex flex-col sm:flex-row sm:items-center mb-8 pb-6 border-b border-gray-200">
                  <div className="sm:w-1/3 mb-4 sm:mb-0">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <i className="fas fa-camera text-blue-500 mr-2"></i>
                      Profile Picture
                    </p>
                  </div>
                  <div className="sm:w-2/3 flex items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mr-5 shadow-md border-2 border-white">
                      {user?.imageUrl ? (
                        <Image 
                          src={user.imageUrl} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                          width={80}
                          height={80} 
                        />
                      ) : (
                        <span className="text-3xl text-blue-600 font-semibold">{(user?.firstName?.[0] || user?.lastName?.[0] || "?").toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Update your profile picture by clicking your user icon at the top of the sidebar</p>
                      <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
                        <i className="fas fa-pen mr-1"></i> Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center mb-8 pb-6 border-b border-gray-200">
                  <div className="sm:w-1/3 mb-4 sm:mb-0">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <i className="fas fa-user text-blue-500 mr-2"></i>
                      Full Name
                    </p>
                  </div>
                  <div className="sm:w-2/3">
                    <p className="text-gray-900 font-medium">{user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.firstName || user?.username || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center mb-8 pb-6 border-b border-gray-200">
                  <div className="sm:w-1/3 mb-4 sm:mb-0">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <i className="fas fa-envelope text-blue-500 mr-2"></i>
                      Email Address
                    </p>
                  </div>
                  <div className="sm:w-2/3">
                    <p className="text-gray-900 font-medium">{user?.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
                    <div className="mt-1 flex items-center">
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">Verified</span>
                      <p className="text-sm text-gray-500 ml-2">Used for account-related notifications</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <div className="sm:w-1/3 mb-4 sm:mb-0">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <i className="fas fa-shield-alt text-blue-500 mr-2"></i>
                      Account Security
                    </p>
                  </div>
                  <div className="sm:w-2/3">
                    <button 
                      onClick={handleLogout}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-medium text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:from-red-700 hover:to-red-800"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                    </button>
                    <p className="text-sm text-gray-500 mt-2">This will sign you out of your account on this device</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white shadow-md rounded-lg border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <i className="fas fa-cog mr-2"></i>
                Application Settings
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-palette text-blue-500 mr-2"></i>
                  Theme Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="light-theme" 
                      name="theme" 
                      className="sr-only peer" 
                      defaultChecked 
                    />
                    <label htmlFor="light-theme" className="flex p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500">
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 rounded-full bg-white shadow-sm"></div>
                        <div>
                          <span className="block font-medium text-gray-800">Light</span>
                          <span className="block text-xs text-gray-500">Default light mode</span>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="dark-theme" 
                      name="theme" 
                      className="sr-only peer" 
                    />
                    <label htmlFor="dark-theme" className="flex p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500">
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 rounded-full bg-gray-800 shadow-sm"></div>
                        <div>
                          <span className="block font-medium text-gray-800">Dark</span>
                          <span className="block text-xs text-gray-500">Easier on the eyes</span>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="system-theme" 
                      name="theme" 
                      className="sr-only peer" 
                    />
                    <label htmlFor="system-theme" className="flex p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500">
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 rounded-full bg-gradient-to-r from-white to-gray-800 shadow-sm"></div>
                        <div>
                          <span className="block font-medium text-gray-800">System</span>
                          <span className="block text-xs text-gray-500">Follows your system</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-bell text-blue-500 mr-2"></i>
                  Notification Settings
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center h-5">
                      <input 
                        id="email-notifications" 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                        defaultChecked 
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="email-notifications" className="font-medium text-gray-800">Email Notifications</label>
                      <p className="text-gray-500 text-sm mt-1">Receive emails about your account activity and security.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center h-5">
                      <input 
                        id="feature-updates" 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                        defaultChecked 
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="feature-updates" className="font-medium text-gray-800">Feature Updates</label>
                      <p className="text-gray-500 text-sm mt-1">Receive updates about new features and improvements.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-lock text-blue-500 mr-2"></i>
                  Data & Privacy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                    <div className="rounded-full bg-blue-100 p-2 mr-3 text-blue-600">
                      <i className="fas fa-download"></i>
                    </div>
                    <div className="text-left">
                      <span className="block font-medium text-blue-600">Download your data</span>
                      <span className="block text-xs text-gray-500 mt-1">Get a copy of your personal data</span>
                    </div>
                  </button>
                  <button onClick={handleLogout} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
                    <div className="rounded-full bg-red-100 p-2 mr-3 text-red-600">
                      <i className="fas fa-sign-out-alt"></i>
                    </div>
                    <div className="text-left">
                      <span className="block font-medium text-red-600">Sign out</span>
                      <span className="block text-xs text-gray-500 mt-1">Sign out from this device</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <i className="fas fa-code text-blue-600 text-xl mr-2 transform transition-transform group-hover:scale-110"></i>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JS Q&A</h1>
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 mr-4 flex items-center transition-colors">
                <i className="fas fa-home mr-1"></i>
                Home
              </Link>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-1"></i>
                  Sign Out
                </button>
                <div className="flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full">
                  <span className="text-sm font-medium text-gray-800 mr-2">{user?.firstName || 'User'}</span>
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm border-2 border-white">
                    {user?.imageUrl ? (
                      <Image 
                        src={user.imageUrl} 
                        alt={user?.firstName || 'User'} 
                        className="h-full w-full object-cover"
                        width={80}
                        height={80} 
                      />
                    ) : (
                      <span className="text-3xl text-blue-600 font-semibold">{(user?.firstName?.[0] || user?.lastName?.[0] || "?").toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="px-0 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="fas fa-tachometer-alt text-blue-600 mr-2"></i>
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        <div className="mt-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="max-w-7xl mx-auto px-0">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center`}
                >
                  <i className={`fas fa-home mr-2 ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-400'}`}></i>
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center`}
                >
                  <i className={`fas fa-user mr-2 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}></i>
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center`}
                >
                  <i className={`fas fa-cog mr-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}></i>
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-0 px-0 sm:px-0">
            <div className="transition-all duration-300 transform">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <i className="fas fa-code text-blue-600 text-xl mr-2"></i>
              <p className="text-sm font-medium text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JavaScript Interview Q&A</span> &copy; 2025
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 