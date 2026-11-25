# StockManager

Sistema de inventario y ventas para pequeños negocios.

## Descripción

StockManager es una API REST para administrar productos, registrar y cancelar ventas, controlar existencias y consultar ganancias brutas.

Está desarrollada con Node.js, Express, TypeScript y MongoDB. Incluye autenticación JWT y permisos para administradores y empleados.

Proyecto final de la materia Tecnologías de desarrollo en el servidor. Se utiliza desde Postman y no cuenta con interfaz web.

## Tecnologías

- Node.js, Express y TypeScript
- MongoDB y Mongoose
- Docker con MongoDB replica set
- JWT y bcryptjs
- Jest y SWC para pruebas automatizadas
- Postman para pruebas manuales

## Funcionalidades

### Inventario
- Registrar, consultar y modificar productos.
- Consultar productos con poco stock.
- Validar los campos y tipos de datos recibidos.
- Registrar ajustes manuales de stock con un motivo y auditoría en MongoDB.

### Ventas
- Registrar ventas y descontar existencias mediante transacciones.
- Validar cantidades entre 1 y 100 unidades.
- Rechazar ventas sin stock suficiente.
- Consultar el historial de ventas.
- Cancelar ventas y devolver las unidades al inventario.

### Ganancias
- Consultar ingresos, costos y ganancias brutas.
- Excluir las ventas canceladas de los cálculos.

### Usuarios
- Registrar empleados e iniciar sesión con JWT.
- Proteger contraseñas mediante bcrypt.
- Restringir operaciones según el rol.
- Ocultar costos y ganancias en las respuestas para empleados.
- Inicializar el primer administrador con un script local.

## Instalación

### 1. Descargar el proyecto

git clone https://github.com/paul-hernandez-prog/StockManager.git
cd StockManager
npm install

### 2. Preparar MongoDB

Con Docker Desktop abierto, crear el contenedor:

docker run -d --name stockmanager-mongo -p 127.0.0.1:27018:27018 -v stockmanager-mongo-data:/data/db mongo:7 mongod --replSet rs0 --bind_ip_all --port 27018

Inicializar el replica set:

docker exec stockmanager-mongo mongosh --port 27018 --quiet --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27018'}]})"

Comprobar que esté listo:

docker exec stockmanager-mongo mongosh --port 27018 --quiet --eval "print(db.hello().isWritablePrimary)"

El resultado debe ser true.

Si el contenedor ya existe, iniciarlo con:

docker start stockmanager-mongo

### 3. Configurar las variables de entorno

Crear un archivo .env en la raíz del proyecto utilizando .env.example como referencia.

PORT=3000
MONGO_URI=mongodb://localhost:27018/stockmanager?replicaSet=rs0
JWT_SECRET=coloca_aqui_una_clave_segura

Para generar una clave:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

No subir el archivo .env a GitHub.

### 4. Ejecutar el proyecto

Modo desarrollo:

npm run dev

Comprobar compilación:

npm run build

Ejecutar versión compilada:

npm start

La API funciona en http://localhost:3000.

## Endpoints

| Método | Endpoint | Acceso |
|---|---|---|
| GET | /api/health | Público |
| POST | /api/auth/register | Público |
| POST | /api/auth/login | Público |
| POST | /api/products | Admin |
| GET | /api/products | Admin y employee |
| GET | /api/products/low-stock?threshold=3 | Admin y employee |
| GET | /api/products/:id | Admin y employee |
| PUT | /api/products/:id | Admin |
| POST | /api/sales | Admin y employee |
| GET | /api/sales | Admin y employee |
| PATCH | /api/sales/:id/cancel | Admin |
| GET | /api/reports/profits | Admin |

Las rutas protegidas requieren el encabezado:

Authorization: Bearer TOKEN

El token se obtiene desde POST /api/auth/login.

## Reglas principales

- Una venta requiere un producto existente y stock suficiente.
- La cantidad de una venta debe ser un entero entre 1 y 100.
- Las ventas y cancelaciones utilizan transacciones de MongoDB.
- No se permite cancelar dos veces la misma venta.
- Para modificar manualmente el stock se debe indicar un motivo (reason).
- Los empleados no reciben los campos cost, unitCost ni profit.
- El registro público siempre asigna el rol employee.
- El servidor limita los cuerpos JSON a 10 KB.

Errores principales:

- 400: datos o cantidades inválidas.
- 401: autenticación faltante o inválida.
- 403: usuario sin permisos.
- 404: recurso no encontrado.
- 409: conflicto, como stock insuficiente o venta ya cancelada.
- 413: cuerpo JSON demasiado grande.
- 500: error inesperado.

## Crear el primer administrador

1. Iniciar MongoDB y el servidor.
2. Registrar un empleado con POST /api/auth/register.
3. Ejecutar en otra terminal:

npm run bootstrap:admin -- correo@ejemplo.com

4. Iniciar sesión con esa cuenta.

El script solo permite conexiones locales y comprueba que todavía no exista un administrador. No contiene contraseñas fijas ni se expone como endpoint público.

## Pruebas automatizadas

Se utiliza Jest para comprobar el registro de ventas.

Ejecutar:

npm run build
npm test

Las pruebas requieren MongoDB local con replica set en el puerto 27018.

Utilizan una base separada llamada stockmanager_e3_jest. Antes de cada caso se limpian las colecciones de productos y ventas de esa base, por lo que no debe utilizarse para guardar información importante.

Casos implementados:

- CP-01: registrar una venta correctamente.
- CP-02: rechazar cantidades mayores a 100.
- CP-03: rechazar una venta sin stock suficiente.
- CP-04: vender la última unidad disponible.
- CP-05: vender exactamente 100 unidades.

Los cinco casos fueron ejecutados correctamente con Jest.

Los escenarios están documentados en tests/casos-venta.md y tests/flujos-venta.md.

## Arquitectura

La API está organizada por capas:

Cliente HTTP → Rutas → Controladores → Servicios → Modelos → MongoDB

- routes: endpoints y permisos.
- controllers: validación de peticiones y respuestas HTTP.
- services: reglas de negocio y transacciones.
- models: esquemas y operaciones de MongoDB.
- middlewares: autenticación JWT y autorización.
- scripts: inicialización del primer administrador.

## Estado final

Las funcionalidades principales del backend están implementadas y se comprobaron mediante Postman y pruebas automatizadas con Jest.

El proyecto funciona en un entorno local con MongoDB y Docker. No se realizó un despliegue público.

Como posibles mejoras futuras quedan una interfaz web, notificaciones automáticas, reportes más completos y pruebas adicionales de concurrencia.
