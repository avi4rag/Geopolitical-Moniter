import { Router } from 'express';
import {
  listEvents,
  getEvent,
  getEventImpacts,
  askIntel,
} from '../controllers/eventsController.js';

// ─── Events Router ────────────────────────────────────────────────────────────
const router = Router();

// GET /api/v1/events
// List events with filtering, sorting, and pagination
router.get('/', listEvents);

// POST /api/v1/events/ask
// AI natural language query engine that synthesizes answers from grounded events
router.post('/ask', askIntel);

// GET /api/v1/events/:id
// Single event + all its latest impact assessments
router.get('/:id', getEvent);

// GET /api/v1/events/:id/impacts
// All impact assessments for one event (includes superseded versions)
router.get('/:id/impacts', getEventImpacts);

export default router;
