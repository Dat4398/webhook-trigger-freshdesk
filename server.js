const express = require("express");
const bodyParser = require("body-parser");
const { appendRowToSheet } = require("./handle-sheets");
const app = express();
const PORT = 3000;

// Parse JSON
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
    console.log("📩 Webhook received:");
    console.log(req.body);

    try {
        // Format the data you want to save. For example, saving the timestamp and the raw JSON body
        //const rowData = [new Date().toISOString(), JSON.stringify(req.body)];
        const ticket = req.body;
        const rowData = [
            ticket.id,
            ticket.group_name,
            ticket.title,
            ticket.ticket_description,
            ticket.ticket_tags,
            ticket.content,
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

// Health check
app.get("/", (req, res) => {
    res.send("Webhook server is running 🚀 --");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});