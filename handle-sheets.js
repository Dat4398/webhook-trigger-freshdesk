const { google } = require('googleapis');
const fs = require('fs');
const config = require('./config');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
let _oauthClient = null;

function getOAuthClient() {
    if (_oauthClient) return _oauthClient;
    
    if (!fs.existsSync(config.google.credentialsPath)) {
        throw new Error(`Credentials file not found at ${config.google.credentialsPath}`);
    }
    const credentialsRaw = fs.readFileSync(config.google.credentialsPath);
    const credentials = JSON.parse(credentialsRaw);
    const {client_secret, client_id} = credentials.installed || credentials.web;
    
    // Force the redirect to the Express server route (Desktop apps allow arbitrary localhost ports)
    const redirectUri = 'http://localhost:3000/oauth2callback';
    _oauthClient = new google.auth.OAuth2(client_id, client_secret, redirectUri);
    return _oauthClient;
}

function getAuthUrl() {
    const oAuth2Client = getOAuthClient();
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Force refresh token issuance
        scope: SCOPES,
    });
}

function saveTokenFromCode(code) {
    return new Promise((resolve, reject) => {
        const oAuth2Client = getOAuthClient();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return reject(err);
            oAuth2Client.setCredentials(token);
            fs.writeFileSync(config.google.tokenPath, JSON.stringify(token));
            resolve('Token saved successfully');
        });
    });
}

async function appendRowToSheet(rowData) {
    const oAuth2Client = getOAuthClient();
    
    // Verify the token exists
    if (!fs.existsSync(config.google.tokenPath)) {
        throw new Error(`Token file not found. Please visit the /auth endpoint via your web browser.`);
    }
    
    const tokenRaw = fs.readFileSync(config.google.tokenPath);
    oAuth2Client.setCredentials(JSON.parse(tokenRaw));

    try {
        const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: config.google.spreadsheetId,
            range: config.google.sheetRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [rowData] }
        });
        console.log('✅ Row successfully appended to Google Sheet. Range updated:', response.data.updates.updatedRange);
        return response.data;
    } catch (error) {
        console.error('❌ Error appending to Google Sheet:', error.message);
        throw error;
    }
}

module.exports = {
    appendRowToSheet,
    getAuthUrl,
    saveTokenFromCode,
    isTokenValid: () => fs.existsSync(config.google.tokenPath)
};

