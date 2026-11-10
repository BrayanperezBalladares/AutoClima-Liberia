---
name: Auto Clima Liberia
description: Sistema Digital de Gestión y Seguimiento de Pedidos y Entregas
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-subtle: "#eff6ff"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-text: "#0f172a"
  neutral-muted: "#64748b"
  status-pending: "#d97706"
  status-pending-bg: "#fef3c7"
  status-ready: "#2563eb"
  status-ready-bg: "#dbeafe"
  status-route: "#0284c7"
  status-route-bg: "#e0f2fe"
  status-delivered: "#059669"
  status-delivered-bg: "#d1fae5"
  status-incident: "#dc2626"
  status-incident-bg: "#fee2e2"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card-order:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  badge-status:
    rounded: "{rounded.full}"
    padding: "2px 10px"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Auto Clima Liberia

## Overview

**Creative North Star: "Precisión Térmica / Industrial Clean"**

El sistema visual de Auto Clima Liberia está concebido para un entorno de trabajo real y exigente: mostradores de repuestos automotrices y reparto en ruta en el calor y luz intensa de Guanacaste. Descarta artificios visuales, gradientes decorativos y estéticas genéricas de IA para priorizar legibilidad inmediata, alto contraste y velocidad de escaneo tanto en pantallas de escritorio como en terminales móviles bajo luz solar directa.

La atmósfera es sobria, técnica y eficiente. Los fondos en gris pizarra claro (`#f8fafc`) reducen la fatiga visual en jornadas completas de mostrador, mientras que el azul refrigerante profundo (`#2563eb`) ancla las acciones principales y la identidad de climatización vehicular. Los estados de entrega y despacho operan como señales de tránsito semafóricas: inequívocas a primera vista.

**Key Characteristics:**
- **Claridad funcional inmediata:** Jerarquía tipográfica calibrada para identificar cliente, repuesto y dirección en menos de tres segundos.
- **Contraste de alto rendimiento:** Ratios WCAG AA/AAA para visibilidad en ambientes con alta iluminación ambiental.
- **Densidad balanceada:** Compacto para revisar colas de pedidos sin scroll innecesario, pero con áreas táctiles generosas ($\ge 44$ px) para el repartidor en ruta.

## Colors

Paleta industrial limpia inspirada en gases refrigerantes, metales de taller automotriz y códigos de estado universales.

### Primary
- **Refrigerant Blue** (`#2563eb`): Color de marca y foco de acción primaria (crear pedido, avanzar estado, guardar). Inspira frío, precisión técnica y fiabilidad.
- **Deep Cobalt Hover** (`#1d4ed8`): Estado activo e interactivo para botones y enlaces.
- **Cool Mist Tint** (`#eff6ff`): Fondos de soporte, selección de pestañas y contenedores de repuestos.

### Secondary
- **Transit Cobalt** (`#0284c7`): Tono de despacho y movilidad (reemplaza morados genéricos). Utilizado para indicar pedidos «En Ruta» y logística de transporte.

### Neutral
- **Slate Void** (`#0f172a`): Tinta principal para títulos, números de pedido y textos de máxima prioridad.
- **Industrial Body** (`#334155`): Texto regular y especificaciones de repuestos.
- **Muted Steel** (`#64748b`): Etiquetas secundarias, metadatos y marcas de tiempo.
- **Separator Slate** (`#e2e8f0`): Bordes estructurales de tarjetas y divisores de tablas.
- **Clean Ground** (`#f8fafc`): Lienzo global de fondo.
- **Pure Surface** (`#ffffff`): Fondo de tarjetas, modales y formularios.

### Status Palette
- **Pendiente:** Fondo `#fef3c7`, Texto `#92400e`, Acento `#d97706` (Ámbar de preparación).
- **Preparado:** Fondo `#dbeafe`, Texto `#1e40af`, Acento `#2563eb` (Azul mostrador).
- **En Ruta:** Fondo `#e0f2fe`, Texto `#0369a1`, Acento `#0284c7` (Cobalto tránsito).
- **Entregado:** Fondo `#d1fae5`, Texto `#065f46`, Acento `#059669` (Esmeralda completado).
- **Incidencia / Atraso:** Fondo `#fee2e2`, Texto `#991b1b`, Acento `#dc2626` (Rojo alerta operativa).

### Named Rules
**The High-Noon Glare Rule.** Todo texto crítico (cliente, repuesto, dirección, estado) debe mantener un contraste de al menos 4.5:1 contra su fondo. Se prohíbe el uso de textos grises claros sobre fondos blancos.

**The Zero-Slop Palette Rule.** Quedan terminantemente prohibidos los gradientes violetas/magenta o acentos de neón saturados que denoten interfaces de demostración sintéticas. Los acentos responden estrictamente al estado físico del repuesto.

## Typography

