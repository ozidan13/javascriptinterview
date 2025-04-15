const fs = require('fs');
const path = require('path');

console.log('Running post-install checks...');

// Check for required environment variables (e.g., Clerk keys)
function checkEnvVars() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
    // Add any other essential non-database env vars here
  ];
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.warn(`WARNING: Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('Make sure these variables are set in your .env.local file and on your Vercel deployment.');
  } else {
    console.log('✅ Required environment variables are defined.');
  }
}

// Check for the main data file
function checkDataFile() {
  try {
    const dataFilePath = path.join(process.cwd(), 'public', 'datajs.json');
    if (fs.existsSync(dataFilePath)) {
      console.log('✅ Main data file (datajs.json) found.');
    } else {
      console.warn('⚠️ Main data file not found at public/datajs.json');
    }
  } catch (error) {
    console.error('Error checking data file:', error);
  }
}

// Check for next.config.js
function checkNextConfig() {
  try {
    const configPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(configPath)) {
      console.log('✅ Next.js configuration file found.');
    } else {
      console.warn('⚠️ No next.config.js file found.');
    }
  } catch (error) {
    console.error('Error checking Next.js config:', error);
  }
}

// Run all checks
function runChecks() {
  console.log('=============================================');
  console.log('🔍 Performing environment and file checks');
  console.log('=============================================');
  
  checkEnvVars();
  checkDataFile();
  checkNextConfig();
  
  console.log('=============================================');
  console.log('Project setup checks complete.');
  console.log('=============================================');
}

runChecks(); 