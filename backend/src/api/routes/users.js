import { Router } from 'express';
import {
  toggleBookmark,
  getBookmarks,
  updatePreferences,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

// ─── Users Router ─────────────────────────────────────────────────────────────
// All routes in this router require authentication.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.use(requireAuth);

// GET /api/v1/users/bookmarks
router.get('/bookmarks', getBookmarks);

// POST /api/v1/users/bookmarks/:eventId
router.post('/bookmarks/:eventId', toggleBookmark);

// PUT /api/v1/users/preferences
router.put('/preferences', updatePreferences);

export default router;
