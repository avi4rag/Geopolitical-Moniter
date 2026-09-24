import { Router } from 'express';
import {
  listEvents,
  getEvent,
  getEventImpacts,
  askIntel,
  getGroupedEvents,
} from '../controllers/eventsController.js';
import { cacheMiddleware } from '../middleware/cache.js';

// ─── Events Router ────────────────────────────────────────────────────────────
const router = Router();

// GET /api/v1/events/grouped
// Group events by category/severity/region with aggregations
router.get('/grouped', cacheMiddleware(180, 'events-grouped'), getGroupedEvents);

// GET /api/v1/events
// List events with filtering, sorting, and pagination (cached with Redis middleware)
router.get('/', cacheMiddleware(120, 'events-list'), listEvents);

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
