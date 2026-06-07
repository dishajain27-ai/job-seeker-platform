const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const Inquiry = require('../models/Inquiry');

const calculateMatchScore = (job, coverLetter, filename) => {
  const jobText = (job.requirements.join(' ') + ' ' + job.description).toLowerCase();
  const candidateText = ((coverLetter || '') + ' ' + (filename || '')).toLowerCase();

  const techKeywords = [
    'react', 'node', 'express', 'mongodb', 'mongoose', 'javascript', 'typescript', 
    'python', 'django', 'flask', 'sql', 'mysql', 'postgresql', 'java', 'spring', 
    'c++', 'c#', 'php', 'laravel', 'html', 'css', 'tailwind', 'sass', 'aws', 
    'docker', 'kubernetes', 'jenkins', 'git', 'github', 'agile', 'scrum', 
    'figma', 'ui', 'ux', 'rest', 'api', 'graphql', 'analytics', 'excel', 'tableau', 
    'powerbi', 'machine learning', 'ml', 'ai', 'deep learning', 'nlp', 'gcp', 
    'azure', 'devops', 'ci/cd', 'qa', 'testing', 'jest', 'cypress', 'rust', 'go', 'golang'
  ];

  let matches = 0;
  let totalKeywordsInJob = 0;

  techKeywords.forEach(kw => {
    const inJob = jobText.includes(kw);
    if (inJob) {
      totalKeywordsInJob++;
      if (candidateText.includes(kw)) {
        matches++;
      }
    }
  });

  let score = 70;
  if (totalKeywordsInJob > 0) {
    const overlapPercent = (matches / totalKeywordsInJob) * 25;
    score += overlapPercent;
  }

  const variance = (candidateText.length % 6) + 1;
  score += variance;

  return Math.min(Math.max(Math.round(score), 65), 98);
};

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Seeker only)
exports.applyJob = async (req, res) => {
  try {
    const { jobId, coverLetter, fullName, email, phone } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a resume file (PDF, DOC, or DOCX)'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId).populate('employer', 'name email');
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      seeker: req.user.id
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this job'
      });
    }

    const score = calculateMatchScore(job, coverLetter, req.file.filename);

    // Create Application
    const application = await Application.create({
      job: jobId,
      seeker: req.user.id,
      fullName: fullName || req.user.name,
      email: email || req.user.email,
      phone: phone || 'N/A',
      resumePath: `uploads/${req.file.filename}`, // relative path
      coverLetter,
      matchScore: score
    });

    // Send email notification (simulated or real)
    try {
      await sendEmail({
        email: email || req.user.email,
        subject: `Application Submitted: ${job.title} at ${job.company}`,
        message: `Hello ${fullName || req.user.name},\n\nYour application for the position of "${job.title}" at "${job.company}" was submitted successfully.\n\nDetails submitted:\n- Name: ${fullName || req.user.name}\n- Email: ${email || req.user.email}\n- Phone: ${phone || 'N/A'}\n\nWe have received your resume and will get back to you shortly.\n\nBest regards,\nJob Board Team`
      });
    } catch (err) {
      console.error(`Error sending application confirmation email: ${err.message}`);
    }

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get seeker's applications
// @route   GET /api/applications/seeker/my-applications
// @access  Private (Seeker only)
exports.getSeekerApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seeker: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location salary type employer',
        populate: {
          path: 'employer',
          select: 'name email'
        }
      })
      .sort('-appliedAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get applicants for a specific job listing
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Verify job belongs to logged-in employer
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view applicants for this job'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('seeker', 'name email')
      .sort('-appliedAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update application status (Accept / Reject / Interview etc.)
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body;

    if (status && !['pending', 'under review', 'interview scheduled', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application status. Must be pending, under review, interview scheduled, accepted, or rejected.'
      });
    }

    // Find application and populate job and seeker
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('seeker', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Verify job belongs to logged-in employer
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update applicant status for this job'
      });
    }

    if (status) {
      application.status = status;
    }
    
    if (meetingLink !== undefined) {
      application.meetingLink = meetingLink;
    }

    await application.save();

    // Send email notification (simulated or real)
    try {
      let emailMessage = `Hello ${application.seeker.name},\n\nThe status of your application for "${application.job.title}" at "${application.job.company}" has been updated to: ${status ? status.toUpperCase() : 'UPDATED'}.\n\n`;
      
      if (status === 'interview scheduled' && meetingLink) {
        emailMessage += `Your live interview has been scheduled! Please use the following meeting link to join the video call:\n${meetingLink}\n\n`;
      }
      
      emailMessage += `Thank you for your interest.\n\nBest regards,\n${application.job.company} Recruitment Team`;

      await sendEmail({
        email: application.seeker.email,
        subject: `Job Application Status Update: ${application.job.title}`,
        message: emailMessage
      });
    } catch (err) {
      console.error(`Error sending status update email: ${err.message}`);
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all candidate profiles for Talent Directory
// @route   GET /api/applications/talent
// @access  Private (Employer only)
exports.getTalentDirectory = async (req, res) => {
  try {
    // 1. Get all users with role 'seeker'
    const seekers = await User.find({ role: 'seeker' }).select('-password');
    
    // 2. Get all applications to find resume paths and cover letters
    const applications = await Application.find().sort('-appliedAt');
    
    const candidates = seekers.map(seeker => {
      // Find the most recent application by this seeker to get their resume and cover letter
      const app = applications.find(a => a.seeker && a.seeker.toString() === seeker._id.toString());
      
      const text = (((app && app.coverLetter) || '') + ' ' + ((app && app.resumePath) || '') + ' ' + seeker.name).toLowerCase();
      
      // Determine skills
      const skills = [];
      const techKeywords = [
        'react', 'node', 'express', 'mongodb', 'javascript', 'typescript', 
        'python', 'django', 'flask', 'sql', 'java', 'html', 'css', 'tailwind', 
        'aws', 'docker', 'git', 'ui/ux', 'agile', 'scrum'
      ];
      techKeywords.forEach(k => {
        if (text.includes(k) && skills.length < 5) {
          skills.push(k.toUpperCase());
        }
      });
      if (skills.length === 0) {
        skills.push('JAVASCRIPT', 'HTML', 'CSS', 'REACT');
      }

      // Infer title
      let title = 'Software Engineer';
      if (text.includes('react') || text.includes('frontend') || text.includes('web')) title = 'Frontend Engineer';
      else if (text.includes('node') || text.includes('backend') || text.includes('server')) title = 'Backend Developer';
      else if (text.includes('fullstack') || text.includes('full stack')) title = 'Full Stack Developer';
      else if (text.includes('python') || text.includes('data') || text.includes('analyst')) title = 'Data Analyst / Python Developer';
      else if (text.includes('design') || text.includes('ui') || text.includes('ux')) title = 'UI/UX Designer';

      return {
        id: seeker._id,
        name: seeker.name,
        email: seeker.email,
        phone: app ? app.phone : 'N/A',
        title: title,
        skills: skills,
        summary: app && app.coverLetter ? app.coverLetter : `Tech specialist skilled in ${skills.slice(0, 3).join(', ')}. Passionate about building modern applications and solving complex problems.`,
        resumePath: app ? app.resumePath : null
      };
    });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create a new query/inquiry for a job
// @route   POST /api/applications/inquiries
// @access  Private (Seeker only)
exports.createInquiry = async (req, res) => {
  try {
    const { jobId, companyName, queryText } = req.body;

    if (!jobId || !companyName || !queryText) {
      return res.status(400).json({
        success: false,
        error: 'Please provide jobId, companyName, and queryText'
      });
    }

    const inquiry = await Inquiry.create({
      seeker: req.user.id,
      job: jobId,
      companyName,
      queryText,
      status: 'Pending Review'
    });

    res.status(201).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get seeker inquiries for Queries Log
// @route   GET /api/applications/inquiries/my-inquiries
// @access  Private (Seeker only)
exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ seeker: req.user.id })
      .populate('job', 'title location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all applicants across all jobs posted by the employer
// @route   GET /api/applications/employer/applicants
// @access  Private (Employer only)
exports.getEmployerApplicants = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id });
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('seeker', 'name email skills')
      .populate('job', 'title location company')
      .sort('-appliedAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update application resume path
// @route   PATCH /api/applications/:id/resume
// @access  Private (Seeker only)
exports.updateApplicationResume = async (req, res) => {
  try {
    const { resumePath } = req.body;
    if (!resumePath) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a resume path or URL'
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Verify applicant owns this application
    if (application.seeker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this application'
      });
    }

    application.resumePath = resumePath;
    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

