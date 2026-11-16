import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  getLowStockProducts
} from '../controllers/product.controller';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren iniciar sesion
router.use(requireAuth);

// Solo administradores
router.post('/', requireRole('admin'), createProduct);
router.put('/:id', requireRole('admin'), updateProduct);

// Administradores y empleados
router.get('/', getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', getProduct);

export default router;
