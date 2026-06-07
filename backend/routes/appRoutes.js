const express = require('express');
const router = express.Router();
const {
  applyJob,
  getSeekerApplications,
  getJobApplicants,
  getEmployerApplicants,
  updateApplicationStatus,
  updateApplicationResume,
  getTalentDirectory,
  createInquiry,
  getMyInquiries
} = require('../controllers/appController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

router.post('/inquiries', protect, authorize('seeker'), createInquiry);
router.get('/inquiries/my-inquiries', protect, authorize('seeker'), getMyInquiries);

router.post(
  '/',
  protect,
  authorize('seeker'),
  upload.single('resume'),
  applyJob
);

router.get(
  '/seeker/my-applications',
  protect,
  authorize('seeker'),
  getSeekerApplications
);

router.get(
  '/employer/applicants',
  protect,
  authorize('employer'),
  getEmployerApplicants
);

router.get(
  '/job/:jobId',
  protect,
  authorize('employer'),
  getJobApplicants
);

router.get(
  '/talent',
  protect,
  authorize('employer'),
  getTalentDirectory
);

router.patch(
  '/:id/resume',
  protect,
  authorize('seeker'),
  updateApplicationResume
);

router.patch(
  '/:id/status',
  protect,
  authorize('employer'),
  updateApplicationStatus
);

module.exports = router;
