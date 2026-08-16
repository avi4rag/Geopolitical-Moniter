import { Router } from 'express';
import {
  listEvents,
  getEvent,
  getEventImpacts,
} from '../controllers/eventsController.js';

// ─── Events Router ────────────────────────────────────────────────────────────
const router = Router();

// GET /api/v1/events
// List events with filtering, sorting, and pagination
router.get('/', listEvents);

// GET /api/v1/events/:id
// Single event + all its latest impact assessments
router.get('/:id', getEvent);

// GET /api/v1/events/:id/impacts
// All impact assessments for one event (includes superseded versions)
router.get('/:id/impacts', getEventImpacts);

export default router;
