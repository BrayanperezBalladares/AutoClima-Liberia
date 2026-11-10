import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import type { User, Order, OrderLog, Incident, DashboardMetrics, OrderStatus } from './types';

const DB_PATH = path.join(process.cwd(), 'autoclima.db');

let _db: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (_db) return _db;

  _db = new DatabaseSync(DB_PATH);
  _db.exec('PRAGMA journal_mode = WAL;');
  _db.exec('PRAGMA foreign_keys = ON;');

  initSchema(_db);
  seedInitialData(_db);

  return _db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('jefa', 'vendedor', 'repartidor')),
      pin TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      parts_description TEXT NOT NULL,
      delivery_location TEXT NOT NULL,
      delivery_notes TEXT,
      status TEXT NOT NULL CHECK(status IN ('pendiente', 'preparado', 'en_ruta', 'entregado', 'incidencia')),
      seller_id TEXT NOT NULL REFERENCES users(id),
      courier_id TEXT REFERENCES users(id),
      promised_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS order_logs (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      previous_status TEXT,
      new_status TEXT NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      reported_by TEXT NOT NULL REFERENCES users(id),
      reason TEXT NOT NULL,
      details TEXT NOT NULL,
      resolution_status TEXT NOT NULL CHECK(resolution_status IN ('pendiente', 'en_revision', 'resuelto')),
      resolution_notes TEXT,
      resolved_by TEXT REFERENCES users(id),
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );
  `);
}

function seedInitialData(db: DatabaseSync) {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const now = new Date().toISOString();

  // Equipo del proyecto Auto Clima - Sucursal Liberia
  const users = [
    { id: 'usr-jefa', name: 'Dra. Marcela (Jefa de Tienda)', role: 'jefa', pin: '1234' },
    { id: 'usr-bryan', name: 'Bryan Pérez (Vendedor)', role: 'vendedor', pin: '1111' },
    { id: 'usr-jorge', name: 'Jorge Goluboay (Vendedor)', role: 'vendedor', pin: '2222' },
    { id: 'usr-dauren', name: 'Dauren Matarrita (Vendedora)', role: 'vendedor', pin: '3333' },
    { id: 'usr-estefany', name: 'Estefany Durán (Vendedora)', role: 'vendedor', pin: '4444' },
    { id: 'usr-ronny', name: 'Ronny Salas (Repartidor)', role: 'repartidor', pin: '5555' },
  ];

  const insertUser = db.prepare('INSERT INTO users (id, name, role, pin, created_at) VALUES (?, ?, ?, ?, ?)');
  for (const u of users) {
    insertUser.run(u.id, u.name, u.role, u.pin, now);
  }

  // Pedidos de prueba para el flujo inicial
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_phone, parts_description,
      delivery_location, delivery_notes, status, seller_id, courier_id,
      promised_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleOrders = [
    {
      id: 'ord-101',
      order_number: 'PED-2026-001',
      customer_name: 'Taller El Pique (Carlos Mora)',
      customer_phone: '8844-1234',
      parts_description: 'Compresor Sanden 508 R134a + Filtro Deshidratador',
      delivery_location: 'Barrio Condega, 200m Norte de la Escuela, Liberia',
      delivery_notes: 'Recibe mecánico Jonathan en el portón lateral',
      status: 'pendiente',
      seller_id: 'usr-bryan',
      courier_id: null,
      promised_date: new Date(Date.now() + 3600000 * 2).toISOString(),
    },
    {
      id: 'ord-102',
      order_number: 'PED-2026-002',
      customer_name: 'Autoservicio Guanacaste (Elena Solano)',
      customer_phone: '8711-5678',
      parts_description: 'Evaporador universal 12V + Válvula de expansión',
      delivery_location: 'Frente al Estadio Edgardo Baltodano, Liberia',
      delivery_notes: 'Factura electrónica #9822',
      status: 'preparado',
      seller_id: 'usr-jorge',
      courier_id: 'usr-ronny',
      promised_date: new Date(Date.now() + 3600000 * 3).toISOString(),
    },
    {
      id: 'ord-103',
      order_number: 'PED-2026-003',
      customer_name: 'Electroauto del Norte',
      customer_phone: '6020-9988',
      parts_description: 'Condensador para Toyota Hilux 2021 + 2 latas R134a',
      delivery_location: 'Salida a Guardia, 1km después del cruce, Taller Blanco',
      delivery_notes: 'Urge entrega antes del mediodía',
      status: 'en_ruta',
      seller_id: 'usr-dauren',
      courier_id: 'usr-ronny',
      promised_date: new Date(Date.now() + 3600000).toISOString(),
    },
  ];

  for (const o of sampleOrders) {
    insertOrder.run(
      o.id,
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.parts_description,
      o.delivery_location,
      o.delivery_notes,
      o.status,
      o.seller_id,
      o.courier_id,
      o.promised_date,
      now,
      now
    );

    db.prepare(`
      INSERT INTO order_logs (id, order_id, user_id, previous_status, new_status, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`log-${o.id}-init`, o.id, o.seller_id, null, o.status, 'Registro inicial del pedido', now);
  }
}

