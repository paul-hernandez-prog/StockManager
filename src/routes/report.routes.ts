import { Router } from 'express';
import { getProfitReport } from '../controllers/report.controller';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/profits', requireRole('admin'), getProfitReport);

export default router;
