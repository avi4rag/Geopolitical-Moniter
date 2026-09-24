import { Router } from 'express';
import * as sqlEventsController from '../controllers/sqlEventsController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// GET /api/v1/sql/events - Filtering and ordering (cached with Redis middleware)
router.get('/events', cacheMiddleware(120, 'sql-events'), sqlEventsController.getSqlEvents);

// GET /api/v1/sql/events/grouped - Grouping & Aggregations (cached with Redis middleware)
router.get('/events/grouped', cacheMiddleware(300, 'sql-grouped'), sqlEventsController.getSqlGroupedAnalytics);

// POST /api/v1/sql/events/transaction - ACID Transaction execution
router.post('/events/transaction', sqlEventsController.postSqlTransaction);

export default router;
