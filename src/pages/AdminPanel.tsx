import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, DollarSign, MapPin, BookOpen, Bell, Download, Upload, FolderSync as Sync, LogOut, Eye, EyeOff, User, Lock, Save, Plus, Edit, Trash2, Check, X, AlertCircle, Home, Activity, Database, Shield, Clock, Wifi, WifiOff } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { usePerformance } from '../hooks/usePerformance';
import { tmdbService } from '../services/tmdb';
import type { PriceConfig, DeliveryZone, Novel } from '../context/AdminContext';

export function AdminPanel() {
  const {
    state,
    login,
    logout,
    updatePrices,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    addNovel,
    updateNovel,
    deleteNovel,
    clearNotifications,
    exportSystemBackup,
    syncWithRemote
  } = useAdmin();

  const { metrics, isOptimized, optimizePerformance } = usePerformance();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'prices' | 'delivery' | 'novels' | 'notifications' | 'system'>('dashboard');
  const [priceForm, setPriceForm] = useState<PriceConfig>(state.prices);
  const [deliveryForm, setDeliveryForm] = useState({ name: '', cost: 0 });
  const [novelForm, setNovelForm] = useState({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
  const [editingDeliveryZone, setEditingDeliveryZone] = useState<DeliveryZone | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOptimizeSystem = async () => {
    try {
      // Clear API cache
      tmdbService.clearCache();
      
      // Optimize performance
      optimizePerformance();
      
      // Add notification
      addNotification({
        type: 'success',
        title: 'Sistema optimizado',
        message: 'Se ha optimizado el rendimiento del sistema y limpiado la caché',
        section: 'Sistema',
        action: 'optimize'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en optimización',
        message: 'No se pudo optimizar el sistema completamente',
        section: 'Sistema',
        action: 'optimize_error'
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginForm.username, loginForm.password);
    if (!success) {
      alert('Credenciales incorrectas');
    }
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(priceForm);
  };

  const handleDeliveryZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeliveryZone) {
      updateDeliveryZone({ ...editingDeliveryZone, ...deliveryForm });
      setEditingDeliveryZone(null);
    } else {
      addDeliveryZone(deliveryForm);
    }
    setDeliveryForm({ name: '', cost: 0 });
  };

  const handleNovelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel) {
      updateNovel({ ...editingNovel, ...novelForm });
      setEditingNovel(null);
    } else {
      addNovel(novelForm);
    }
    setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
  };

  const startEditDeliveryZone = (zone: DeliveryZone) => {
    setEditingDeliveryZone(zone);
    setDeliveryForm({ name: zone.name, cost: zone.cost });
  };

  const startEditNovel = (novel: Novel) => {
    setEditingNovel(novel);
    setNovelForm({
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || ''
    });
  };

  const cancelEdit = () => {
    setEditingDeliveryZone(null);
    setEditingNovel(null);
    setDeliveryForm({ name: '', cost: 0 });
    setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithRemote();
    setIsSyncing(false);
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="bg-white/20 p-4 rounded-full w-fit mx-auto mb-4">
              <Shield className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-sm opacity-90">TV a la Carta</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese su contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sectionIcons = {
    dashboard: Activity,
    prices: DollarSign,
    delivery: MapPin,
    novels: BookOpen,
    notifications: Bell,
    system: Database
  };

  const sectionTitles = {
    dashboard: 'Panel Principal',
    prices: 'Gestión de Precios',
    delivery: 'Zonas de Entrega',
    novels: 'Gestión de Novelas',
    notifications: 'Notificaciones',
    system: 'Sistema'
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-xl mr-4">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">Estado del Sistema</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Conexión</span>
              {state.syncStatus.isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className={`text-lg font-bold ${state.syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {state.syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Última Sync</span>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-blue-600">
              {new Date(state.syncStatus.lastSync).toLocaleTimeString('es-ES')}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Cambios Pendientes</span>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-orange-600">
              {state.syncStatus.pendingChanges}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Notificaciones</span>
              <Bell className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-lg font-bold text-purple-600">
              {state.notifications.length}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Rendimiento</span>
              <Activity className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="text-lg font-bold text-indigo-600">
              {metrics.memoryUsage.toFixed(1)} MB
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-xl mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900">Precios Actuales</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Películas:</span>
              <span className="font-bold text-green-700">${state.prices.moviePrice} CUP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Series:</span>
              <span className="font-bold text-green-700">${state.prices.seriesPrice} CUP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recargo:</span>
              <span className="font-bold text-orange-600">{state.prices.transferFeePercentage}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-xl mr-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-purple-900">Zonas de Entrega</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {state.deliveryZones.length}
            </div>
            <div className="text-sm text-purple-600">zonas configuradas</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-6 border border-pink-200">
          <div className="flex items-center mb-4">
            <div className="bg-pink-100 p-3 rounded-xl mr-4">
              <BookOpen className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-pink-900">Novelas</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-700 mb-2">
              {state.novels.length}
            </div>
            <div className="text-sm text-pink-600">novelas administradas</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="h-6 w-6 text-gray-600 mr-3" />
          Actividad Reciente
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {state.notifications.slice(0, 5).map((notification) => (
            <div key={notification.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg mr-3 ${
                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                notification.type === 'error' ? 'bg-red-100 text-red-600' :
                notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {notification.type === 'success' ? <Check className="h-4 w-4" /> :
                 notification.type === 'error' ? <X className="h-4 w-4" /> :
                 notification.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                 <Bell className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrices = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <DollarSign className="h-7 w-7 text-green-600 mr-3" />
        Configuración de Precios
      </h3>
      
      <form onSubmit={handlePriceUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Películas (CUP)
            </label>
            <input
              type="number"
              value={priceForm.moviePrice}
              onChange={(e) => setPriceForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Series por Temporada (CUP)
            </label>
            <input
              type="number"
              value={priceForm.seriesPrice}
              onChange={(e) => setPriceForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recargo por Transferencia (%)
            </label>
            <input
              type="number"
              value={priceForm.transferFeePercentage}
              onChange={(e) => setPriceForm(prev => ({ ...prev, transferFeePercentage: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              max="100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Novelas por Capítulo (CUP)
            </label>
            <input
              type="number"
              value={priceForm.novelPricePerChapter}
              onChange={(e) => setPriceForm(prev => ({ ...prev, novelPricePerChapter: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Actualizar Precios
        </button>
      </form>
    </div>
  );

  const renderDeliveryZones = () => (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-6 w-6 text-blue-600 mr-3" />
          {editingDeliveryZone ? 'Editar Zona de Entrega' : 'Agregar Nueva Zona'}
        </h3>
        
        <form onSubmit={handleDeliveryZoneSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Zona
              </label>
              <input
                type="text"
                value={deliveryForm.name}
                onChange={(e) => setDeliveryForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Nuevo Reparto"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Entrega (CUP)
              </label>
              <input
                type="number"
                value={deliveryForm.cost}
                onChange={(e) => setDeliveryForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
            >
              {editingDeliveryZone ? (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Actualizar Zona
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar Zona
                </>
              )}
            </button>
            
            {editingDeliveryZone && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Zonas Configuradas ({state.deliveryZones.length})
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {state.deliveryZones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{zone.name}</p>
                <p className="text-sm text-gray-600">
                  Costo: ${zone.cost.toLocaleString()} CUP
                </p>
                <p className="text-xs text-gray-500">
                  Actualizado: {new Date(zone.updatedAt).toLocaleString('es-ES')}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => startEditDeliveryZone(zone)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteDeliveryZone(zone.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNovels = () => (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BookOpen className="h-6 w-6 text-purple-600 mr-3" />
          {editingNovel ? 'Editar Novela' : 'Agregar Nueva Novela'}
        </h3>
        
        <form onSubmit={handleNovelSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Novela
              </label>
              <input
                type="text"
                value={novelForm.titulo}
                onChange={(e) => setNovelForm(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: La Casa de las Flores"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género
              </label>
              <input
                type="text"
                value={novelForm.genero}
                onChange={(e) => setNovelForm(prev => ({ ...prev, genero: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Drama/Romance"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Capítulos
              </label>
              <input
                type="number"
                value={novelForm.capitulos}
                onChange={(e) => setNovelForm(prev => ({ ...prev, capitulos: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año de Estreno
              </label>
              <input
                type="number"
                value={novelForm.año}
                onChange={(e) => setNovelForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1950"
                max={new Date().getFullYear() + 5}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              value={novelForm.descripcion}
              onChange={(e) => setNovelForm(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Descripción breve de la novela..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
            >
              {editingNovel ? (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Actualizar Novela
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar Novela
                </>
              )}
            </button>
            
            {editingNovel && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Novels List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Novelas Administradas ({state.novels.length})
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {state.novels.map((novel) => (
            <div key={novel.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{novel.titulo}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                    {novel.genero}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    {novel.capitulos} capítulos
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {novel.año}
                  </span>
                </div>
                {novel.descripcion && (
                  <p className="text-sm text-gray-600 mt-2">{novel.descripcion}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Costo: ${(novel.capitulos * state.prices.novelPricePerChapter).toLocaleString()} CUP
                </p>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => startEditNovel(novel)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteNovel(novel.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <Bell className="h-7 w-7 text-purple-600 mr-3" />
          Notificaciones del Sistema
        </h3>
        <button
          onClick={clearNotifications}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpiar Todo
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {state.notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay notificaciones</p>
          </div>
        ) : (
          state.notifications.map((notification) => (
            <div key={notification.id} className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className={`p-2 rounded-lg mr-4 ${
                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                notification.type === 'error' ? 'bg-red-100 text-red-600' :
                notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {notification.type === 'success' ? <Check className="h-5 w-5" /> :
                 notification.type === 'error' ? <X className="h-5 w-5" /> :
                 notification.type === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                 <Bell className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900">{notification.title}</p>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {notification.section}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      {/* System Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Database className="h-7 w-7 text-indigo-600 mr-3" />
          Gestión del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportSystemBackup}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            <Download className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="text-lg">Exportar Sistema Completo</div>
              <div className="text-sm opacity-90">Descargar copia de seguridad</div>
            </div>
          </button>
          
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white p-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            <Sync className={`h-6 w-6 mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="text-lg">{isSyncing ? 'Sincronizando...' : 'Sincronizar Sistema'}</div>
              <div className="text-sm opacity-90">Actualizar datos remotos</div>
            </div>
          </button>
          
          <button
            onClick={handleOptimizeSystem}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            <Activity className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="text-lg">Optimizar Sistema</div>
              <div className="text-sm opacity-90">Limpiar caché y optimizar</div>
            </div>
          </button>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-indigo-600 mr-3" />
              <div className="text-left">
                <div className="text-lg font-semibold text-indigo-900">Métricas de Rendimiento</div>
                <div className="text-sm text-indigo-700">Estado actual del sistema</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-700">Memoria en uso:</span>
                <span className="font-medium text-indigo-900">{metrics.memoryUsage.toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700">Tiempo de carga:</span>
                <span className="font-medium text-indigo-900">{metrics.loadTime.toFixed(0)} ms</span>
              </div>
              {isOptimized && (
                <div className="mt-2 p-2 bg-green-100 rounded-lg border border-green-200">
                  <span className="text-green-700 text-xs font-medium">✅ Sistema optimizado recientemente</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Información del Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Configuración Actual</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Versión del Sistema:</span>
                  <span className="font-medium">2.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Sincronización:</span>
                  <span className="font-medium">
                    {new Date(state.syncStatus.lastSync).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado de Conexión:</span>
                  <span className={`font-medium ${state.syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {state.syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Estadísticas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Zonas de Entrega:</span>
                  <span className="font-medium">{state.deliveryZones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Novelas Administradas:</span>
                  <span className="font-medium">{state.novels.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notificaciones:</span>
                  <span className="font-medium">{state.notifications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Caché API:</span>
                  <span className="font-medium">{tmdbService.getCacheStats().size} elementos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'prices':
        return renderPrices();
      case 'delivery':
        return renderDeliveryZones();
      case 'novels':
        return renderNovels();
      case 'notifications':
        return renderNotifications();
      case 'system':
        return renderSystem();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl mr-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                <p className="text-sm text-gray-600">TV a la Carta</p>
              </div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {Object.entries(sectionTitles).map(([key, title]) => {
              const Icon = sectionIcons[key as keyof typeof sectionIcons];
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key as any)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeSection === key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {title}
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Volver al Sitio</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {sectionTitles[activeSection]}
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona la configuración del sistema TV a la Carta
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                  state.syncStatus.isOnline 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {state.syncStatus.isOnline ? (
                    <Wifi className="h-4 w-4 mr-2" />
                  ) : (
                    <WifiOff className="h-4 w-4 mr-2" />
                  )}
                  {state.syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
                </div>
                
                {state.syncStatus.pendingChanges > 0 && (
                  <div className="bg-orange-100 text-orange-700 px-3 py-2 rounded-full text-sm font-medium">
                    {state.syncStatus.pendingChanges} cambios pendientes
                  </div>
                )}
              </div>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}