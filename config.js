require('dotenv').config();

module.exports = {
  // Google Sheets configuration ==============
  google: {
    // Service account JSON file path (e.g. './service-account-key.json') *********
    keyFilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json',
    // The ID of the spreadsheet to update (found in the URL of the Google Sheet) ********
    spreadsheetId: process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE',
    // The range/sheet name to append to (e.g., 'Sheet1!A:D' or just 'Sheet1') *********
    sheetRange: process.env.SHEET_RANGE || 'Sheet1' // Sheet name range
  }
};
