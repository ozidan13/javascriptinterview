/**
 * This file contains database configuration constants (CommonJS version)
 * Used to ensure consistent database connection across different parts of the application
 * that use require() instead of import.
 */

// The name of the database to connect to
const DB_NAME = 'test';

// Helper function to ensure all URIs have the database name
function ensureDbNameInUri(uri) {
  if (!uri) return uri;
  
  // If URI already has a database name, return as is
  if (uri.endsWith(`/${DB_NAME}`)) return uri;
  
  // If URI ends with a trailing slash, add the database name
  if (uri.endsWith('/')) return `${uri}${DB_NAME}`;
  
  // Otherwise add slash and database name
  return `${uri}/${DB_NAME}`;
}

module.exports = { DB_NAME, ensureDbNameInUri }; 