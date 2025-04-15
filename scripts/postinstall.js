const fs = require('fs');
const path = require('path');

console.log('Running post-install checks...');

// Check for environment variables
function checkEnvVars() {
  const requiredEnvVars = ['MONGODB_URI', 'MONGODB_USER', 'MONGODB_PASS'];
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
    console.log('✅ All required environment variables are defined.');
  }
}

// Check for database data
function checkDatabaseConfig() {
  try {
    // See if we have a seed file
    const seedFilePath = path.join(process.cwd(), 'public', 'datajs.json');
    if (fs.existsSync(seedFilePath)) {
      console.log('✅ Seed data file found. Use npm run seed-db to populate the database if needed.');
    } else {
      console.warn('⚠️ No seed data file found at public/datajs.json');
    }
  } catch (error) {
    console.error('Error checking database config:', error);
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
  console.log('🔍 Performing environment checks');
  console.log('=============================================');
  
  checkEnvVars();
  checkDatabaseConfig();
  checkNextConfig();
  
  console.log('=============================================');
  console.log('If using Vercel deployment, remember to:');
  console.log('1. Set MONGODB_URI (template), MONGODB_USER, MONGODB_PASS in Vercel Environment Variables');
  console.log('2. Ensure MongoDB allows connections from Vercel IPs');
  console.log('3. Run verify-db script to confirm database connectivity');
  console.log('=============================================');
}

runChecks(); 