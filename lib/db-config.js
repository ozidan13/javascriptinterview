/**
 * This file contains database configuration constants
 * Used to ensure consistent database connection across different parts of the application
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

// Support both CommonJS and ESM
if (typeof module !== 'undefined') {
  module.exports = { DB_NAME, ensureDbNameInUri };
}

export { DB_NAME, ensureDbNameInUri }; 