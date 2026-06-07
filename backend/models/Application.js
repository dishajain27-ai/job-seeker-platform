const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  seeker: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true
  },
  resumePath: {
    type: String,
    required: [true, 'Please upload a resume']
  },
  coverLetter: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'under review', 'interview scheduled', 'accepted', 'rejected'],
    default: 'pending'
  },
  matchScore: {
    type: Number,
    default: 0
  },
  meetingLink: {
    type: String,
    trim: true,
    default: ''
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a seeker can apply to the same job only once
ApplicationSchema.index({ job: 1, seeker: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
