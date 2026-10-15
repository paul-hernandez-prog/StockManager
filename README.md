
# StockManager

Sistema de gestion de inventario y ventas para pequenos negocios.

## Descripcion

StockManager es una API Backend que permite administrar productos,
registrar ventas y consultar las ganancias de un negocio.

El sistema esta pensado para pequenos comerciantes que necesitan
organizar su inventario y controlar sus ingresos.

## Tecnologias

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

## Funcionalidades

### 1. Gestion de inventario
- Registrar productos.
- Consultar productos.
- Buscar productos por ID.
- Modificar informacion de productos.

### 2. Registro de ventas
- Registrar ventas de productos.
- Descontar automaticamente el inventario.
- Validar que exista suficiente stock.
- Consultar el historial de ventas.

### 3. Reportes de ganancias
- Consultar el total de ventas.
- Calcular los ingresos.
- Calcular los costos.
- Consultar las ganancias acumuladas.

## Instalacion

Requisitos:
- Node.js
- MongoDB
- npm

1. Clonar el repositorio:

git clone https://github.com/paul-hernandez-prog/StockManager.git

2. Instalar dependencias:

npm install

3. Crear un archivo .env basado en .env.example:

PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/stockmanager

4. Iniciar MongoDB.

5. Ejecutar el servidor:

npm run dev

El servidor estara disponible en:
http://localhost:3000

## API

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | /api/products | Registrar producto |
| GET | /api/products | Consultar inventario |
| GET | /api/products/:id | Consultar producto |
| PUT | /api/products/:id | Actualizar producto |
| POST | /api/sales | Registrar venta |
| GET | /api/sales | Consultar ventas |
| GET | /api/reports/profits | Consultar ganancias |

## Estado del proyecto

Primera entrega:
- Backend funcional.
- Conexion con MongoDB.
- Tres features implementadas.
- API REST disponible para pruebas con Postman.

## Proximas funcionalidades

- Autenticacion de usuarios.
- Roles y permisos.
- Interfaz web.
- Alertas de inventario.
- Pruebas automatizadas.
