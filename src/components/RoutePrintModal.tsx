'use client';

import React, { useState, useMemo } from 'react';
import { Order, User } from '@/lib/types';
import { Printer, X, Truck, Calendar, MapPin, Package, AlertCircle } from 'lucide-react';

interface RoutePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  users: User[];
  currentUserName?: string;
}

export function RoutePrintModal({
  isOpen,
  onClose,
  orders,
  users,
  currentUserName,
}: RoutePrintModalProps) {
  // Filtros internos de la hoja de ruta
  const [filterMode, setFilterMode] = useState<'active_only' | 'all_today'>('active_only');
  const [selectedCourierId, setSelectedCourierId] = useState<string>(() => {
    const courier = users.find(u => u.role === 'repartidor');
    return courier?.id || 'usr-ronny';
  });

  // Repartidores disponibles
  const couriers = useMemo(() => users.filter(u => u.role === 'repartidor'), [users]);
  const activeCourier = useMemo(() => {
    return users.find(u => u.id === selectedCourierId) || couriers[0] || { name: 'Ronny Salas (Repartidor)' };
  }, [users, selectedCourierId, couriers]);

  // Filtrado de pedidos a imprimir
  const printableOrders = useMemo(() => {
    return orders.filter(o => {
      if (filterMode === 'active_only') {
        // En preparación, en ruta y pendientes de despacho
        return o.status === 'preparado' || o.status === 'en_ruta' || o.status === 'pendiente';
      }
      // Todos los pedidos que no hayan sido completados o devueltos
      return o.status !== 'entregado';
    });
  }, [orders, filterMode]);

  // Fecha actual formateada para Costa Rica
  const todayFormatted = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(now);
  }, []);

  const timeFormatted = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-modal-backdrop print:static print:inset-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block print:w-full printable-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 my-4 sm:my-8 overflow-hidden animate-modal-box flex flex-col max-h-[92vh] print:static print:border-none print:shadow-none print:m-0 print:p-0 print:max-h-none print:w-full print:block print:rounded-none printable-modal-card">
        
        {/* Barra de Control Superior (Solo Pantalla - Se oculta al imprimir) */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 no-print print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Hoja de Ruta de Despacho (Imprimible)</span>
                <span className="text-xs font-semibold bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Sucursal Liberia
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Documento físico de control para el repartidor ante contingencias o zonas sin señal en Guanacaste
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Selector de alcance */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('active_only')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'active_only'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                En Ruta / Preparados ({orders.filter(o => o.status === 'preparado' || o.status === 'en_ruta' || o.status === 'pendiente').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all_today')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'all_today'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Todos Activos ({orders.filter(o => o.status !== 'entregado').length})
              </button>
            </div>

            {/* Selector de Repartidor */}
            {couriers.length > 1 && (
              <select
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {couriers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Botón Imprimir */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Hoja (Ctrl+P)</span>
            </button>

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              aria-label="Cerrar vista de impresión"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Visualización y Documento Imprimible */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-100 flex-1 print:p-0 print:m-0 print:bg-transparent print:overflow-visible print:block printable-scroll-area">
          
          <div
            id="printable-dispatch-sheet"
            className="bg-white p-5 sm:p-7 rounded-xl border border-slate-300 shadow-md max-w-4xl mx-auto text-slate-900 print:p-0 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none"
          >
            {/* Encabezado Corporativo Oficial */}
            <div className="border-b-2 border-slate-900 pb-3 mb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/img/logo.jpeg"
                    alt="Auto Clima Logo"
                    className="h-11 w-auto object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.jpeg';
                    }}
                  />
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                      Auto Clima S.A.
                    </h1>
                    <p className="text-xs font-semibold text-slate-700">
                      Sucursal Liberia, Guanacaste • Repuestos y Climatización Automotriz
                    </p>
                    <p className="text-xs text-slate-500">
                      Tel: 2666-0000 / 8333-4455 • Horario: L-V 7:30 a.m. a 5:30 p.m. | Sábados 8:00 a.m. a 1:00 p.m.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block border border-slate-900 bg-slate-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded">
                    HOJA DE RUTA N° HR-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}{String(new Date().getDate()).padStart(2, '0')}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 capitalize">
                    {todayFormatted} • {timeFormatted}
                  </p>
                </div>
              </div>
            </div>

            {/* Franja de Control y Datos de Ruta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg mb-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block uppercase">Repartidor Asignado</span>
                <span className="font-bold text-slate-900">{activeCourier.name}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase">Ruta / Cuadrante</span>
                <span className="font-bold text-slate-900">Liberia Centro y Alrededores</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase">Unidades a Entregar</span>
                <span className="font-bold text-slate-900">{printableOrders.length} envíos programados</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase">Generado Por</span>
                <span className="font-bold text-slate-900">{currentUserName || 'Sistema Auto Clima'}</span>
              </div>
            </div>

            {/* Tabla Principal de Envíos */}
            {printableOrders.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg my-4">
                <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No hay pedidos pendientes de entrega en este momento</p>
                <p className="text-xs text-slate-500">Todos los pedidos han sido entregados o no hay órdenes en preparación.</p>
              </div>
            ) : (
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                      <th className="p-1.5 border-r border-slate-400 w-10 text-center">N°</th>
                      <th className="p-1.5 border-r border-slate-400 w-28">Pedido & Hora</th>
                      <th className="p-1.5 border-r border-slate-400 w-44">Cliente & Teléfono</th>
                      <th className="p-1.5 border-r border-slate-400">Dirección y Señas de Entrega</th>
                      <th className="p-1.5 border-r border-slate-400 w-48">Repuestos a Entregar</th>
                      <th className="p-1.5 w-44 text-center">Recepción (Firma y Cédula)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {printableOrders.map((order, idx) => {
                      const promisedTime = new Date(order.promised_date).toLocaleTimeString('es-CR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <tr key={order.id} className="align-top hover:bg-slate-50/50 print-avoid-break">
                          {/* N° correlativo */}
                          <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600 bg-slate-50/50">
                            {idx + 1}
                          </td>

                          {/* Código y Hora */}
                          <td className="p-1.5 border-r border-slate-300">
                            <span className="font-mono font-bold text-slate-900 block">{order.order_number}</span>
                            <span className="text-xs text-amber-900 font-semibold bg-amber-50 px-1 py-0.2 rounded border border-amber-200 inline-block mt-0.5">
                              Comp: {promisedTime}
                            </span>
                            <span className="text-xs text-slate-500 block mt-0.5">
                              Vende: {order.seller_name?.split(' ')[0] || 'Mostrador'}
                            </span>
                          </td>

                          {/* Cliente */}
                          <td className="p-1.5 border-r border-slate-300">
                            <span className="font-bold text-slate-900 block">{order.customer_name}</span>
                            <span className="text-slate-700 block font-mono text-xs mt-0.5">
                              ☎ {order.customer_phone}
                            </span>
                          </td>

                          {/* Dirección / Señas */}
                          <td className="p-1.5 border-r border-slate-300">
                            <span className="text-slate-900 font-medium block leading-tight">{order.delivery_location}</span>
                            {order.delivery_notes && (
                              <span className="text-xs text-slate-600 italic block mt-0.5 bg-slate-50 p-1 rounded border border-slate-200">
                                Ref: {order.delivery_notes}
                              </span>
                            )}
                          </td>

                          {/* Repuestos */}
                          <td className="p-1.5 border-r border-slate-300">
                            <span className="text-slate-900 font-medium leading-snug block">
                              {order.parts_description}
                            </span>
                          </td>

                          {/* Espacio para Firma de Recepción Física (Compacto para Hoja de Ruta) */}
                          <td className="p-1.5 bg-slate-50/30">
                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="border-b border-dashed border-slate-400 pb-1 pt-1">
                                <span className="text-slate-400 text-xs">Firma:</span>
                              </div>
                              <div className="border-b border-dashed border-slate-400 pb-0.5 flex items-center justify-between">
                                <span className="text-slate-400 text-xs">Céd:</span>
                                <span className="text-slate-400 text-xs">Hora: ____:____</span>
                              </div>
                              <div className="text-right text-slate-400 text-xs">
                                <span>[ ] Conforme</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Protocolo Operativo de Emergencia */}
            <div className="p-2 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 mb-4 leading-tight print-avoid-break">
              <strong>PROTOCOLO EN RUTA / CONTINGENCIA:</strong> Si el cliente está ausente, taller cerrado, repuesto erróneo o rechazo de compra, 
              <strong> NO dejar la mercadería</strong>. Notificar de inmediato a Sucursal Liberia vía teléfono y registrar la incidencia en el sistema al retorno. Todo paquete entregado debe contar con firma y número de cédula legible.
            </div>

            {/* Cuadro de Firmas de Control y Custodia */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-900 text-center text-xs print-avoid-break">
              <div>
                <div className="border-b border-slate-900 h-8 mb-1"></div>
                <p className="font-bold text-slate-900">Despacho en Mostrador</p>
                <p className="text-xs text-slate-500">Firma Vendedor / Almacén</p>
              </div>

              <div>
                <div className="border-b border-slate-900 h-8 mb-1"></div>
                <p className="font-bold text-slate-900">Recepción para Ruta</p>
                <p className="text-xs text-slate-500">{activeCourier.name}</p>
              </div>

              <div>
                <div className="border-b border-slate-900 h-8 mb-1"></div>
                <p className="font-bold text-slate-900">Cierre & Liquidación</p>
                <p className="text-xs text-slate-500">V°B° Jefatura (Dra. Marcela)</p>
              </div>
            </div>

            {/* Pie de Página */}
            <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 print-avoid-break">
              <span>Auto Clima Sucursal Liberia • Sistema de Trazabilidad Interno</span>
              <span>Documento para uso operativo interno de distribución</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
