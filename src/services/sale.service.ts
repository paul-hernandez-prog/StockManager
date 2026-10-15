
import { Product } from '../models/product.model';
import { Sale } from '../models/sale.model';

export class SaleError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export async function addSale(productId: string, quantity: number) {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      stock: { $gte: quantity }
    },
    {
      $inc: { stock: -quantity }
    },
    { new: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: productId });

    if (!exists) {
      throw new SaleError(404, 'Producto no encontrado');
    }

    throw new SaleError(409, 'Stock insuficiente');
  }

  const total = product.price * quantity;
  const profit = (product.price - product.cost) * quantity;

  try {
    return await Sale.create({
      product: product._id,
      productName: product.name,
      quantity,
      unitCost: product.cost,
      unitPrice: product.price,
      total,
      profit
    });
  } catch (error) {
    // Intentar devolver las unidades si falla el registro.
    await Product.updateOne(
      { _id: product._id },
      { $inc: { stock: quantity } }
    );

    throw error;
  }
}

export async function listSales() {
  return await Sale.find().sort({ createdAt: -1 });
}
