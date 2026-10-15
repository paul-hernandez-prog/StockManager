import { Router } from 'express';
import {
  createSale,
  getSales
} from '../controllers/sale.controller';

const router = Router();

router.post('/', createSale);
router.get('/', getSales);

export default router;
