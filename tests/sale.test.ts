import * as os from 'node:os';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { beforeAll, beforeEach, afterAll, describe, test, expect } from '@jest/globals';

import { createSale } from '../src/controllers/sale.controller';
import { Product } from '../src/models/product.model';
import { Sale } from '../src/models/sale.model';

const TEST_DB =
  'mongodb://127.0.0.1:27018/stockmanager_e3_jest?replicaSet=rs0&directConnection=true';

// Preparar la conexión a la base de pruebas.

beforeAll(async () => {
  console.log('Intentando conectar con MongoDB...');

  try {   
    await mongoose.connect(TEST_DB, {
      serverSelectionTimeoutMS: 5000,
      runtimeAdapters: {
        os
      }
    });

    console.log('Conectado a:', mongoose.connection.name);

    if (mongoose.connection.name !== 'stockmanager_e3_jest') {
      throw new Error('Base de pruebas incorrecta');
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}, 20000);


// Limpiar los datos de prueba antes de cada caso.
beforeEach(async () => {
  await Sale.deleteMany({});
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

// Crear un producto con las existencias necesarias.
async function createTestProduct(stock: number) {
  return Product.create({
    name: 'Tenis de prueba',
    category: 'Calzado',
    brand: 'Nike',
    size: '27 MX',
    cost: 500,
    price: 800,
    stock
  });
}

// Ejecutar el controlador y obtener su respuesta.
async function sendSale(productId: string, quantity: unknown) {
  let statusCode = 0;
  let responseBody: unknown;

  const req = {
    body: { productId, quantity }
  } as unknown as Request;

  const res = {
    locals: {
      authUser: { role: 'admin' }
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      responseBody = body;
      return this;
    }
  } as unknown as Response;

  await createSale(req, res);

  return { statusCode, responseBody };
}

describe('Registro de ventas', () => {

  test('CP-01: registra una venta correctamente', async () => {
    // Arrange
    const product = await createTestProduct(5);

    // Act
    const result = await sendSale(String(product._id), 2);

    // Assert
    expect(result.statusCode).toBe(201);
    expect(await Sale.countDocuments()).toBe(1);

    const updated = await Product.findById(product._id);
    expect(updated?.stock).toBe(3);
  });

  test('CP-02: rechaza cantidades mayores a 100', async () => {
    const product = await createTestProduct(5);

    const result = await sendSale(String(product._id), 101);

    expect(result.statusCode).toBe(400);
    expect(await Sale.countDocuments()).toBe(0);
  });

  test('CP-03: rechaza ventas sin stock suficiente', async () => {
    const product = await createTestProduct(1);

    const result = await sendSale(String(product._id), 2);

    expect(result.statusCode).toBe(409);
    expect(await Sale.countDocuments()).toBe(0);

    const updated = await Product.findById(product._id);
    expect(updated?.stock).toBe(1);
  });

  test('CP-04: permite vender la ultima unidad', async () => {
    const product = await createTestProduct(1);

    const result = await sendSale(String(product._id), 1);

    expect(result.statusCode).toBe(201);
    expect(await Sale.countDocuments()).toBe(1);

    const updated = await Product.findById(product._id);
    expect(updated?.stock).toBe(0);
  });

  test('CP-05: permite vender exactamente 100 unidades', async () => {
    const product = await createTestProduct(100);

    const result = await sendSale(String(product._id), 100);

    expect(result.statusCode).toBe(201);
    expect(await Sale.countDocuments()).toBe(1);

    const updated = await Product.findById(product._id);
    expect(updated?.stock).toBe(0);
  });

});