// Data Access Methods
export function getAllUsers(): User[] {
  const db = getDatabase();
  return db.prepare('SELECT id, name, role, pin, created_at FROM users ORDER BY name ASC').all() as unknown as User[];
}

export function getUserById(id: string): User | null {
  const db = getDatabase();
  const row = db.prepare('SELECT id, name, role, pin, created_at FROM users WHERE id = ?').get(id);
  return (row as unknown as User) || null;
}

export function getAllOrders(): Order[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT 
      o.*, 
      s.name as seller_name, 
      c.name as courier_name
    FROM orders o
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN users c ON o.courier_id = c.id
    ORDER BY o.created_at DESC
  `).all();
  return rows as unknown as Order[];
}

export function getOrderById(id: string): Order | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT 
      o.*, 
      s.name as seller_name, 
      c.name as courier_name
    FROM orders o
    LEFT JOIN users s ON o.seller_id = s.id
    LEFT JOIN users c ON o.courier_id = c.id
    WHERE o.id = ? OR o.order_number = ?
  `).get(id, id);
  return (row as unknown as Order) || null;
}

export function getOrderLogs(orderId: string): OrderLog[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT l.*, u.name as user_name
    FROM order_logs l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.order_id = ?
    ORDER BY l.created_at ASC
  `).all(orderId);
  return rows as unknown as OrderLog[];
}

export function createOrder(data: {
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  parts_description: string;
  delivery_location: string;
  delivery_notes?: string;
  seller_id: string;
  promised_date: string;
}): Order {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = 'ord-' + Date.now();

  // Generar número consecutivo si no se especifica
  let orderNumber = data.order_number?.trim();
  if (!orderNumber) {
    const totalCount = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
    const nextSeq = String(totalCount.count + 1).padStart(3, '0');
    orderNumber = `PED-2026-${nextSeq}`;
  }

  db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_phone, parts_description,
      delivery_location, delivery_notes, status, seller_id, courier_id,
      promised_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, NULL, ?, ?, ?)
  `).run(
    id,
    orderNumber,
    data.customer_name.trim(),
    data.customer_phone.trim(),
    data.parts_description.trim(),
    data.delivery_location.trim(),
    data.delivery_notes?.trim() || null,
    data.seller_id,
    data.promised_date,
    now,
    now
  );

  db.prepare(`
    INSERT INTO order_logs (id, order_id, user_id, previous_status, new_status, comment, created_at)
    VALUES (?, ?, ?, NULL, 'pendiente', 'Pedido registrado por el vendedor', ?)
  `).run(`log-${id}-created`, id, data.seller_id, now);

  return getOrderById(id)!;
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  userId: string,
  comment?: string,
  courierId?: string
): Order {
  const db = getDatabase();
  const current = getOrderById(orderId);
  if (!current) throw new Error('Pedido no encontrado');

  const now = new Date().toISOString();
  const completedAt = (newStatus === 'entregado' ? now : current.completed_at) ?? null;
  const assignedCourier = courierId ?? current.courier_id ?? null;

  db.prepare(`
    UPDATE orders 
    SET status = ?, courier_id = ?, updated_at = ?, completed_at = ?
    WHERE id = ?
  `).run(newStatus, assignedCourier, now, completedAt, orderId);

  const logId = 'log-' + Date.now();
  db.prepare(`
    INSERT INTO order_logs (id, order_id, user_id, previous_status, new_status, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(logId, orderId, userId, current.status, newStatus, comment || null, now);

  return getOrderById(orderId)!;
}

export function createIncident(data: {
  order_id: string;
  reported_by: string;
  reason: string;
  details: string;
}): Incident {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = 'inc-' + Date.now();

  db.prepare(`
    INSERT INTO incidents (
      id, order_id, reported_by, reason, details,
      resolution_status, created_at
    ) VALUES (?, ?, ?, ?, ?, 'pendiente', ?)
  `).run(id, data.order_id, data.reported_by, data.reason, data.details, now);

  // Marcar estado del pedido como incidencia
  updateOrderStatus(
    data.order_id,
    'incidencia',
    data.reported_by,
    `Incidencia reportada: ${data.reason}. ${data.details}`
  );

  return getIncidentById(id)!;
}

export function getIncidentById(id: string): Incident | null {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT 
      i.*,
      o.order_number,
      o.customer_name,
      u.name as reporter_name,
      r.name as resolver_name
    FROM incidents i
    JOIN orders o ON i.order_id = o.id
    JOIN users u ON i.reported_by = u.id
    LEFT JOIN users r ON i.resolved_by = r.id
    WHERE i.id = ?
  `).get(id);
  return (row as unknown as Incident) || null;
}

