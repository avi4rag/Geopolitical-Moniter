import { Router } from 'express';
import { listSources, getSource } from '../controllers/sourcesController.js';

// ─── Sources Router ───────────────────────────────────────────────────────────
const router = Router();

// GET /api/v1/sources
router.get('/', listSources);

// GET /api/v1/sources/:id
router.get('/:id', getSource);

export default router;
