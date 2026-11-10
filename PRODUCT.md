# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Vendedores (3 colaboradores en mostrador):** Bryan Pérez, Jorge Goluboay, Dauren Matarrita / Estefany Durán. Registran de forma inmediata cada pedido que requiere entrega a domicilio o a talleres locales tras cerrar la venta. Consultan el estado del pedido para dar respuestas certeras a los clientes.
- **Repartidor (1 colaborador en ruta):** Ronny Salas. Consulta los pedidos pendientes y preparados, revisa el repuesto y la dirección con señas en Liberia, actualiza el estado de la entrega en tiempo real y reporta incidencias o devoluciones en sitio.
- **Jefa de Tienda (Supervisión y Liderazgo):** Dra. Marcela Vargas Sibaja (rol directivo). Supervisa el cumplimiento de los tiempos, detecta atrasos, evalúa registros incompletos, resuelve incidencias operativas y revisa los indicadores semanales del piloto.
- **Clientes externos (Talleres y particulares en Liberia y alrededores):** Beneficiarios indirectos que reciben los repuestos correctos, en el tiempo acordado y con comunicación consistente.

## Product Purpose

Centralizar y formalizar el flujo de pedidos con entrega a domicilio en la sucursal de Auto Clima Liberia, sustituyendo las comunicaciones verbales dispersas y notas manuales por un registro digital trazable. El éxito se define por la reducción de errores en piezas enviadas, cero atrasos evitables y una tasa de datos completos $\ge 90\%$ durante la operación.

## Positioning

Una herramienta interna especializada y ágil que resuelve con precisión quirúrgica el punto de coordinación entre ventas y despacho, complementando el sistema de inventario existente sin reemplazarlo, sin burocracia añadida y sin crear puestos de trabajo nuevos.

## Operating Context

- **Entorno:** Mostrador de ventas y almacén de repuestos de aire acondicionado automotriz en Liberia (Guanacaste, Costa Rica).
- **Dispositivos:** Computadoras de escritorio existentes en la tienda para vendedores y jefa; dispositivo móvil o terminal en mostrador para el repartidor.
- **Convivencia tecnológica:** Coexiste con el software de inventario comercial que la empresa ya tiene instalado en sus terminales.

## Capabilities and Constraints

- **Capacidades confirmadas:**
  - Registro de pedidos con validación estricta de campos obligatorios (número de pedido, cliente, teléfono, repuestos de A/C, dirección/señas, fecha/hora compromiso y responsable).
  - Ciclo de estados operativos en un clic: `Pendiente` $\rightarrow$ `Preparado` $\rightarrow$ `En Ruta` $\rightarrow$ `Entregado`.
  - Trazabilidad y auditoría cronológica inmutable por usuario.
  - Flujo inverso de incidencias y devoluciones vinculado al pedido original (cliente ausente, pieza incompatible, dirección inaccesible, etc.).
  - Tablero de métricas semanales y KPIs para supervisión de la jefa.
- **Restricciones confirmadas:**
  - No altera ni descuenta inventario automáticamente (el stock se gestiona en el sistema troncal).
  - No gestiona pagos con pasarelas electrónicas ni cobros en línea (cobro contra entrega o en caja tradicional).
  - Idioma de interfaz: Español profesional/operativo.

## Brand Commitments

- **Nombre:** Auto Clima — Sucursal Liberia.
- **Identidad:** Especialistas en sistemas de climatización y aire acondicionado automotriz.
- **Tono:** Confiable, profesional, directo, operativo y de respuesta rápida.

## Evidence on Hand

- Documento formal *Taller I: Modelo de negocio, mercado, estrategia y liderazgo (Auto Clima – Sucursal Liberia)*.
- *Guía de trabajo EIF407 (Liderazgo y Organización)*, Universidad Nacional de Costa Rica, Campus Nicoya.
- Equipo formal del proyecto: Goluboay, Matarrita, Durán, Pérez, Salas.

## Product Principles

1. **Cero fricción en mostrador:** El registro de un pedido no puede tomar más de 45 segundos para no entorpecer la atención al cliente.
2. **Trazabilidad sin ambigüedades:** Todo cambio de estado lleva responsable, marca de tiempo y notas de auditoría.
3. **Complementariedad estricta:** Resuelve la coordinación operativa sin duplicar funciones del sistema de inventario.
4. **Agilidad en ruta:** La interfaz del repartidor debe ser operable con una sola mano y botones táctiles claros.

## Accessibility & Inclusion

- Alto contraste y tipografía nítida para pantallas expuestas a la luz natural del mostrador en Guanacaste y para el repartidor en exteriores.
- Acceso táctil optimizado para dispositivos móviles en ruta.
