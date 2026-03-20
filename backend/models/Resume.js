const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String },
    phone: { type: String },
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String }
  },
  summary: {
    type: String,
    maxLength: 1000
  },
  experience: [{
    company: { type: String, required: true },
    jobTitle: { type: String, required: true },
    startDate: { type: String, required: true }, // e.g., "Jan 2022"
    endDate: { type: String }, // e.g., "Present"
    description: [{ type: String }] // Array of bullet points
  }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    graduationYear: { type: String },
    gpa: { type: String }
  }],
  skills: [{
    type: String
  }],
  projects: [{
    title: { type: String },
    technologies: [{ type: String }],
    description: [{ type: String }],
    link: { type: String }
  }],
  certifications: [{ type: String }],
  achievements: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
