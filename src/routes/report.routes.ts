import { Router } from 'express';
import { getProfitReport } from '../controllers/report.controller';

const router = Router();

router.get('/profits', getProfitReport);

export default router;
