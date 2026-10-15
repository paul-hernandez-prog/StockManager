
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  addSale,
  listSales,
  SaleError
} from '../services/sale.service';

export async function createSale(req: Request, res: Response) {
  try {
    const { productId, quantity } = req.body ?? {};

    if (
      typeof productId !== 'string' ||
      !mongoose.isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: 'ID de producto no valido'
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: 'La cantidad debe ser un entero mayor a cero'
      });
    }

    const sale = await addSale(productId, quantity);

    res.status(201).json(sale);
  } catch (error) {
    if (error instanceof SaleError) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error al registrar la venta'
    });
  }
}

export async function getSales(req: Request, res: Response) {
  try {
    const sales = await listSales();
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({
      message: 'Error al consultar las ventas'
    });
  }
}
