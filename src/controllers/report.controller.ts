import { Request, Response } from 'express';
import { getProfits } from '../services/report.service';

export async function getProfitReport(req: Request, res: Response) {
  try {
    const report = await getProfits();

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: 'Error al generar el reporte'
    });
  }
}
