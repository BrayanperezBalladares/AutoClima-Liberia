'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Incident, OrderStatus } from '@/lib/types';

interface ResolveIncidentModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onIncidentResolved: (updatedIncident: Incident) => void;
}

export function ResolveIncidentModal({
  incident,
  isOpen,
  onClose,
  onIncidentResolved,
}: ResolveIncidentModalProps) {
  const { currentUser } = useAuth();
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [nextStatus, setNextStatus] = useState<OrderStatus>('pendiente');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resolutionNotes.trim()) {
      setError('Especifique la resolución acordada para cerrar esta incidencia.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/incidents/${incident.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved_by: currentUser?.id || 'usr-jefa',
          resolution_notes: resolutionNotes.trim(),
          next_order_status: nextStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al resolver la incidencia');
      }

      const updated = await res.json();
      onIncidentResolved(updated);
      setResolutionNotes('');
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
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Resolver Incidencia</h2>
            <p className="text-xs text-slate-500">
              Pedido: {incident.order_number} — {incident.customer_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
            <span className="font-bold text-amber-900">Motivo reportado: {incident.reason}</span>
            <p className="text-amber-800">{incident.details}</p>
            <p className="text-slate-500 text-xs">Reportado por: {incident.reporter_name}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Acuerdo / Resolución <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Se coordinó cambio de repuesto en tienda y se reenvía en el siguiente viaje de reparto."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nuevo estado del pedido
            </label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="pendiente">Reabrir como Pendiente (nueva preparación)</option>
              <option value="preparado">Listo para Reparto (Preparado)</option>
              <option value="en_ruta">Volver a poner En Ruta</option>
              <option value="entregado">Cerrar como Entregado / Resuelto</option>
            </select>
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
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar Resolución'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
