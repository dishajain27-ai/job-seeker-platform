const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please select a job type'],
    enum: ['Full-time', 'Internship', 'Part-time', 'Contract']
  },
  salary: {
    type: String,
    required: [true, 'Please add a salary range or details']
  },
  requirements: {
    type: [String],
    default: []
  },
  address: {
    type: String,
    default: ''
  },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  hotline: {
    type: String,
    default: ''
  },
  employer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound text index for Search Engine querying title, company, and description
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', JobSchema);
