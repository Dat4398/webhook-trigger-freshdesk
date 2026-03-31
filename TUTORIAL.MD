# Local Webhook to Google Sheets

This project allows you to receive incoming webhooks (e.g. from Freshdesk, Shopify) on your local machine and automatically append the incoming data as rows to a Google Sheet.

## 📋 Prerequisites

1. **Node.js** installed on your machine.
2. An active **Google Cloud Console** project with the **Google Sheets API** enabled.
3. **Ngrok** (or similar service) to expose your local server to the internet.

---

## 🚀 Guide to Use This Project

Follow these steps to set up and run the webhook server locally:

### 1. Install Dependencies
Make sure you are in the project folder and install the required Node.js packages:
```bash
npm install
```

### 2. Configure Google Credentials
This project uses OAuth 2.0 to securely access your Google Sheet.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (if you don't have one) and **enable the Google Sheets API**.
3. Configure the **OAuth Consent Screen** (Internal or External).
4. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
5. Select **Desktop application** as the application type.
6. Download the generated JSON credentials file and place it in the root directory of this project.
7. Rename the downloaded file to `credentials.json`.

### 3. Set Up Environment Variables
Create a file named `.env` in the root of the project (you can duplicate the `env.example` file and rename it).
Update it with the ID of your Google Spreadsheet and the sheet range you want to populate:

```env
# The ID of your spreadsheet (found in the URL: https://docs.google.com/spreadsheets/d/<THIS_ID>/)
SPREADSHEET_ID=your_spreadsheet_id_here

# The name of the sheet or range you want to append data to
SHEET_RANGE=Sheet1
```

### 4. Start the Application
Run the webhook server. During development, you can use:
```bash
npm run dev
```
*(Or use `npm start`).*
The server will start listening on `http://localhost:3000`.

### 5. Authorize the Server with Google
Before the server can append rows to your Google Sheet, you must authorize it.

1. Open your web browser and go to:
   [http://localhost:3000/auth](http://localhost:3000/auth)
2. Sign in with the Google account that has edit access to your spreadsheet.
3. Grant the required permissions.
4. You should see a success message. The server will generate a `token.json` file in the root directory, which will be automatically used to authenticate all future requests.

### 6. Expose the Server with Ngrok
Webhooks from external services (like Freshdesk) cannot reach `localhost`. You need to expose your local port `3000` to the internet using Ngrok.

In a separate terminal, run:
```bash
ngrok http 3000
```
Ngrok will give you a secure public URL (e.g., `https://abc1-23-456.ngrok-free.app`).

### 7. Configure Your Webhook Source
Finally, configure the service generating the webhook (like Freshdesk custom automation) to send a `POST` request to your newly generated public URL along with the correct path:
```text
URL: https://abc1-23-456.ngrok-free.app/webhook
Method: POST
Body Format: JSON
```

Your server will now passively listen for incoming tickets. When a payload is received, it will clean up any HTML tags and extra whitespace, and append the payload data as a new row directly into your Google Sheet! 🎉

> **Note:** Unless you have a paid Ngrok account, your public URL will change every time you restart the Ngrok process. Always make sure to update your webhook source if the Ngrok URL changes.
