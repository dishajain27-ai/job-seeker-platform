const Job = require('../models/Job');

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, location, type, salary, requirements } = req.body;

    // Parse requirements if sent as a string or keep as array
    let reqArray = requirements;
    if (typeof requirements === 'string') {
      reqArray = requirements.split(',').map(req => req.trim()).filter(Boolean);
    }

    const job = await Job.create({
      title,
      company,
      description,
      location,
      type,
      salary,
      requirements: reqArray,
      employer: req.user.id
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all jobs (with search and live filters)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, type, location } = req.query;
    let query = {};

    // Live search on keywords across title, company, description, type, and requirements
    if (search) {
      const keywords = search.split(/\s+/).filter(Boolean);
      if (keywords.length > 0) {
        query.$and = keywords.map(keyword => {
          let kwRegex = keyword;
          // Normalize intern/internship searches
          if (keyword.toLowerCase().startsWith('intern')) {
            kwRegex = 'intern';
          }
          return {
            $or: [
              { title: { $regex: kwRegex, $options: 'i' } },
              { company: { $regex: kwRegex, $options: 'i' } },
              { description: { $regex: kwRegex, $options: 'i' } },
              { type: { $regex: kwRegex, $options: 'i' } },
              { requirements: { $regex: kwRegex, $options: 'i' } }
            ]
          };
        });
      }
    }

    // Filter by job type (Full-time, Internship, Part-time, Contract)
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const total = await Job.countDocuments(query);

    // Sort by newest and paginate
    const jobs = await Job.find(query)
      .populate('employer', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get a single job details
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job listing not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get autocomplete suggestions for keywords or locations
// @route   GET /api/jobs/suggestions
// @access  Public
exports.getSuggestions = async (req, res) => {
  try {
    const { field, query } = req.query;
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }

    let suggestions = [];
    if (field === 'location') {
      // Find unique locations matching the typed query
      suggestions = await Job.distinct('location', {
        location: { $regex: query, $options: 'i' }
      });
    } else {
      // Find matching job titles
      const titles = await Job.distinct('title', {
        title: { $regex: query, $options: 'i' }
      });
      // Find matching companies
      const companies = await Job.distinct('company', {
        company: { $regex: query, $options: 'i' }
      });
      // Merge and limit to top 8 suggestions
      suggestions = [...new Set([...titles, ...companies])].slice(0, 8);
    }

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
