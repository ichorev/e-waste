const express = require('express');
const path = require('path');
const app = express();

// Just serve static files, do nothing else
app.use(express.static('./'));

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'results.html'));
});

// That's it! No data storage, no APIs, just serving files
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🎯 Simple file server running on port ${PORT}`);
    console.log(`📱 Survey: http://localhost:${PORT}`);
    console.log(`📊 Results: http://localhost:${PORT}/results`);
});
