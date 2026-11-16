
import { Product } from '../models/product.model';

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
