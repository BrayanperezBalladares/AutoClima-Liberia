export type UserRole = 'jefa' | 'vendedor' | 'repartidor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  created_at: string;
}

export type OrderStatus = 'pendiente' | 'preparado' | 'en_ruta' | 'entregado' | 'incidencia';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  parts_description: string;
  delivery_location: string;
  delivery_notes?: string;
  status: OrderStatus;
  seller_id: string;
  seller_name?: string;
  courier_id?: string;
  courier_name?: string;
  promised_date: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface OrderLog {
  id: string;
  order_id: string;
  user_id: string;
  user_name?: string;
  previous_status?: OrderStatus;
  new_status: OrderStatus;
  comment?: string;
  created_at: string;
}

export type IncidentResolutionStatus = 'pendiente' | 'en_revision' | 'resuelto';

export interface Incident {
  id: string;
  order_id: string;
  order_number?: string;
  customer_name?: string;
  reported_by: string;
  reporter_name?: string;
  reason: string;
  details: string;
  resolution_status: IncidentResolutionStatus;
  resolution_notes?: string;
  resolved_by?: string;
  resolver_name?: string;
  created_at: string;
  resolved_at?: string;
}

export interface DashboardMetrics {
  totalOrdersToday: number;
  pendingOrders: number;
  inRouteOrders: number;
  deliveredOrdersToday: number;
  overdueOrders: number;
  openIncidents: number;
  completedFieldsRate: number; // Percentage
  statusUpdatedRate: number; // Percentage
}
