
import { Sale } from '../models/sale.model';

export async function getProfits() {
  const result = await Sale.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        unitsSold: { $sum: '$quantity' },
        totalRevenue: { $sum: '$total' },
        totalCost: {
          $sum: {
            $multiply: ['$unitCost', '$quantity']
          }
        },
        totalProfit: { $sum: '$profit' }
      }
    }
  ]);

  return result[0] || {
    totalSales: 0,
    unitsSold: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0
  };
}
