# Casos de prueba - Registro de ventas

Feature: Registro de ventas  
Endpoint: POST /api/sales

## CP-01 - Registrar una venta correctamente

**Tipo:** Happy Path
**Precondiciones:** Producto existente con stock de 5.
**Entrada:** quantity = 2.
**Pasos:** Enviar la petición con el ID del producto y la cantidad solicitada.
**Resultado esperado:** HTTP 201, venta registrada y stock actualizado a 3.
**Resultado obtenido:** HTTP 201. La venta se registró en MongoDB y el stock bajó de 5 a 3.
**Estado:** PASS.

## CP-02 - Cantidad fuera del límite

**Tipo:** Error Case
**Precondiciones:** Usuario autorizado y producto existente con stock de 5.
**Entrada:** quantity = 101.
**Pasos:** Intentar registrar una venta de 101 unidades.
**Resultado esperado:** HTTP 400 y ninguna venta creada.
**Resultado obtenido:** HTTP 400. El sistema rechazó la cantidad y no se registró ninguna venta.
**Estado:** PASS.

## CP-03 - Stock insuficiente

**Tipo:** Error Case
**Precondiciones:** Producto existente con stock de 1.
**Entrada:** quantity = 2.
**Pasos:** Intentar registrar una venta de 2 unidades.
**Resultado esperado:** HTTP 409, ninguna venta creada y stock sin cambios.
**Resultado obtenido:** HTTP 409. No se registró ninguna venta y el stock permaneció en 1.
**Estado:** PASS.

## CP-04 - Vender la última unidad

**Tipo:** Edge Case
**Precondiciones:** Producto existente con stock de 1.
**Entrada:** quantity = 1.
**Pasos:** Registrar la venta de la última unidad disponible.
**Resultado esperado:** HTTP 201, venta registrada y stock actualizado a 0.
**Resultado obtenido:** HTTP 201. La venta se registró correctamente y el stock quedó en 0.
**Estado:** PASS.

## CP-05 - Cantidad máxima permitida

**Tipo:** Edge Case
**Precondiciones:** Producto existente con stock de 100.
**Entrada:** quantity = 100.
**Pasos:** Registrar una venta de exactamente 100 unidades.
**Resultado esperado:** HTTP 201, venta registrada y stock actualizado a 0.
**Resultado obtenido:** HTTP 201. Se registró la venta de 100 unidades y el stock quedó en 0.
**Estado:** PASS.

## Resultados generales

Se ejecutaron cinco pruebas automatizadas con Jest sobre el registro de ventas.

- Happy Path: 1 prueba aprobada.
- Error Cases: 2 pruebas aprobadas.
- Edge Cases: 2 pruebas aprobadas.

**Resultado final:** 5 pruebas aprobadas, 0 fallidas.

Las pruebas se ejecutaron con una base de datos separada llamada stockmanager_e3_jest para no modificar el inventario principal.
Durante la configuración apareció un error de conexión entre Jest y MongoDB. Se resolvió ajustando la configuración del cliente de Mongoose para el entorno de pruebas.
Después de la corrección, todos los casos se ejecutaron correctamente.
