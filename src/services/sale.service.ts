
import { Product } from '../models/product.model';
import { Sale } from '../models/sale.model';
import mongoose from 'mongoose';

export class SaleError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}


export async function addSale(productId: string, quantity: number) {
  const session = await mongoose.startSession();

  try {
    const sale = await session.withTransaction(async () => {
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity }
        },
        { $inc: { stock: -quantity } },
        { new: true, session }
      );

      if (!product) {
        const exists = await Product.exists({
          _id: productId
        }).session(session);

        if (!exists) {
          throw new SaleError(404, 'Producto no encontrado');
        }

        throw new SaleError(409, 'Stock insuficiente');
      }

      const total = product.price * quantity;
      const profit = (product.price - product.cost) * quantity;

      const [createdSale] = await Sale.create([
        {
          product: product._id,
          productName: product.name,
          quantity,
          unitCost: product.cost,
          unitPrice: product.price,
          total,
          profit
        }
      ], { session });

      return createdSale;
    });

    if (!sale) {
      throw new Error('No se pudo registrar la venta');
    }

    return sale;
  } finally {
    await session.endSession();
  }
}

export async function listSales() {
  return await Sale.find().sort({ createdAt: -1 });
}



export async function cancelSale(saleId: string) {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const sale = await Sale.findOneAndUpdate(
        {
          _id: saleId,
          status: { $ne: 'cancelled' }
        },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date()
          }
        },
        { new: true, session }
      );

      if (!sale) {
        const exists = await Sale.exists({
          _id: saleId
        }).session(session);

        if (!exists) {
          throw new SaleError(404, 'Venta no encontrada');
        }

        throw new SaleError(409, 'La venta ya fue cancelada');
      }

      const product = await Product.findByIdAndUpdate(
        sale.product,
        { $inc: { stock: sale.quantity } },
        { new: true, session }
      );

      if (!product) {
        throw new SaleError(
          404,
          'Producto de la venta no encontrado'
        );
      }

      return sale;
    });

    return result;
  } finally {
    await session.endSession();
  }
}

