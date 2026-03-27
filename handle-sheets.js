const { google } = require('googleapis');
const config = require('./config');


async function appendRowToSheet(rowData) {
    try {
        // Authenticate using the service account key
        const auth = new google.auth.GoogleAuth({
            keyFile: config.google.keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        // Append the row
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: config.google.spreadsheetId,
            range: config.google.sheetRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData],
            },
        });

        console.log('✅ Row successfully appended to Google Sheet. Range updated:', response.data.updates.updatedRange);
        return response.data;
    } catch (error) {
        console.error('❌ Error appending to Google Sheet:', error.message);
        throw error;
    }
}

module.exports = {
    appendRowToSheet
};
