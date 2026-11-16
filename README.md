StockManager
Sistema de inventario y ventas para pequeños negocios, especialmente vendedores de tenis, ropa y accesorios.
Descripción
StockManager es una API REST que permite administrar productos, registrar y cancelar ventas, controlar existencias y consultar ganancias brutas. Incluye autenticación con JWT y permisos para administradores y empleados.

Este proyecto se desarrolla para la materia Tecnologías de desarrollo en el servidor. La versión actual corresponde al Entregable 2 de 4, con un avance funcional intermedio. Por ahora se utiliza desde Postman; no tiene interfaz web.
Tecnologías
- Node.js, Express y TypeScript
- MongoDB y Mongoose
- Docker (MongoDB local con replica set)
- bcryptjs (hash de contraseñas)
- jsonwebtoken (autenticación JWT)
- Postman (pruebas manuales)
Funcionalidades implementadas
Inventario
- Registrar, consultar y modificar productos.
- Guardar nombre, categoría, marca, talla, costo, precio y stock.
- Consultar productos con existencias menores o iguales a un límite configurable.
Ventas
- Registrar ventas y descontar existencias de forma transaccional.
- Comprobar que el producto exista y tenga stock suficiente.
- Consultar el historial de ventas.
- Cancelar ventas y devolver unidades al inventario mediante una transacción.
- Rechazar la cancelación de una venta ya cancelada.
Ganancias
- Consultar número de ventas válidas, unidades vendidas, ingresos, costos y ganancia bruta.
- Excluir las ventas canceladas de los cálculos.
Usuarios y roles
- Registrar cuentas con rol inicial employee.
- Iniciar sesión con correo y contraseña y obtener un JWT de dos horas de vigencia.
- Guardar hashes de contraseñas en MongoDB en lugar de contraseñas en texto plano.
- Restringir endpoints según los roles admin y employee.
Estructura principal
src/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
└── server.ts
Requisitos
- Node.js y npm
- Docker Desktop, o una instancia de MongoDB compatible con transacciones (replica set)
- Postman u otro cliente HTTP
Instalación
1. Clonar el repositorio e instalar dependencias:
git clone https://github.com/paul-hernandez-prog/StockManager.git
cd StockManager
npm install
2. Para reproducir el entorno MongoDB local utilizado en el Entregable 2, crear un contenedor nuevo en Docker:
docker run -d --name stockmanager-mongo -p 127.0.0.1:27018:27018 -v stockmanager-mongo-data:/data/db mongo:7 mongod --replSet rs0 --bind_ip_all --port 27018
3. Inicializar el replica set (solo la primera vez, cuando el contenedor ya esté listo):
docker exec stockmanager-mongo mongosh --port 27018 --quiet --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27018'}]})"
Comprobar el nodo primario:
docker exec stockmanager-mongo mongosh --port 27018 --quiet --eval "print(db.hello().isWritablePrimary)"
El resultado esperado es true. Si el contenedor ya existe, iniciarlo con docker start stockmanager-mongo en lugar de volver a crearlo.
4. Crear el archivo .env en la raíz del proyecto, a partir de .env.example:
PORT=3000
MONGO_URI=mongodb://localhost:27018/stockmanager?replicaSet=rs0
JWT_SECRET=pega_aqui_una_clave_aleatoria_segura
Generar una clave de prueba con:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
No subir .env a GitHub, no compartir claves ni tokens JWT. El archivo .env.example solo debe contener valores de ejemplo.
5. Iniciar el servidor:
npm run dev
API local: http://localhost:3000. Para comprobar los tipos de TypeScript, ejecutar npm run build.
Endpoints
Método	Endpoint	Acceso	Descripción
GET	/api/health	Público	Comprueba el servidor
POST	/api/auth/register	Público	Registra empleado
POST	/api/auth/login	Público	Inicia sesión y devuelve JWT
POST	/api/products	Admin	Registra producto
GET	/api/products	Admin y empleado	Lista productos
GET	/api/products/low-stock?threshold=3	Admin y empleado	Consulta existencias bajas
GET	/api/products/:id	Admin y empleado	Consulta producto
PUT	/api/products/:id	Admin	Modifica producto
POST	/api/sales	Admin y empleado	Registra venta
GET	/api/sales	Admin y empleado	Lista ventas
PATCH	/api/sales/:id/cancel	Admin	Cancela venta y devuelve stock
GET	/api/reports/profits	Admin	Consulta ganancias brutas


Para las rutas protegidas, enviar el encabezado Authorization: Bearer <token> obtenido al iniciar sesión. El registro público siempre crea usuarios con rol employee. Para las pruebas locales, una cuenta administradora fue asignada directamente en MongoDB; la API no permite darse permisos de administrador durante el registro.
Reglas y errores principales
- Una venta solo se registra si el producto existe y hay existencias suficientes.
- Registro y cancelación usan transacciones de MongoDB para actualizar ventas e inventario de manera conjunta.
- Una venta ya cancelada no se puede cancelar otra vez (409 Conflict).
- Los reportes de ganancias no cuentan ventas canceladas.
- El límite de la consulta de stock debe ser un número entero no negativo (400 Bad Request si es incorrecto).
- Las rutas protegidas devuelven 401 Unauthorized cuando falta un token válido y 403 Forbidden cuando el usuario no tiene permiso.
- Registrar un correo que ya existe devuelve 409 Conflict.
Pruebas
Las funcionalidades fueron comprobadas manualmente con Postman, incluyendo registro y cancelación de ventas, devolución de existencias, cálculo de ganancias, alertas de stock, autenticación y restricciones por rol. Las capturas se integran al PDF del Entregable 2.

Aún no se han incorporado pruebas automatizadas.
Estado y próximos pasos
Entregable 1: inventario, ventas y ganancias con MongoDB y Postman.

Entregable 2: cancelación transaccional, alertas de inventario bajo, cuentas con JWT, roles y protección de endpoints; además se reforzó el registro de ventas con transacciones.

Pendiente para las siguientes entregas: automatizar pruebas, mejorar validaciones y documentación y evaluar funciones adicionales, como reportes más completos o una interfaz sencilla.