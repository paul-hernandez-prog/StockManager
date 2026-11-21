
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  addSale,
  listSales,
  cancelSale,
  SaleError
} from '../services/sale.service';
const MAX_SALE_QUANTITY = 100;

function employeeSale(sale: {
  _id: unknown;
  product: unknown;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: string;
  cancelledAt?: Date | null;
}) {
  return {
    _id: sale._id,
    product: sale.product,
    productName: sale.productName,
    quantity: sale.quantity,
    unitPrice: sale.unitPrice,
    total: sale.total,
    status: sale.status,
    cancelledAt: sale.cancelledAt ?? null
  };
}

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
    
    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      quantity > MAX_SALE_QUANTITY
    ) {
      return res.status(400).json({
        message: 'La cantidad debe ser un entero entre 1 y 100'
      });
    }

    const sale = await addSale(productId, quantity);

    if (res.locals.authUser?.role === 'admin') {
      return res.status(201).json(sale);
    }

    res.status(201).json(employeeSale(sale));
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

    if (res.locals.authUser?.role === 'admin') {
      return res.status(200).json(sales);
    }

    res.status(200).json(sales.map(employeeSale));
  } catch (error) {
    res.status(500).json({
      message: 'Error al consultar las ventas'
    });
  }
}

export async function cancelSaleController(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'ID de venta no valido'
      });
    }

    const sale = await cancelSale(id);

    res.status(200).json({
      message: 'Venta cancelada correctamente',
      sale
    });
  } catch (error) {
    if (error instanceof SaleError) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error al cancelar la venta'
    });
  }
}
