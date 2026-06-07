const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const isServerless = !!(process.env.VERCEL || process.env.FIREBASE_CONFIG || process.env.FUNCTIONS_EMULATOR);
const uploadDir = isServerless ? '/tmp' : path.join(__dirname, '../uploads');
if (!isServerless && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /pdf|doc|docx/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, or DOCX files are allowed!'));
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
