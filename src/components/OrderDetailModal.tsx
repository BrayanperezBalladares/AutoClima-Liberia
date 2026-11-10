'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Clock, CheckCircle2, Truck, AlertTriangle, User, MapPin, Phone, Calendar, ArrowRight, ShieldAlert, Navigation, ExternalLink } from 'lucide-react';
import { Order, OrderLog, OrderStatus } from '@/lib/types';

interface OrderDetailModalProps {
  orderId: string | null;
  onClose: () => void;
  onStatusUpdated: (updatedOrder: Order) => void;
  onOpenReportIncident: (order: Order) => void;
}

export function OrderDetailModal({
  orderId,
  onClose,
  onStatusUpdated,
  onOpenReportIncident,
}: OrderDetailModalProps) {
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data.order);
        setLogs(data.logs || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order || !currentUser) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          user_id: currentUser.id,
          comment: comment.trim() || undefined,
          courier_id: currentUser.role === 'repartidor' ? currentUser.id : undefined,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar estado');
      const updated = await res.json();
      setOrder(updated);
      onStatusUpdated(updated);
      setComment('');

      // Recargar logs
      const logsRes = await fetch(`/api/orders/${order.id}`);
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">Pendiente</span>;
      case 'preparado':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Preparado en Tienda</span>;
      case 'en_ruta':
        return <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">En Ruta de Entrega</span>;
      case 'entregado':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Entregado con Éxito</span>;
      case 'incidencia':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Con Incidencia / Retorno</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-modal-box">
        
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center p-0.5 shadow-sm">
              <img
                src="/img/logo.jpeg"
                alt="Auto Clima"
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpeg'; }}
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PEDIDO</span>
              <h2 className="text-lg font-bold text-slate-900">{order?.order_number || 'Cargando...'}</h2>
            </div>
            {order && getStatusBadge(order.status)}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !order ? (
          <div className="p-8 text-center text-slate-500 text-sm">Cargando información del pedido...</div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Información Principal en Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-slate-800">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <a href={`tel:${order.customer_phone}`} className="text-blue-700 hover:underline font-bold">
                    {order.customer_phone}
                  </a>
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{order.delivery_location}</span>
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(order.delivery_location + ', Liberia, Guanacaste, Costa Rica')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 rounded-lg text-xs font-bold transition-colors min-h-[36px]"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Abrir en Waze
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_location + ', Liberia, Guanacaste, Costa Rica')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors min-h-[36px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Maps
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Compromiso: <strong className="text-slate-900 font-bold">{new Date(order.promised_date).toLocaleString('es-CR')}</strong></span>
                </div>
                <div className="text-xs text-slate-600">
                  Vendedor: <span className="font-semibold text-slate-800">{order.seller_name || 'Ventas'}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Repartidor: <span className="font-semibold text-slate-800">{order.courier_name || 'Sin asignar'}</span>
                </div>
              </div>
            </div>

            {/* Repuestos Solicitados */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Repuestos Solicitados</h3>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-sm text-slate-900 font-medium whitespace-pre-wrap">
                {order.parts_description}
              </div>
              {order.delivery_notes && (
                <p className="mt-2 text-xs text-slate-600 italic">
                  Notas: {order.delivery_notes}
                </p>
              )}
            </div>

            {/* Acciones de Transición de Estado */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Actualizar Estado de Entrega
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {order.status === 'pendiente' && (
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus('preparado')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all min-h-[40px]"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Marcar Preparado en Tienda
                  </button>
                )}

                {(order.status === 'pendiente' || order.status === 'preparado') && (
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus('en_ruta')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all min-h-[40px]"
                  >
                    <Truck className="w-4 h-4" /> Iniciar Ruta de Reparto
                  </button>
                )}

                {order.status === 'en_ruta' && (
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus('entregado')}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-sm transition-all min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirmar Entrega Realizada
                  </button>
                )}

                {order.status !== 'incidencia' && (
                  <button
                    disabled={updating}
                    onClick={() => {
                      onOpenReportIncident(order);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-semibold transition-all ml-auto min-h-[36px]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Reportar Incidencia / Retorno
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Comentario opcional para el registro de auditoría (ej: entrega recibida por Don Carlos)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Historial de Auditoría (Trazabilidad) */}
            <div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Historial de Trazabilidad y Cambios
              </h3>
              <div className="space-y-2 border-l-2 border-slate-200 ml-3 pl-4">
                {logs.map((log) => (
                  <div key={log.id} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{log.user_name || 'Colaborador'}</span>
                      <span className="text-slate-400 text-xs">
                        {new Date(log.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      Estado: <strong className="text-slate-800">{log.new_status}</strong>
                      {log.comment && <span className="text-slate-500"> — {log.comment}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
