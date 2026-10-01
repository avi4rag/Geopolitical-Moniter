import { Router } from 'express';
import { upload, avatarUpload, handleFileUploadResponse } from '../middleware/upload.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/v1/uploads - Single or multiple file upload handler
router.post(
  '/',
  optionalAuth,
  upload.array('files', 5),
  handleFileUploadResponse
);

// POST /api/v1/uploads/avatar - Authenticated single avatar file upload (JPEG, PNG, WEBP <= 5MB)
router.post(
  '/avatar',
  requireAuth,
  (req, res, next) => {
    avatarUpload.single('avatar')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            code: 'FILE_TOO_LARGE',
            message: 'Image size exceeds the 5MB maximum limit. Please choose a smaller image.',
          });
        }
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            status: 'error',
            code: 'INVALID_FILE_TYPE',
            message: err.message || 'Invalid image format. Allowed formats: JPEG, PNG, WEBP.',
          });
        }
        return res.status(400).json({
          status: 'error',
          code: 'UPLOAD_ERROR',
          message: err.message || 'Failed to process image upload.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          code: 'NO_FILE_PROVIDED',
          message: 'No avatar image uploaded with field "avatar"',
        });
      }

      return handleFileUploadResponse(req, res);
    });
  }
);

export default router;
