import { Router } from 'express';
import { upload, handleFileUploadResponse } from '../middleware/upload.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/v1/uploads - Single or multiple file upload handler
router.post(
  '/',
  optionalAuth,
  upload.array('files', 5),
  handleFileUploadResponse
);

// POST /api/v1/uploads/avatar - Single avatar file upload
router.post(
  '/avatar',
  optionalAuth,
  upload.single('avatar'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_FILE_PROVIDED',
        message: 'No avatar image uploaded with field "avatar"',
      });
    }
    return handleFileUploadResponse(req, res);
  }
);

export default router;
