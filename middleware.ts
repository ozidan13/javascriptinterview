import { authMiddleware } from "@clerk/nextjs";

/**
 * Protected routes middleware
 * - Routes like "/" and files with extensions are public
 * - Sign-in and sign-up routes are public
 * - Dashboard and other protected routes require authentication
 */
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",                // Homepage is public
    "/sign-in(.*)",     // Sign in pages (and any subpaths)
    "/sign-up(.*)",     // Sign up pages (and any subpaths)
    "/api/public(.*)"   // Public API routes
  ],
  
  // Routes that bypass the middleware completely
  ignoredRoutes: [
    "/(.*)\\.(.*)$",    // Static files with extensions
    "/_next/(.*)$",     // Next.js internals
    "/favicon.ico"      // Favicon
  ]
});

// Define matcher patterns for the middleware
export const config = {
  matcher: [
    // Apply middleware to all routes except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
}; 