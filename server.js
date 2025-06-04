const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('./'));

const DATA_FILE = './surveys.json';

// Initialize data file if it doesn't exist
const initializeDataFile = async () => {
    try {
        await fs.access(DATA_FILE);
        console.log('Data file exists');
    } catch {
        console.log('Creating new data file...');
        // Create empty data file with initial structure
        await fs.writeFile(DATA_FILE, JSON.stringify({ surveys: {} }, null, 2), 'utf8');
    }
};

// Validate survey data based on your e-waste survey structure
const validateSurveyData = (data) => {
    const required = [
        'name',
        'deviceCount',
        'ewasteAwareness',
        'collectionPoint',
        'environmentalImpact',
        'deviceKeepDuration',
        'storedDevices'
    ];
    
    // Check if all required fields exist and are not empty
    const isValid = required.every(field => {
        return data.hasOwnProperty(field) && 
               data[field] !== null && 
               data[field] !== undefined && 
               data[field] !== '';
    });
    
    if (!isValid) {
        console.log('Validation failed. Missing fields:', 
            required.filter(field => !data.hasOwnProperty(field) || !data[field])
        );
    }
    
    return isValid;
};

// Generate unique ID for each survey
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Setup data storage
(async () => {
    await initializeDataFile();
})();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'results.html'));
});

// Submit survey endpoint
app.post('/api/submit', async (req, res) => {
    try {
        console.log('Received survey data:', req.body);
        
        const surveyData = {
            ...req.body,
            timestamp: new Date().toISOString(),
            id: generateId()
        };
        
        // Validate the survey data
        if (!validateSurveyData(surveyData)) {
            console.log('Validation failed for:', surveyData);
            return res.status(400).json({ 
                error: 'Missing required fields',
                received: Object.keys(req.body)
            });
        }
        
        // Read existing data
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Ensure surveys object exists
        if (!data.surveys) {
            data.surveys = {};
        }
        
        // Add new survey with unique ID
        data.surveys[surveyData.id] = surveyData;
        
        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        console.log('Survey saved successfully with ID:', surveyData.id);
        res.status(200).json({ 
            message: 'Survey submitted successfully',
            id: surveyData.id
        });
        
    } catch (error) {
        console.error('Error saving survey:', error);
        res.status(500).json({ 
            error: 'Failed to save survey',
            details: error.message
        });
    }
});

// Get all surveys endpoint
app.get('/api/surveys', async (req, res) => {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Return surveys in the format expected by results.html
        const surveys = data.surveys || {};
        
        console.log(`Returning ${Object.keys(surveys).length} surveys`);
        res.json(surveys);
        
    } catch (error) {
        console.error('Error reading surveys:', error);
        res.status(500).json({ 
            error: 'Failed to read surveys',
            details: error.message
        });
    }
});

// Get survey count endpoint
app.get('/api/count', async (req, res) => {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        const surveys = data.surveys || {};
        
        res.json({ count: Object.keys(surveys).length });
        
    } catch (error) {
        console.error('Error getting survey count:', error);
        res.status(500).json({ 
            error: 'Failed to get survey count',
            details: error.message
        });
    }
});

// Delete a specific survey (optional admin feature)
app.delete('/api/surveys/:id', async (req, res) => {
    try {
        const surveyId = req.params.id;
        
        const fileContent = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (!data.surveys || !data.surveys[surveyId]) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        delete data.surveys[surveyId];
        
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ message: 'Survey deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting survey:', error);
        res.status(500).json({ 
            error: 'Failed to delete survey',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        dataFile: DATA_FILE
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data will be stored in: ${DATA_FILE}`);
    console.log(`Access survey at: http://localhost:${PORT}`);
    console.log(`View results at: http://localhost:${PORT}/results`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
