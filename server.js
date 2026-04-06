const express = require("express");
const bodyParser = require("body-parser");
const { appendRowToSheet, getAuthUrl, saveTokenFromCode, isTokenValid } = require("./handle-sheets");
const app = express();
const PORT = 3000;

// Parse JSON
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
    if (!isTokenValid()) {
        console.warn("🚫 Webhook ignored because server is not authorized to Google Sheets yet.");
        console.warn("👉 Please visit http://localhost:3000/auth first.");
        return res.status(401).json({ error: "Missing Google authorization. Visit /auth" });
    }

    console.log("📩 Webhook received:");
    console.log(req.body);

    try {
        // Format the data you want to save. For example, saving the timestamp and the raw JSON body
        //const rowData = [new Date().toISOString(), JSON.stringify(req.body)];
        const ticket = req.body;
        
        // Helper to strip HTML, decode common entities, and remove excessive whitespace
        const cleanText = (val) => {
            if (typeof val === 'string') {
                return val
                    .replace(/<[^>]*>?/gm, '')     // Remove HTML tags
                    .replace(/&nbsp;/gi, ' ')      // Replace non-breaking space
                    .replace(/&amp;/gi, '&')       // Revert ampersand
                    .replace(/&lt;/gi, '<')        // Revert less-than
                    .replace(/&gt;/gi, '>')        // Revert greater-than
                    .replace(/&quot;/gi, '"')      // Revert quotes
                    .replace(/&#39;/gi, "'")       // Revert apostrophe
                    .replace(/\s+/g, ' ')          // Collapse all multiple whitespace/newlines into a single space
                    .trim();
            }
            return val || '';
        };

        const rowData = [
            ticket.id,
            ticket.group_name,
            cleanText(ticket.title),
            cleanText(ticket.ticket_description),
            ticket.ticket_tags,
            cleanText(ticket.content),
            ticket.status,
            ticket.public_url,
            new Date().toLocaleString(),
        ];
        console.log(rowData);
        // Pass the row data to Google Sheets
        await appendRowToSheet(rowData);

        // You can process data here
        res.status(200).json({
            message: "Webhook received and data added to Google Sheet successfully"
        });
    } catch (error) {
        console.error("❌ Failed to add row to Google Sheet:", error.message);
        res.status(500).json({
            message: "Webhook received but failed to update Google Sheet",
            error: error.message
        });
    }
});

// OAuth 2.0 Auth Flow endpoints
app.get("/auth", (req, res) => {
    try {
        const url = getAuthUrl();
        res.redirect(url);
    } catch (e) {
        res.status(500).send("Error generating auth url: " + e.message);
    }
});

app.get("/oauth2callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("No code provided by Google.");
    try {
        await saveTokenFromCode(code);
        res.send("<h1>✅ Success! Token generated and saved.</h1><p>The webhook server is now fully authorized to write to Google Sheets. You can close this tab.</p>");
    } catch (e) {
        res.status(500).send("Error saving token: " + e.message);
    }
});

// order checking endpoint
app.get("/order-checking", async (req, res) => {
    const query = req.query;
    console.log(JSON.stringify(query));
    try {
        const fakeData = {
            order_id: "123456789",
            status: "shipping",
            tracking_url: "https://www.17track.net/en/track?nums=123456789"
        }
        res.status(200).json(fakeData);
    } catch (error) {
        res.status(500).json({
            message: "Webhook received but failed to update Google Sheet",
            error: error.message
        });
    }
});

// Health check
app.get("/", (req, res) => {
    res.send("Webhook server is running 🚀 --");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});