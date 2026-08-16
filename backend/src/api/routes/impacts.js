import { Router } from 'express';
import { listImpacts, getImpactsByDomain } from '../controllers/impactsController.js';

// ─── Impacts Router ───────────────────────────────────────────────────────────
const router = Router();

// GET /api/v1/impacts
// All latest impact assessments (cross-event), with domain/direction filter
router.get('/', listImpacts);

// GET /api/v1/impacts/domain/:domain
// All latest assessments for a specific domain, sorted by confidence
router.get('/domain/:domain', getImpactsByDomain);

export default router;
