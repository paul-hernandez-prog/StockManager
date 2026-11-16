import { Router } from 'express';
import {
  createSale,
  getSales,
  cancelSaleController
} from '../controllers/sale.controller';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren iniciar sesion
router.use(requireAuth);

// Administradores y empleados
router.post('/', createSale);
router.get('/', getSales);

// Solo administradores
router.patch('/:id/cancel', requireRole('admin'), cancelSaleController);

export default router;