**Display & Body Font:** Inter / System UI (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)  
**Monospace Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`  

**Character:** Tipografía sans-serif neutra y de trazo limpio para lectura de catálogo técnico, complementada con monoespaciado para códigos de factura y números de pedido consecutivos.

### Hierarchy
- **Display** (Bold 700, `1.5rem` / 24px, line-height 1.2): Encabezados de módulo y totales de supervisión.
- **Headline** (Bold 700, `1.125rem` / 18px, line-height 1.3): Títulos de modales y nombre de cliente en tarjetas.
- **Title** (Semibold 600, `0.875rem` / 14px, line-height 1.4): Nombres de campos, pestañas de navegación y métricas secundarias.
- **Body** (Regular 400, `0.875rem` / 14px, line-height 1.5): Detalle de repuestos, notas de entrega y observaciones.
- **Label** (Semibold 600, `0.75rem` / 12px, line-height 1.2): Etiquetas de pastillas de estado y roles de usuario.
- **Monospace Order** (Bold 700, `0.875rem` / 14px): Identificador único del pedido (`PED-2026-XXX`).

### Named Rules
**The Monospace Order Rule.** Todo número de pedido y código de factura debe renderizarse en tipografía monoespaciada para facilitar la comparación cruzada con boletas físicas y el sistema de inventario.

## Layout

- **Estructura:** Cuadrícula fluida contenida en `max-w-7xl` (1280px) centrada con márgenes laterales adaptativos (`px-4 sm:px-6 lg:px-8`).
- **Métricas Superiores:** Friso de 6 indicadores en fila compacta en escritorio, colapsable a 2 columnas en pantallas móviles.
- **Cuadrícula de Pedidos:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` con separación consistente de 16px (`gap-4`).
- **Ritmo Espacial:** Escala modular basada en múltiplos de 4px y 8px (8px entre textos relacionados, 16px de padding interno en tarjetas, 24px entre módulos).

## Elevation & Depth

La interfaz adopta un modelo plano estratificado (*Flat Tonal Layering*) donde la jerarquía se establece mediante bordes precisos (`1px solid #e2e8f0`) y variaciones sutiles de luminosidad entre el lienzo (`#f8fafc`) y la superficie de trabajo (`#ffffff`).

### Shadow Vocabulary
- **Resting Card** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Profundidad mínima para separar tarjetas del fondo.
- **Interactive Hover** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Respuesta física al pasar el cursor o seleccionar.
- **Modal Elevation** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): Elevación máxima para diálogos, reforzada con oscurecimiento posterior (`bg-slate-900/50 backdrop-blur-sm`).

### Named Rules
**The Border-Before-Shadow Rule.** Ningún contenedor depende exclusivamente de una sombra para definir sus límites. Toda superficie lleva un borde perimetral en `#e2e8f0` para conservar nitidez en pantallas de bajo contraste.

## Shapes

- **Radio Estándar Interactivo:** 8px (`rounded-lg`) para botones, campos de entrada y selectores.
- **Radio de Contenedor:** 12px (`rounded-xl`) para tarjetas de pedido, paneles de KPIs y módulos informativos.
- **Radio de Diálogo:** 16px (`rounded-2xl`) para modales de creación y detalle.
- **Pastillas Semánticas:** 9999px (`rounded-full`) para estados de pedido y etiquetas de rol.

## Components

### Buttons
- **Shape:** Rectangular con esquinas suavizadas (8px).
- **Primary:** Fondo `#2563eb`, texto blanco `#ffffff`, padding `8px 16px`, tipografía semibold 14px.
- **Hover / Focus:** Transición a `#1d4ed8` con micro-escala en click (`active:scale-95`). Foco visible mediante anillo perimetral azul de 2px.
- **Quick Action (Despacho):** Botones contextuales integrados en tarjeta con fondo pastel según el estado siguiente (`bg-blue-50`, `bg-purple-50`, `bg-emerald-600`).

### Cards / Containers
- **Corner Style:** 12px de radio.
- **Background:** Blanco puro `#ffffff`.
- **Border:** 1px en `#e2e8f0`. Si el pedido está atrasado, el borde conmuta a `#fcd34d` (ámbar) o `#fca5a5` (rojo si es incidencia).
- **Padding:** 16px uniforme.

### Inputs / Fields
- **Style:** Fondo `#ffffff`, borde 1px en `#cbd5e1`, radio 8px, padding `8px 12px`.
- **Focus:** Anillo de 2px en azul `#3b82f6` sin desplazamiento de layout.
- **Label:** Tipografía 12px en `#334155` con asterisco rojo de obligatoriedad en campos críticos.

### Status Badges
- **Style:** Píldora redondeada (`rounded-full`), tipografía semibold 12px, padding `2px 10px`.
- **Regla:** Texto oscuro sobre fondo tonal de alta saturación para garantizar lectura inmediata a distancia.

## Do's and Don'ts

### Do:
- **Do** validar todos los campos obligatorios al crear un pedido (cliente, teléfono, repuesto, ubicación, fecha compromiso).
- **Do** utilizar tipografía monoespaciada para códigos `PED-2026-XXX`.
- **Do** proporcionar enlaces directos `tel:` para que el repartidor llame al cliente con un solo toque.
- **Do** registrar quién realizó cada cambio de estado en el registro de auditoría.
- **Do** mantener el tiempo de carga de formularios por debajo de 45 segundos.

### Don't:
- **Don't** utilizar fondos degradados o colores violetas/neón en encabezados y botones.
- **Don't** permitir que un pedido pase a estado «Entregado» si tiene una incidencia abierta sin resolver.
- **Don't** ocultar la dirección completa o las notas de entrega en tarjetas de despacho.
- **Don't** agregar pasos innecesarios ni confirmaciones dobles para avances de estado habituales.
- **Don't** duplicar ni editar inventarios de repuestos desde esta aplicación.
