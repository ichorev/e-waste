const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();

app.use(express.json());
app.use(express.static('./'));

const DATA_FILE = './data.json';

// Initialize data file if it doesn't exist
const initializeDataFile = async () => {
    try {
        await fs.access(DATA_FILE);
    } catch {
        // Create empty data file with initial structure
        await fs.writeFile(DATA_FILE, '[]', 'utf8');
    }
};

// Validate survey data
const validateSurveyData = (data) => {
    const required = [
        'name',
        'refuseFrequency',
        'repairFrequency',
        'recycleFrequency',
        'compostHabit',
        'durableChoice'
    ];

    return required.every(field => data.hasOwnProperty(field) && data[field]);
};

// Setup data storage
(async () => {
    await initializeDataFile();
})();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'results.html'));
});

app.post('/api/submit', async (req, res) => {
    try {
        const surveyData = {
            ...req.body,
            timestamp: new Date().toISOString()
        };

        // Validate the survey data
        if (!validateSurveyData(surveyData)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const surveys = JSON.parse(fileContent);
        surveys.push(surveyData);
        
        await fs.writeFile(DATA_FILE, JSON.stringify(surveys, null, 2));
        
        res.status(200).json({ message: 'Survey submitted successfully' });
    } catch (error) {
        console.error('Error saving survey:', error);
        res.status(500).json({ error: 'Failed to save survey' });
    }
});

app.get('/api/surveys', async (req, res) => {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const surveys = JSON.parse(fileContent);
        res.json(surveys);
    } catch (error) {
        console.error('Error reading surveys:', error);
        res.status(500).json({ error: 'Failed to read surveys' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
