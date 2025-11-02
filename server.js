const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// =================================================================
// Middleware Configuration
// =================================================================
// Enable CORS to allow your GitHub Pages frontend to communicate with this backend.
app.use(cors());

// Parse JSON bodies for POST requests
app.use(bodyParser.json());

// =================================================================
// In-Memory Database (for v1.0.0)
// Bot data will reset if the server restarts.
// =================================================================
let bots = {}; // Structure: { "botId": { name, token, status, commands } }

// =================================================================
// API Endpoints
// =================================================================

// GET /getBots - Retrieve all created bots
app.get('/getBots', (req, res) => {
    const botList = Object.entries(bots).map(([botId, data]) => ({
        botId,
        name: data.name,
        status: data.status,
    }));
    res.json(botList);
});

// POST /createBot - Create a new bot entry
app.post('/createBot', (req, res) => {
    const { token, name } = req.body;
    if (!token || !name) {
        return res.status(400).json({ error: 'Token and name are required.' });
    }
    const botId = `bot_${Date.now()}`; // Generate a simple unique ID
    bots[botId] = {
        name,
        token,
        status: 'STOPPED',
        commands: {},
    };
    console.log(`Bot created: ${name} (${botId})`);
    res.status(201).json({ botId, name, status: 'STOPPED' });
});

// POST /startBot - Set a bot's status to 'RUN'
app.post('/startBot', (req, res) => {
    const { botId } = req.body;
    if (bots[botId]) {
        bots[botId].status = 'RUN';
        console.log(`Bot started: ${bots[botId].name} (${botId})`);
        res.json({ message: 'Bot started successfully.' });
    } else {
        res.status(404).json({ error: 'Bot not found.' });
    }
});

// POST /stopBot - Set a bot's status to 'STOPPED'
app.post('/stopBot', (req, res) => {
    const { botId } = req.body;
    if (bots[botId]) {
        bots[botId].status = 'STOPPED';
        console.log(`Bot stopped: ${bots[botId].name} (${botId})`);
        res.json({ message: 'Bot stopped successfully.' });
    } else {
        res.status(404).json({ error: 'Bot not found.' });
    }
});

// POST /deleteBot - Remove a bot from memory
app.post('/deleteBot', (req, res) => {
    const { botId } = req.body;
    if (bots[botId]) {
        console.log(`Bot deleted: ${bots[botId].name} (${botId})`);
        delete bots[botId];
        res.json({ message: 'Bot deleted successfully.' });
    } else {
        res.status(404).json({ error: 'Bot not found.' });
    }
});

// GET /getCommands - Get commands for a specific bot
app.get('/getCommands', (req, res) => {
    const { botId } = req.query;
    if (bots[botId]) {
        res.json(bots[botId].commands || {});
    } else {
        res.status(404).json({ error: 'Bot not found.' });
    }
});

// POST /addCommand - Add or update a command for a bot
app.post('/addCommand', (req, res) => {
    const { botId, name, code } = req.body;
    if (bots[botId]) {
        bots[botId].commands[name] = code;
        console.log(`Command /${name} added to bot ${bots[botId].name}`);
        res.json({ message: 'Command added successfully.' });
    } else {
        res.status(404).json({ error: 'Bot not found.' });
    }
});

// POST /delCommand - Delete a command for a bot
app.post('/delCommand', (req, res) => {
    const { botId, name } = req.body;
    if (bots[botId] && bots[botId].commands[name]) {
        delete bots[botId].commands[name];
        console.log(`Command /${name} deleted from bot ${bots[botId].name}`);
        res.json({ message: 'Command deleted successfully.' });
    } else {
        res.status(404).json({ error: 'Bot or command not found.' });
    }
});

// =================================================================
// Start Server
// =================================================================
app.listen(PORT, () => {
    console.log(`BotAlto Backend Server is running on http://localhost:${PORT}`);
});
