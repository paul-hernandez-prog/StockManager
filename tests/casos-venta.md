
# Casos de prueba - Registro de ventas

Feature: Registro de ventas
Endpoint: POST /api/sales

## CP-01 - Registrar una venta correctamente
Tipo: Happy Path
Precondición: Producto existente con stock de 5.
Entrada: quantity = 2.
Pasos: Enviar la petición con el ID del producto.
Resultado esperado: HTTP 201, venta registrada y stock de 3.
Resultado obtenido: Pendiente.

## CP-02 - Cantidad fuera del límite
Tipo: Error Case
Precondición: Usuario autenticado.
Entrada: quantity = 101.
Pasos: Intentar registrar la venta.
Resultado esperado: HTTP 400 y ninguna venta creada.
Resultado obtenido: Pendiente.

## CP-03 - Stock insuficiente
Tipo: Error Case
Precondición: Producto con stock de 1.
Entrada: quantity = 2.
Pasos: Intentar registrar la venta.
Resultado esperado: HTTP 409 y stock sin cambios.
Resultado obtenido: Pendiente.

## CP-04 - Vender la última unidad
Tipo: Edge Case
Precondición: Producto con stock de 1.
Entrada: quantity = 1.
Pasos: Registrar la venta.
Resultado esperado: HTTP 201 y stock de 0.
Resultado obtenido: Pendiente.

## CP-05 - Cantidad máxima permitida
Tipo: Edge Case
Precondición: Producto con stock de 100.
Entrada: quantity = 100.
Pasos: Registrar la venta.
Resultado esperado: HTTP 201 y stock de 0.
Resultado obtenido: Pendiente.
