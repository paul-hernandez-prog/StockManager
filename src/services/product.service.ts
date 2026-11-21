
import { Product } from '../models/product.model';
import mongoose from 'mongoose';
import { StockAdjustment } from '../models/stock-adjustment.model';

export async function addProduct(data: object) {
  return await Product.create(data);
}

export async function listProducts() {
  return await Product.find();
}

export async function findProduct(id: string) {
  return await Product.findById(id);
}

export async function editProduct(id: string, data: object) {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

export async function listLowStockProducts(threshold: number) {
  return await Product.find({
    stock: { $lte: threshold }
  }).sort({ stock: 1, name: 1 });
}

export async function editProductWithStockAdjustment(
  id: string,
  changes: Record<string, unknown>,
  newStock: number,
  reason: string,
  adjustedBy: string
) {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const product = await Product.findById(id).session(session);

      if (!product) {
        return null;
      }

      const previousStock = product.stock;

      product.set({
        ...changes,
        stock: newStock
      });

      await product.save({ session });

      if (previousStock !== newStock) {
        await StockAdjustment.create([{
          product: product._id,
          previousStock,
          newStock,
          reason,
          adjustedBy
        }], { session });
      }

      return product;
    });
  } finally {
    await session.endSession();
  }
}