export function getAllIncidents(): Incident[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT 
      i.*,
      o.order_number,
      o.customer_name,
      u.name as reporter_name,
      r.name as resolver_name
    FROM incidents i
    JOIN orders o ON i.order_id = o.id
    JOIN users u ON i.reported_by = u.id
    LEFT JOIN users r ON i.resolved_by = r.id
    ORDER BY i.created_at DESC
  `).all();
  return rows as unknown as Incident[];
}

export function resolveIncident(
  incidentId: string,
  resolvedBy: string,
  resolutionNotes: string,
  nextOrderStatus?: OrderStatus
): Incident {
  const db = getDatabase();
  const now = new Date().toISOString();

  const incident = getIncidentById(incidentId);
  if (!incident) throw new Error('Incidencia no encontrada');

  db.prepare(`
    UPDATE incidents 
    SET resolution_status = 'resuelto', resolution_notes = ?, resolved_by = ?, resolved_at = ?
    WHERE id = ?
  `).run(resolutionNotes, resolvedBy, now, incidentId);

  if (nextOrderStatus) {
    updateOrderStatus(
      incident.order_id,
      nextOrderStatus,
      resolvedBy,
      `Resolución de incidencia: ${resolutionNotes}`
    );
  }

  return getIncidentById(incidentId)!;
}

export function getDashboardMetrics(): DashboardMetrics {
  const db = getDatabase();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const allOrders = getAllOrders();
  const incidents = getAllIncidents();

  const totalOrdersToday = allOrders.filter(o => o.created_at >= todayStart).length;
  const pendingOrders = allOrders.filter(o => o.status === 'pendiente' || o.status === 'preparado').length;
  const inRouteOrders = allOrders.filter(o => o.status === 'en_ruta').length;
  const deliveredOrdersToday = allOrders.filter(o => o.status === 'entregado' && (o.completed_at || o.updated_at) >= todayStart).length;

  const overdueOrders = allOrders.filter(o => {
    if (o.status === 'entregado') return false;
    return new Date(o.promised_date).getTime() < now.getTime();
  }).length;

  const openIncidents = incidents.filter(i => i.resolution_status !== 'resuelto').length;

  // Calidad de datos (KPIs del Taller I)
  const total = allOrders.length || 1;
  const completeFieldsOrders = allOrders.filter(o => 
    Boolean(o.order_number && o.customer_name && o.customer_phone && o.parts_description && o.delivery_location && o.promised_date)
  ).length;

  const completedFieldsRate = Math.round((completeFieldsOrders / total) * 100);
  const statusUpdatedRate = Math.round(((total - allOrders.filter(o => o.status === 'pendiente').length) / total) * 100);

  return {
    totalOrdersToday,
    pendingOrders,
    inRouteOrders,
    deliveredOrdersToday,
    overdueOrders,
    openIncidents,
    completedFieldsRate,
    statusUpdatedRate,
  };
}
