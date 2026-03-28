require('dotenv').config();

module.exports = {
  // Google Sheets configuration ==============
  google: {
    // OAuth 2.0 Desktop app credentials JSON format file downloaded from Google Cloud
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json',
    // Output generated refresh token from `generate-token.js`
    tokenPath: 'token.json',
    // The ID of the spreadsheet to update (found in the URL of the Google Sheet) ********
    spreadsheetId: process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE',
    // The range/sheet name to append to (e.g., 'Sheet1!A:D' or just 'Sheet1') *********
    sheetRange: process.env.SHEET_RANGE || 'Sheet1' // Sheet name range
  }
};
