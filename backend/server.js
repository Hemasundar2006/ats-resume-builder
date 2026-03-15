const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const Resume = require('./models/Resume');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up a mock database connection using MONGODB_URI from environment
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-resume-builder')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// POST route /api/save that saves incoming resume JSON to MongoDB
app.post('/api/save', async (req, res) => {
  try {
    const resumeData = req.body;
    
    // In a real application, you might get userId from an authenticated session/token
    // Here we generate a dummy ObjectId if not provided to pass validation
    if (!resumeData.userId) {
      resumeData.userId = new mongoose.Types.ObjectId();
    }

    const newResume = new Resume(resumeData);
    await newResume.save();
    
    res.status(201).json({ message: 'Resume saved successfully', resume: newResume });
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

// POST route /api/analyze
app.post('/api/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'resumeText and jobDescription are required' });
    }

    // Call Python AI service
    const response = await axios.post('http://localhost:8000/api/v1/score', {
      resumeText,
      jobDescription
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error analyzing resume:', error.message);
    res.status(500).json({ error: 'Failed to analyze resume with AI service' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
