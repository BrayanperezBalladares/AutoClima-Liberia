'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Package, AlertTriangle, BarChart3, Plus, UserCircle, BookOpen, MapPin, X, Clock, Phone } from 'lucide-react';

interface NavbarProps {
  activeTab: 'pedidos' | 'incidencias' | 'metricas' | 'guia';
  setActiveTab: (tab: 'pedidos' | 'incidencias' | 'metricas' | 'guia') => void;
  onOpenNewOrder: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenNewOrder }: NavbarProps) {
  const { currentUser, users, setCurrentUser, isJefa, isVendedor } = useAuth();
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'jefa':
        return <span className="bg-slate-800 text-slate-100 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">Jefa de Tienda</span>;
      case 'repartidor':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">Repartidor</span>;
      case 'vendedor':
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">Vendedor</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm w-full">
      {/* Nivel 1: Identidad Corporativa y Sesión de Usuario (Siempre visible sin desborde horizontal) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Marca Oficial Auto Clima */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0 flex items-center justify-center p-0.5">
              <img
                src="/img/logo.jpeg"
                alt="Auto Clima"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpeg';
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap">Auto Clima</span>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(true)}
                title="Ver información de la Sucursal Liberia"
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md font-semibold border border-blue-200 whitespace-nowrap transition-colors flex items-center gap-1 active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Sucursal</span> Liberia
              </button>
            </div>
          </div>

          {/* Acciones Globales: Nuevo Pedido y Selector de Usuario (100% visible sin scroll) */}
          <div className="flex items-center gap-3 shrink-0">
            {(isVendedor || isJefa) && (
              <button
                onClick={onOpenNewOrder}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap"
                title="Nuevo Pedido (Atajo: tecla N)"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Nuevo Pedido</span>
                <span className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-xs bg-blue-700/80 text-blue-100 rounded border border-blue-500 font-mono leading-none">
                  N
                </span>
              </button>
            )}

            {/* Selector de Colaborador con Rol */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <UserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 shrink-0" />
              <div className="flex flex-col items-start text-left">
                <select
                  value={currentUser?.id || ''}
                  onChange={(e) => {
                    const u = users.find(usr => usr.id === e.target.value);
                    if (u) setCurrentUser(u);
                  }}
                  className="text-xs font-bold text-slate-800 bg-transparent border-0 cursor-pointer focus:ring-0 pr-5 py-0 focus:outline-none"
                  title="Cambiar usuario activo para pruebas o despacho"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <div className="mt-0.5">{getRoleBadge(currentUser?.role)}</div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Nivel 2: Barra de Módulos Operativos (Limpia, espaciosa y 100% adaptable) */}
      <div className="border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-2 py-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'pedidos'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <Package className="w-4 h-4 shrink-0 text-blue-600" />
              <span>Pedidos y Entregas</span>
            </button>

            <button
              onClick={() => setActiveTab('incidencias')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'incidencias'
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Incidencias y Devoluciones</span>
            </button>

            <button
              onClick={() => setActiveTab('metricas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'metricas'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-slate-700" />
              <span>Métricas y Supervisión</span>
            </button>

            <button
              onClick={() => setActiveTab('guia')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'guia'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Guía Operativa</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Modal Informativo de la Sucursal Liberia (con foto oficial sucursal.jpeg) */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-modal-backdrop">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-modal-box">
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img
                src="/img/sucursal.jpeg"
                alt="Fachada Auto Clima Liberia"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/sucursal.jpeg';
                }}
              />
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                aria-label="Cerrar información de sucursal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                    Sede Operativa Principal
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Auto Clima — Sucursal Liberia</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Centro especializado en repuestos de aire acondicionado automotriz y climatización para la provincia de Guanacaste.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Liberia, Guanacaste, Costa Rica (Mostrador y Almacén Central)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Horario de atención: Lunes a Sábado, 7:00 a.m. – 5:30 p.m.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Línea directa para entregas: 8844-1234 / 8711-5678</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
