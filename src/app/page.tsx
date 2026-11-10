'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { NewOrderModal } from '@/components/NewOrderModal';
import { OrderDetailModal } from '@/components/OrderDetailModal';
import { NewIncidentModal } from '@/components/NewIncidentModal';
import { ResolveIncidentModal } from '@/components/ResolveIncidentModal';
import { RoutePrintModal } from '@/components/RoutePrintModal';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { Order, Incident, DashboardMetrics, OrderStatus } from '@/lib/types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  MapPin,
  Phone,
  Calendar,
  Filter,
  BarChart2,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Printer
} from 'lucide-react';

export default function Home() {
  const { currentUser, users, isJefa, isRepartidor, isVendedor } = useAuth();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'incidencias' | 'metricas' | 'guia'>('pedidos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros de búsqueda
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [incidentOrder, setIncidentOrder] = useState<Order | null>(null);
  const [selectedIncidentToResolve, setSelectedIncidentToResolve] = useState<Incident | null>(null);
  const [isRoutePrintOpen, setIsRoutePrintOpen] = useState(false);

  // Sistema de Notificaciones y Deshacer (Toast & Undo)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atajos de teclado para agilidad en mostrador (Principio: Cero fricción)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);

      if (e.key === 'Escape') {
        setIsNewOrderOpen(false);
        setSelectedOrderId(null);
        setIncidentOrder(null);
        setSelectedIncidentToResolve(null);
        setIsRoutePrintOpen(false);
        return;
      }

      if (!isInput) {
        if ((e.key === 'n' || e.key === 'N') && (isVendedor || isJefa)) {
          e.preventDefault();
          setIsNewOrderOpen(true);
        } else if (e.key === '/') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVendedor, isJefa]);

  // Soporte para abrir directamente la hoja de ruta vía URL (?hoja_ruta=1)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('hoja_ruta')) {
      setIsRoutePrintOpen(true);
    }
  }, []);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, incidentsRes, metricsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/incidents'),
        fetch('/api/metrics'),
      ]);

      const [ordersData, incidentsData, metricsData] = await Promise.all([
        ordersRes.json(),
        incidentsRes.json(),
        metricsRes.json(),
      ]);

      setOrders(ordersData);
      setIncidents(incidentsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Action para Repartidor o Vendedor desde la tarjeta con ventana de Deshacer (Undo)
  const handleQuickAdvance = async (e: React.MouseEvent, order: Order, newStatus: OrderStatus) => {
    e.stopPropagation();
    if (!currentUser) return;

    const previousStatus = order.status;
    const readableStatus: Record<OrderStatus, string> = {
      pendiente: 'Pendiente',
      preparado: 'Preparado',
      en_ruta: 'En Ruta',
      entregado: 'Entregado',
      incidencia: 'Incidencia',
    };

    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          user_id: currentUser.id,
          courier_id: currentUser.role === 'repartidor' ? currentUser.id : undefined,
          comment: `Acción rápida desde tablero: ${readableStatus[newStatus]}`,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al actualizar estado del pedido');
      }

      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      fetchData();

      // Notificación inmediata con botón "Deshacer" (7 segundos de ventana de gracia)
      addToast({
        type: 'info',
        title: `Pedido ${order.order_number} actualizado`,
        description: `Marcado como «${readableStatus[newStatus]}».`,
        duration: 7000,
        onUndo: async () => {
          try {
            const revertRes = await fetch(`/api/orders/${order.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: previousStatus,
                user_id: currentUser.id,
                comment: 'Deshacer acción rápida (Corrección de toque accidental)',
              }),
            });

            if (!revertRes.ok) throw new Error('No se pudo revertir el cambio');
            const reverted = await revertRes.json();
            setOrders(prev => prev.map(o => o.id === reverted.id ? reverted : o));
            fetchData();

            addToast({
              type: 'info',
              title: `Acción deshecha`,
              description: `El pedido volvió a «${readableStatus[previousStatus]}».`,
              duration: 3500,
            });
          } catch (revertErr: any) {
            addToast({
              type: 'error',
              title: 'Error al revertir',
              description: revertErr.message,
            });
          }
        },
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'No se pudo actualizar',
        description: err.message,
      });
    }
  };

  // Filtrado de pedidos
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.parts_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.delivery_location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">Pendiente</span>;
      case 'preparado':
        return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Preparado</span>;
      case 'en_ruta':
        return <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">En Ruta</span>;
      case 'entregado':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Entregado</span>;
      case 'incidencia':
        return <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Incidencia</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className={isRoutePrintOpen ? 'print:hidden' : ''}>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewOrder={() => setIsNewOrderOpen(true)}
        />
      </div>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6 ${isRoutePrintOpen ? 'print:hidden' : ''}`}>
        
        {/* Banner de Métricas Rápidas (KPIs Taller I) */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoy Registrados</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.totalOrdersToday}</span>
                <Package className="w-4 h-4 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-amber-600">{metrics.pendingOrders}</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Ruta (Despacho)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-sky-700">{metrics.inRouteOrders}</span>
                <Truck className="w-4 h-4 text-sky-600" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entregados Hoy</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-emerald-600">{metrics.deliveredOrdersToday}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between ${
              metrics.overdueOrders > 0 ? 'bg-red-50/80 border-red-200' : 'bg-white border-slate-200'
            }`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                metrics.overdueOrders > 0 ? 'text-red-800' : 'text-slate-600'
              }`}>Demorados / Atraso</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-2xl font-bold ${metrics.overdueOrders > 0 ? 'text-red-700' : 'text-slate-700'}`}>
                  {metrics.overdueOrders}
                </span>
                <AlertTriangle className={`w-4 h-4 ${metrics.overdueOrders > 0 ? 'text-red-600' : 'text-slate-500'}`} />
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between ${
              metrics.openIncidents > 0 ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-slate-200'
            }`}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incidencias Abiertas</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-2xl font-bold ${metrics.openIncidents > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                  {metrics.openIncidents}
                </span>
                <AlertCircle className={`w-4 h-4 ${metrics.openIncidents > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: PEDIDOS Y ENTREGAS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            
            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Buscador en vivo con contraste solar y atajo de teclado */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar por cliente, repuesto, orden o lugar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-9 py-2 rounded-lg border border-slate-300 placeholder:text-slate-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-none"
                />
                <span className="hidden sm:inline-flex items-center justify-center absolute right-2.5 top-2 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded border border-slate-200 font-mono leading-none pointer-events-none">
                  /
                </span>
              </div>

              {/* Pastillas de Estado y Acciones Rápidas */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'pendiente', label: 'Pendiente' },
                    { id: 'preparado', label: 'Preparado' },
                    { id: 'en_ruta', label: 'En Ruta' },
                    { id: 'entregado', label: 'Entregado' },
                    { id: 'incidencia', label: 'Incidencia' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        statusFilter === tab.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>

                <button
                  type="button"
                  onClick={() => setIsRoutePrintOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors shadow-none shrink-0"
                  title="Generar e imprimir hoja de ruta de entregas para el repartidor"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Hoja de Ruta</span>
                </button>
              </div>

            </div>

            {/* Listado de Pedidos */}
            {loading ? (
              <div className="bg-white rounded-xl p-8 sm:p-12 text-center text-slate-600 text-sm border border-slate-200 shadow-sm">
                Cargando pedidos de Auto Clima Liberia...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <Package className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800">No se encontraron pedidos</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  No hay pedidos registrados con el filtro seleccionado. Podés registrar uno nuevo con el botón superior.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const isOverdue = order.status !== 'entregado' && new Date(order.promised_date).getTime() < Date.now();

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-150 ease-out hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-3 active:scale-[0.99] ${
                        order.status === 'incidencia'
                          ? 'border-red-300 bg-red-50/20'
                          : isOverdue
                          ? 'border-amber-300'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Cabecera de la tarjeta */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{order.order_number}</span>
                          <div className="flex items-center gap-1.5">
                            {isOverdue && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                                Atrasado
                              </span>
                            )}
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Cliente, Teléfono y Vendedor */}
                        <div className="mb-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="font-bold text-sm text-slate-900 leading-tight text-balance">{order.customer_name}</h4>
                            {order.seller_name && (
                              <span className="text-xs text-slate-600 font-medium shrink-0 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Vende: <strong className="text-slate-800">{order.seller_name.replace(' (Vendedor)', '').replace(' (Vendedora)', '')}</strong>
                              </span>
                            )}
                          </div>
                          <a
                            href={`tel:${order.customer_phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline mt-0.5 font-bold"
                          >
                            <Phone className="w-3 h-3" /> {order.customer_phone}
                          </a>
                        </div>

                        {/* Repuestos Solicitados */}
                        <p className="text-xs text-slate-700 font-medium line-clamp-2 mb-2 leading-relaxed">
                          {order.parts_description}
                        </p>

                        {/* Dirección y Accesos de Navegación (Waze & Maps) */}
                        <div className="flex items-start justify-between gap-2 pt-1 pb-1 text-xs text-slate-700">
                          <div className="flex items-start gap-1.5 min-w-0">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed font-medium">{order.delivery_location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`https://waze.com/ul?q=${encodeURIComponent(order.delivery_location + ', Liberia, Guanacaste, Costa Rica')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir en Waze"
                              className="inline-flex items-center justify-center px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded font-bold text-xs transition-colors duration-100 min-h-[34px] min-w-[50px] border border-sky-300 active:scale-95"
                            >
                              Waze
                            </a>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_location + ', Liberia, Guanacaste, Costa Rica')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir en Google Maps"
                              className="group inline-flex items-center justify-center p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-all duration-100 min-h-[34px] min-w-[34px] border border-slate-300 active:scale-95"
                            >
                              <ArrowUpRight className="w-4 h-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Pie de tarjeta con metadata y botón de avance rápido táctil (48px en móvil) */}
                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 gap-2">
                        <div>
                          <span>Hora compromiso:</span>{' '}
                          <strong className="text-slate-900 font-bold block sm:inline">
                            {new Date(order.promised_date).toLocaleTimeString('es-CR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </strong>
                        </div>

                        {/* Botón de acción rápida según rol con área táctil ampliada (min 48px en móvil) */}
                        {order.status === 'pendiente' && (
                          <button
                            onClick={(e) => handleQuickAdvance(e, order, 'preparado')}
                            className="min-h-[48px] sm:min-h-[40px] px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-95 rounded-lg font-bold text-xs shadow-sm transition-all duration-100 ease-out flex items-center justify-center"
                          >
                            Preparar
                          </button>
                        )}
                        {order.status === 'preparado' && (
                          <button
                            onClick={(e) => handleQuickAdvance(e, order, 'en_ruta')}
                            className="min-h-[48px] sm:min-h-[40px] px-4 py-2 bg-sky-700 text-white hover:bg-sky-800 active:scale-95 rounded-lg font-bold text-xs shadow-sm transition-all duration-100 ease-out flex items-center justify-center"
                          >
                            Ruta
                          </button>
                        )}
                        {order.status === 'en_ruta' && (
                          <button
                            onClick={(e) => handleQuickAdvance(e, order, 'entregado')}
                            className="min-h-[48px] sm:min-h-[40px] px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95 rounded-lg font-bold text-xs shadow-sm transition-all duration-100 ease-out flex items-center justify-center"
                          >
                            Entregar
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* PESTAÑA: INCIDENCIAS Y DEVOLUCIONES */}
        {activeTab === 'incidencias' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Módulo de Incidencias y Flujo Inverso de Devoluciones</h2>
              <p className="text-xs text-slate-500">
                Trazabilidad para repuestos que no pudieron entregarse, devoluciones por garantía o clientes no localizados.
              </p>
            </div>

            {incidents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay incidencias ni devoluciones registradas actualmente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <div key={inc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          {inc.order_number}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{inc.reason}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          inc.resolution_status === 'resuelto'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {inc.resolution_status === 'resuelto' ? 'Resuelto' : 'Pendiente de Resolución'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{inc.details}</p>
                      <div className="text-xs text-slate-400">
                        Cliente: <strong>{inc.customer_name}</strong> • Reportado por: {inc.reporter_name} ({new Date(inc.created_at).toLocaleString('es-CR')})
                      </div>
                      {inc.resolution_notes && (
                        <div className="mt-2 p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-900 border border-emerald-100">
                          <strong>Resolución ({inc.resolver_name}):</strong> {inc.resolution_notes}
                        </div>
                      )}
                    </div>

                    {inc.resolution_status !== 'resuelto' && (isJefa || isVendedor) && (
                      <button
                        onClick={() => setSelectedIncidentToResolve(inc)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-sm transition-all"
                      >
                        Gestionar y Resolver
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: MÉTRICAS Y SUPERVISIÓN (JEFA DE TIENDA) */}
        {activeTab === 'metricas' && metrics && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Panel de Control y Supervisión — Auto Clima Liberia</h2>
                <p className="text-xs text-slate-500">
                  Cumplimiento de indicadores definidos en el Taller I para la fase piloto y operación regular.
                </p>
              </div>

              {/* Indicadores Clave de Desempeño (KPIs) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* KPI 1: Campos Obligatorios */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Tasa de Pedidos con Campos Completos</span>
                    <span className="text-lg font-extrabold text-blue-600">{metrics.completedFieldsRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${metrics.completedFieldsRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Meta provisional del proyecto: <strong className="text-slate-700">≥ 90%</strong>. Previene confusiones sobre el repuesto o la ubicación.
                  </p>
                </div>

                {/* KPI 2: Actualización de Estados */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Tasa de Pedidos con Estado Actualizado</span>
                    <span className="text-lg font-extrabold text-emerald-600">{metrics.statusUpdatedRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${metrics.statusUpdatedRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Meta provisional: <strong className="text-slate-700">≥ 90%</strong>. Asegura visibilidad en tiempo real para ventas y el repartidor.
                  </p>
                </div>

              </div>

              {/* Matriz de Resumen Operativo */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Indicador Operativo</th>
                      <th className="p-3">Resultado Actual</th>
                      <th className="p-3">Meta del Piloto</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-medium">Personal Capacitado en la Herramienta</td>
                      <td className="p-3">5 de 5 colaboradores (100%)</td>
                      <td className="p-3">100%</td>
                      <td className="p-3"><span className="text-emerald-700 font-bold">Cumplido</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Pedidos Registrados con Información Completa</td>
                      <td className="p-3">{metrics.completedFieldsRate}%</td>
                      <td className="p-3">≥ 90%</td>
                      <td className="p-3">
                        <span className={metrics.completedFieldsRate >= 90 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {metrics.completedFieldsRate >= 90 ? 'Conforme' : 'Por Mejorar'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Incidencias y Retornos sin Resolver</td>
                      <td className="p-3">{metrics.openIncidents} abiertas</td>
                      <td className="p-3">0 pendientes al cierre</td>
                      <td className="p-3">
                        <span className={metrics.openIncidents === 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {metrics.openIncidents === 0 ? 'Al día' : 'Requiere Atención'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Entregas Fuera de Plazo (Demoras)</td>
                      <td className="p-3">{metrics.overdueOrders} pedidos</td>
                      <td className="p-3">Minimizar vs línea base</td>
                      <td className="p-3">
                        <span className={metrics.overdueOrders === 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {metrics.overdueOrders === 0 ? 'Óptimo' : 'Seguimiento'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* PESTAÑA: GUÍA OPERATIVA Y CASO ACADÉMICO */}
        {activeTab === 'guia' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-sm text-slate-700">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Guía de Operación — Auto Clima (Sucursal Liberia)
              </h2>
              <p className="text-xs text-slate-500">
                Curso: EIF407 Liderazgo y Organización • Universidad Nacional de Costa Rica
              </p>
            </div>

            {/* Sede Física Auto Clima Liberia */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden border border-slate-300 shadow-sm shrink-0 bg-slate-200">
                <img
                  src="/img/sucursal.jpeg"
                  alt="Instalaciones de Auto Clima Sucursal Liberia"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/sucursal.jpeg';
                  }}
                />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                    Sede Operativa y Almacén
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Liberia, Guanacaste</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Auto Clima — Sucursal Liberia</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Punto neurálgico de venta y despacho de repuestos de climatización automotriz para talleres mecánicos y clientes particulares de la provincia de Guanacaste. Sede física del piloto operativo del curso EIF407 (UNA Campus Nicoya).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-slate-200">
                  <div><strong>Equipo en sitio:</strong> 1 Jefa de Tienda • 3 Vendedores • 1 Repartidor</div>
                  <div><strong>Horario de Despacho:</strong> Lunes a Sábado, 7:00 a.m. – 5:30 p.m.</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-1">1. Jefa de Tienda</h3>
                <p className="text-xs text-slate-700">
                  Lidera la implementación, supervisa pedidos pendientes y atrasados, revisa los indicadores semanales y gestiona la resolución de incidencias complejas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-1">2. Los 3 Vendedores</h3>
                <p className="text-xs text-blue-800">
                  Registran de inmediato los pedidos después de cerrar la venta. Verifican campos obligatorios y consultan el estado para responder consultas de clientes con certeza.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-1">3. Repartidor</h3>
                <p className="text-xs text-emerald-800">
                  Consulta pedidos listos para entrega, verifica dirección y repuesto, actualiza el estado (en ruta / entregado) y reporta cualquier anomalía en el lugar de entrega.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800">Flujo Operativo Paso a Paso:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                <li><strong>Cierre de venta:</strong> El vendedor confirma la compra y registra el pedido de entrega con todos sus datos.</li>
                <li><strong>Preparación:</strong> El pedido se prepara en mostrador y se marca como «Preparado».</li>
                <li><strong>Despacho:</strong> El repartidor toma los repuestos asignados y activa «En Ruta».</li>
                <li><strong>Entrega o Incidencia:</strong> Al entregar al cliente, se confirma «Entregado». Si ocurre algún inconveniente, se reporta de inmediato la incidencia.</li>
              </ol>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Regla de Integración:</strong> Esta herramienta complementa el sistema de inventario existente en las computadoras de la sucursal, resolviendo específicamente la coordinación de despacho sin sustituir inventarios ni crear puestos nuevos.
            </div>

          </div>
        )}

      </main>

      {/* Modales */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={(newOrder) => {
          setOrders(prev => [newOrder, ...prev]);
          fetchData();
        }}
      />

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onStatusUpdated={(updated) => {
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
          fetchData();
        }}
        onOpenReportIncident={(order) => setIncidentOrder(order)}
      />

      <NewIncidentModal
        order={incidentOrder}
        isOpen={Boolean(incidentOrder)}
        onClose={() => setIncidentOrder(null)}
        onIncidentCreated={(newIncident) => {
          setIncidents(prev => [newIncident, ...prev]);
          fetchData();
        }}
      />

      <ResolveIncidentModal
        incident={selectedIncidentToResolve}
        isOpen={Boolean(selectedIncidentToResolve)}
        onClose={() => setSelectedIncidentToResolve(null)}
        onIncidentResolved={(updatedInc) => {
          setIncidents(prev => prev.map(i => i.id === updatedInc.id ? updatedInc : i));
          fetchData();
        }}
      />

      <RoutePrintModal
        isOpen={isRoutePrintOpen}
        onClose={() => setIsRoutePrintOpen(false)}
        orders={orders}
        users={users}
        currentUserName={currentUser?.name}
      />

      {/* Contenedor Flotante de Notificaciones con Deshacer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Pie de página */}
      <footer className={`border-t border-slate-200 bg-white py-4 mt-8 ${isRoutePrintOpen ? 'print:hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Auto Clima — Sucursal Liberia • Sistema de Gestión y Seguimiento de Pedidos y Entregas</span>
          <span>Equipo: Goluboay, Matarrita, Durán, Pérez, Salas • EIF407</span>
        </div>
      </footer>

    </div>
  );
}
