import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  addProduct,
  listProducts,
  findProduct,
  editProduct,
  listLowStockProducts,
  editProductWithStockAdjustment
} from '../services/product.service';

function employeeProduct(product: {
  _id: unknown;
  name: string;
  category: string;
  brand: string;
  size: string;
  price: number;
  stock: number;
}) {
  return {
    _id: product._id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    size: product.size,
    price: product.price,
    stock: product.stock
  };
}

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
    const data = req.body;

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({
        message: 'Datos de producto invalidos'
      });
    }

    const allowedFields = [
      'name', 'category', 'brand', 'size',
      'cost', 'price', 'stock'
    ];

    const extraFields = Object.keys(data).filter(
      field => !allowedFields.includes(field)
    );

    if (extraFields.length > 0) {
      return res.status(400).json({
        message: 'Se enviaron campos no permitidos'
      });
    }

    const { name, category, brand, size, cost, price, stock } = data;

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof category !== 'string' || !category.trim() ||
      (brand !== undefined && typeof brand !== 'string') ||
      (size !== undefined && typeof size !== 'string') ||
      typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0 ||
      typeof price !== 'number' || !Number.isFinite(price) || price < 0 ||
      !Number.isSafeInteger(stock) || stock < 0
    ) {
      return res.status(400).json({
        message: 'Campos de producto invalidos'
      });
    }

    const product = await addProduct({
      name, category, brand, size, cost, price, stock
    });

    return res.status(201).json(product);

  } catch (error) {
    handleError(error, res);
  }
}

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await listProducts();

    if (res.locals.authUser?.role === 'admin') {
      return res.status(200).json(products);
    }

    res.status(200).json(products.map(employeeProduct));
  } catch (error) {
    handleError(error, res);
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'ID no valido'
      });
    }

    const product = await findProduct(id);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    if (res.locals.authUser?.role === 'admin') {
      return res.status(200).json(product);
    }

    return res.status(200).json(employeeProduct(product));

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

    const data = req.body;

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'Datos invalidos' });
    }

    const allowedFields = [
      'name', 'category', 'brand', 'size',
      'cost', 'price', 'stock', 'reason'
    ];

    if (Object.keys(data).some(key => !allowedFields.includes(key))) {
      return res.status(400).json({
        message: 'Se enviaron campos no permitidos'
      });
    }

    const { reason, ...changes } = data;

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({
        message: 'No se enviaron campos para actualizar'
      });
    }

    for (const field of ['name', 'category']) {
      if (field in changes &&
        (typeof changes[field] !== 'string' || !changes[field].trim())) {
        return res.status(400).json({ message: 'Datos invalidos' });
      }
    }

    for (const field of ['brand', 'size']) {
      if (field in changes && typeof changes[field] !== 'string') {
        return res.status(400).json({ message: 'Datos invalidos' });
      }
    }

    for (const field of ['cost', 'price']) {
      if (field in changes &&
        (typeof changes[field] !== 'number' ||
          !Number.isFinite(changes[field]) ||
          changes[field] < 0)) {
        return res.status(400).json({ message: 'Datos invalidos' });
      }
    }

    const hasStock = Object.prototype.hasOwnProperty.call(changes, 'stock');

    if (hasStock &&
      (!Number.isSafeInteger(changes.stock) ||
        changes.stock < 0 ||
        changes.stock > 1000000)) {
      return res.status(400).json({
        message: 'Stock invalido'
      });
    }

    if (hasStock &&
      (typeof reason !== 'string' ||
        !reason.trim() ||
        reason.trim().length > 200)) {
      return res.status(400).json({
        message: 'Debes indicar un motivo para ajustar el stock'
      });
    }

    if (!hasStock && reason !== undefined) {
      return res.status(400).json({
        message: 'El motivo solo se permite al ajustar stock'
      });
    }

    let product;

    if (hasStock) {
      const adminId = res.locals.authUser?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      product = await editProductWithStockAdjustment(
        id,
        changes,
        changes.stock,
        reason.trim(),
        adminId
      );
    } else {
      product = await editProduct(id, changes);
    }

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    handleError(error, res);
  }
}

export async function getLowStockProducts(req: Request, res: Response) {
  try {
    const value = req.query.threshold;

    if (value !== undefined && typeof value !== 'string') {
      return res.status(400).json({
        message: 'El limite de stock no es valido'
      });
    }

    const threshold = value === undefined ? 3 : Number(value);

    if (
      (value !== undefined && value.trim() === '') ||
      !Number.isSafeInteger(threshold) ||
      threshold < 0
    ) {
      return res.status(400).json({
        message: 'El limite debe ser un numero entero mayor o igual a 0'
      });
    }

    const products = await listLowStockProducts(threshold);

    res.status(200).json({
      threshold,
      count: products.length,
      products: res.locals.authUser?.role === 'admin'
        ? products
        : products.map(employeeProduct)
    });
  } catch (error) {
    handleError(error, res);
  }
}
