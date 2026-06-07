const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, getEmployerJobs, getSuggestions } = require('../controllers/jobController');
const { protect, checkRole } = require('../middleware/authMiddleware');

router.route('/')
  .get(getJobs)
  .post(protect, checkRole(['Employer']), createJob);

router.get('/suggestions', getSuggestions);
router.get('/employer/my-jobs', protect, checkRole(['Employer']), getEmployerJobs);
router.get('/:id', getJobById);

module.exports = router;
