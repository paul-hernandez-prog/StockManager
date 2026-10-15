import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  addProduct,
  listProducts,
  findProduct,
  editProduct
} from '../services/product.service';

function handleError(error: unknown, res: Response) {
  if (error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({
    message: 'Error interno del servidor'
  });
}

export async function createProduct(req: Request, res: Response) {
  try {
    const product = await addProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    handleError(error, res);
  }
}

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await listProducts();
    res.status(200).json(products);
  } catch (error) {
    handleError(error, res);
  }
}


export async function getProduct(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID no valido' });
    }

    const product = await findProduct(id);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json(product);
  } catch (error) {
    handleError(error, res);
  }
}



export async function updateProduct(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID no valido' });
    }

    const allowedFields = [
      'name', 'category', 'brand', 'size',
      'cost', 'price', 'stock'
    ];

    const changes: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        changes[field] = req.body[field];
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({
        message: 'No se enviaron campos validos'
      });
    }

    const product = await editProduct(id, changes);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json(product);
  } catch (error) {
    handleError(error, res);
  }
}
