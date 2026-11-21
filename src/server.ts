import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import reportRoutes from './routes/report.routes';
import authRoutes from './routes/auth.routes';
import type { ErrorRequestHandler } from 'express';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '10kb' }));

const jsonErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (error?.type === 'entity.too.large') {
    res.status(413).json({
      message: 'La peticion supera el limite de 10 KB'
    });
    return;
  }

  next(error);
};

app.use(jsonErrorHandler);

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'StockManager funcionando'
  });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Falta MONGO_URI');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');

    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar:', error);
    process.exit(1);
  }
}

startServer();
