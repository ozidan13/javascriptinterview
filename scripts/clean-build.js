const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Cleaning build folders...');

// Function to safely remove directory
function removeDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`Removing directory: ${dirPath}`);
      // Use rimraf-like approach with Node's fs
      if (process.platform === 'win32') {
        // On Windows, use the rd command with /s /q for recursive silent deletion
        try {
          execSync(`rd /s /q "${dirPath}"`, { stdio: 'ignore' });
          console.log(`Successfully removed ${dirPath}`);
          return true;
        } catch (error) {
          console.error(`Error using rd command: ${error.message}`);
          return false;
        }
      } else {
        // On Unix systems use rm -rf
        try {
          execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
          console.log(`Successfully removed ${dirPath}`);
          return true;
        } catch (error) {
          console.error(`Error using rm command: ${error.message}`);
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`Error removing directory ${dirPath}: ${error.message}`);
    return false;
  }
}

// Clean .next directory
const nextDir = path.join(__dirname, '..', '.next');
const success = removeDir(nextDir);

if (success) {
  console.log('Build directories cleaned successfully!');
} else {
  console.log('Failed to clean build directories. Please try running as administrator.');
}

// Exit with appropriate code
process.exit(success ? 0 : 1); 