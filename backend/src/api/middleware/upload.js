import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../../config/logger.js';

/**
 * File Upload Handling Middleware
 * 
 * Concept: File upload handling (Backend & System Design)
 * - Multipart/form-data processing
 * - Strict MIME type validation (whitelisting)
 * - File size boundary enforcement (max 5MB)
 * - Cryptographically randomized or UUID-safe naming to prevent directory traversal
 * - Storage management and clean error delegation
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types whitelist
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/json',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize base name and append timestamp + random suffix
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF, PDF, JSON`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5,                  // Max 5 files per request
  },
});

/**
 * Controller handler for file upload response
 */
export function handleFileUploadResponse(req, res) {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return res.status(400).json({
      status: 'error',
      code: 'NO_FILE_PROVIDED',
      message: 'No file was uploaded with key "file" or "files"',
    });
  }

  const uploadedFiles = req.files
    ? req.files.map(formatUploadedFile)
    : [formatUploadedFile(req.file)];

  logger.info({ count: uploadedFiles.length }, 'Files uploaded successfully');

  return res.status(201).json({
    status: 'success',
    message: 'File(s) uploaded successfully',
    data: {
      files: uploadedFiles,
    },
  });
}

function formatUploadedFile(file) {
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
    url: `/uploads/${file.filename}`,
  };
}
