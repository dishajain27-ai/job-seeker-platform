const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  seeker: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name']
  },
  queryText: {
    type: String,
    required: [true, 'Please add inquiry text']
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Replied'],
    default: 'Pending Review'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inquiry', InquirySchema);
