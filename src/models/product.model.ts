
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  size: {
    type: String,
    trim: true,
    default: ''
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'El stock debe ser un numero entero'
    }
  }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
