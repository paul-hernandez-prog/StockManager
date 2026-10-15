import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitCost: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export const Sale = mongoose.model('Sale', saleSchema);
