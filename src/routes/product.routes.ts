
import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct
} from '../controllers/product.controller';

const router = Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);

export default router;
