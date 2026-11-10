'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Order } from '@/lib/types';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export function NewOrderModal({ isOpen, onClose, onOrderCreated }: NewOrderModalProps) {
  const { currentUser } = useAuth();

  // Estados del formulario
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partsDescription, setPartsDescription] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [promisedDate, setPromisedDate] = useState(() => {
    // Default: hoy + 3 horas en formato datetime-local
    const d = new Date(Date.now() + 3600000 * 3);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación de campos obligatorios según documento de requerimientos
    if (!customerName.trim()) {
      setError('El nombre del cliente o taller es obligatorio.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('El teléfono del cliente es obligatorio para coordinar la entrega.');
      return;
    }
    if (!partsDescription.trim()) {
      setError('Especifique el repuesto o repuestos solicitados.');
      return;
    }
    if (!deliveryLocation.trim()) {
      setError('La ubicación o señas de entrega en Liberia son obligatorias.');
      return;
    }
    if (!promisedDate) {
      setError('La fecha y hora acordada de entrega es obligatoria.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber.trim() || undefined,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          parts_description: partsDescription.trim(),
          delivery_location: deliveryLocation.trim(),
          delivery_notes: deliveryNotes.trim() || undefined,
          seller_id: currentUser?.id || 'usr-bryan',
          promised_date: new Date(promisedDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el pedido');
      }

      const created = await res.json();
      onOrderCreated(created);

      // Limpiar formulario y cerrar
      setOrderNumber('');
      setCustomerName('');
      setCustomerPhone('');
      setPartsDescription('');
      setDeliveryLocation('');
      setDeliveryNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-modal-box">
        
        {/* Encabezado con Identidad Oficial */}
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
              <h2 className="text-lg font-bold text-slate-900">Registrar Nuevo Pedido</h2>
              <p className="text-xs text-slate-600">
                Registrado por: <span className="font-semibold text-blue-700">{currentUser?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Pedido <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Autogenerado si está vacío"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono del Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 8888-1234"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Cliente o Taller <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Taller Solís / Don Marvin Méndez"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Repuestos de A/C a Entregar <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej: 1 Compresor Denso 10P15C + 1 Filtro deshidratador hembra"
              value={partsDescription}
              onChange={(e) => setPartsDescription(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ubicación / Dirección de Entrega en Liberia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Barrio Los Ángeles, 150m este de Coopeguanacaste"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Fecha y Hora Acordada <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[
                    { label: '+1h', getVal: () => new Date(Date.now() + 3600000 * 1) },
                    { label: '+2h', getVal: () => new Date(Date.now() + 3600000 * 2) },
                    { label: '+4h', getVal: () => new Date(Date.now() + 3600000 * 4) },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const d = preset.getVal();
                        setPromisedDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                      }}
                      className="px-1.5 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="datetime-local"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
                required
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas adicionales / Factura
              </label>
              <input
                type="text"
                placeholder="Ej: Cobrar contra entrega / Portón rojo"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Pedido de Entrega'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
