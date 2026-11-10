# Auto Clima (Sucursal Liberia) — Sistema Digital de Gestión y Seguimiento de Pedidos y Entregas

> **Curso:** EIF407 Liderazgo y Organización — II Ciclo 2026  
> **Universidad Nacional de Costa Rica (UNA)** — Sede Regional Chorotega, Campus Nicoya  
> **Equipo:** Jorge Esteban Goluboay Alvarado, Dauren Mayela Matarrita Prendas, Estefany Durán Carrillo, Bryan Pérez Balladares, Ronny Jafeth Salas Azofeifa  
> **Profesor:** Dra. Marcela Vargas Sibaja  

---

## 📋 Descripción del Proyecto

Aplicación web interna desarrollada a la medida para resolver el cuello de botella crítico de **coordinación, trazabilidad y seguimiento entre el área de ventas y el reparto** en la sucursal de Auto Clima en Liberia (Guanacaste).

> [!IMPORTANT]
> **Complementariedad con el sistema actual:** Esta solución **no sustituye** el sistema de consulta de inventario que ya opera en las computadoras de la sucursal, sino que se especializa en el registro ordenado, la visualización de rutas de despacho, la atención de incidencias y la supervisión de entregas de repuestos de aire acondicionado automotriz.

---

## 🚀 Arquitectura y Stack Tecnológico

* **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
* **Base de Datos:** SQLite nativo (`node:sqlite`) con modo WAL para alta concurrencia y persistencia local sin dependencias C++ externas.
* **Estilos & UI:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (iconos SVG optimizados).
* **Control de Acceso (RBAC):** Perfiles adaptados a la estructura real de la tienda:
  * 👑 **Jefa de Tienda:** Supervisión general, panel de métricas y resolución de incidencias complejas.
  * 💼 **Vendedores (3 colaboradores):** Registro ágil de pedidos con validación estricta de campos obligatorios y consulta en tiempo real para clientes.
  * 🚚 **Repartidor:** Cola de pedidos para despacho, actualización de estados en un clic (`Preparado` $\rightarrow$ `En Ruta` $\rightarrow$ `Entregado`) y reporte inmediato de incidencias en sitio.

---

## 🛠️ Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

3. **Compilar para producción:**
   ```bash
   npm run build
   npm start
   ```

---

## 📊 Indicadores Clave del Taller I

La aplicación monitorea en tiempo real los KPIs definidos en el diagnóstico organizacional:
1. **Tasa de pedidos con campos obligatorios completos** (Meta piloto: $\ge 90\%$).
2. **Tasa de pedidos con estado actualizado oportunamente** (Meta piloto: $\ge 90\%$).
3. **Control de demoras y entregas fuera de plazo**.
4. **Flujo inverso de incidencias y devoluciones resueltas**.
5. **Hoja de Ruta física imprimible (`@media print`)**: Respaldo operativo para zonas rurales o con baja cobertura celular en Guanacaste, con control de firmas de custodia (Mostrador, Repartidor y Liquidación Jefatura).
