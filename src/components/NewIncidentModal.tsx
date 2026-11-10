'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldAlert, AlertCircle } from 'lucide-react';
import { Order, Incident } from '@/lib/types';

interface NewIncidentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated: (incident: Incident) => void;
}

export function NewIncidentModal({
  order,
  isOpen,
  onClose,
  onIncidentCreated,
}: NewIncidentModalProps) {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('Cliente ausente / local cerrado');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!details.trim()) {
      setError('Por favor describa el detalle de lo ocurrido para el informe.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          reported_by: currentUser?.id || 'usr-bryan',
          reason,
          details: details.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al registrar incidencia');
      }

      const created = await res.json();
      onIncidentCreated(created);
      setDetails('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-rose-200 animate-modal-box">
        
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Reportar Incidencia o Devolución</h2>
              <p className="text-xs text-rose-600">Pedido: {order.order_number} — {order.customer_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo de la Incidencia / Devolución <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="Cliente ausente / local cerrado">Cliente ausente / local cerrado</option>
              <option value="Repuesto no coincide o no es compatible">Repuesto no coincide o no es compatible</option>
              <option value="Dirección no encontrada o inaccesible">Dirección no encontrada o inaccesible</option>
              <option value="Devolución por solicitud del cliente / garantía">Devolución por solicitud del cliente / garantía</option>
              <option value="Cancelación de pedido por atraso">Cancelación de pedido por atraso</option>
              <option value="Otro motivo operativo">Otro motivo operativo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detalle y Observaciones del Retorno <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explique qué ocurrió, con quién se conversó y si el repuesto regresa a la tienda..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
            <strong>Flujo inverso acordado:</strong> Al registrar la incidencia, el pedido pasará a estado de alerta y el repuesto debe ser entregado en mostrador para revisión con la jefa de tienda.
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Incidencia'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
