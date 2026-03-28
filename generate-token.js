const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const config = require('./config');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Load client secrets from a local file.
fs.readFile(config.google.credentialsPath, (err, content) => {
    if (err) {
        console.error('❌ Error loading client secret file:', err);
        console.log('\nMake sure you have downloaded the OAuth 2.0 Web/Desktop "credentials.json" from Google Cloud Console.');
        return;
    }
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content));
});

function authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(config.google.tokenPath, (err, token) => {
        if (err) {
            console.log('No token found. Proceeding with initial authorization...\n');
            return getNewToken(oAuth2Client);
        }
        
        console.log(`✅ Token already exists at ${config.google.tokenPath}. You are good to go!`);
        console.log('If you need to re-authenticate, simply delete token.json and run this script again.');
    });
}

function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('================================================================');
    console.log('Authorize this app by visiting this url:');
    console.log(authUrl);
    console.log('================================================================\n');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('\n❌ Error while trying to retrieve access token:', err.message);
                return;
            }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(config.google.tokenPath, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log(`\n✅ Success! Token stored to ${config.google.tokenPath}`);
                console.log('You can now run your webhook server normally.');
            });
        });
    });
}
