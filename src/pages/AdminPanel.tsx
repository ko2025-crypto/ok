import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, DollarSign, MapPin, BookOpen, Bell, Download, Upload, FolderSync as Sync, User, Lock, Eye, EyeOff, LogOut, Save, Plus, Edit, Trash2, Check, X, AlertCircle, Info, Zap, Activity, Database, Cloud, Shield, Smartphone, Monitor, Wifi, WifiOff, Home, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
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
    exportSystemConfig,
    exportCompleteSourceCode,
    syncWithRemote,
    syncAllSections
  } = useAdmin();

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'prices' | 'zones' | 'novels' | 'notifications' | 'system'>('prices');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [priceForm, setPriceForm] = useState<PriceConfig>(state.prices);
  const [zoneForm, setZoneForm] = useState({ name: '', cost: 0 });
  const [novelForm, setNovelForm] = useState({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);

  // Sync prices with state
  useEffect(() => {
    setPriceForm(state.prices);
  }, [state.prices]);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const success = login(loginForm.username, loginForm.password);
    if (!success) {
      setLoginError('Credenciales incorrectas. Contacte al administrador del sistema.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setLoginForm({ username: '', password: '' });
    setLoginError('');
  };

  // Price management
  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(priceForm);
  };

  // Zone management
  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneForm.name.trim() && zoneForm.cost >= 0) {
      addDeliveryZone(zoneForm);
      setZoneForm({ name: '', cost: 0 });
    }
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({ name: zone.name, cost: zone.cost });
  };

  const handleUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone && zoneForm.name.trim() && zoneForm.cost >= 0) {
      updateDeliveryZone({
        ...editingZone,
        name: zoneForm.name,
        cost: zoneForm.cost
      });
      setEditingZone(null);
      setZoneForm({ name: '', cost: 0 });
    }
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
    setEditingNovel(null);
    setZoneForm({ name: '', cost: 0 });
    setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
  };

  // Novel management
  const handleAddNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (novelForm.titulo.trim() && novelForm.genero.trim() && novelForm.capitulos > 0) {
      addNovel(novelForm);
      setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
    }
  };

  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel);
    setNovelForm({
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || ''
    });
  };

  const handleUpdateNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel && novelForm.titulo.trim() && novelForm.genero.trim() && novelForm.capitulos > 0) {
      updateNovel({
        ...editingNovel,
        ...novelForm
      });
      setEditingNovel(null);
      setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
    }
  };

  // System operations
  const handleExportConfig = async () => {
    setIsLoading(true);
    try {
      await exportSystemConfig();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSourceCode = async () => {
    setIsLoading(true);
    try {
      await exportCompleteSourceCode();
    } catch (error) {
      console.error('Source code export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncWithRemote();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullSync = async () => {
    setIsLoading(true);
    try {
      await syncAllSections();
    } catch (error) {
      console.error('Full sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login screen
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="bg-white/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-sm opacity-90">TV a la Carta - Sistema de Gestión</p>
          </div>

          {/* Login Form */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{loginError}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Iniciar Sesión
                </button>

                <Link
                  to="/"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver al Inicio
                </Link>
              </div>
            </form>

            {/* Access Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Info className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Información de Acceso</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Solo personal autorizado</p>
                <p>• Contacte al administrador para credenciales</p>
                <p>• Sistema protegido con autenticación</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main admin interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-500">TV a la Carta - Sistema de Gestión</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <div className="flex items-center space-x-2">
                {state.syncStatus.isOnline ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">En línea</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Sin conexión</span>
                  </div>
                )}
                
                {state.syncStatus.pendingChanges > 0 && (
                  <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    {state.syncStatus.pendingChanges} cambios pendientes
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Inicio</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Zonas de Entrega</p>
                <p className="text-3xl font-bold">{state.deliveryZones.length}</p>
              </div>
              <MapPin className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Novelas Administradas</p>
                <p className="text-3xl font-bold">{state.novels.length}</p>
              </div>
              <BookOpen className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Notificaciones</p>
                <p className="text-3xl font-bold">{state.notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Última Sincronización</p>
                <p className="text-sm font-medium">
                  {new Date(state.syncStatus.lastSync).toLocaleTimeString('es-ES')}
                </p>
              </div>
              <Sync className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'prices', label: 'Precios', icon: DollarSign },
                { id: 'zones', label: 'Zonas de Entrega', icon: MapPin },
                { id: 'novels', label: 'Gestión de Novelas', icon: BookOpen },
                { id: 'notifications', label: 'Notificaciones', icon: Bell },
                { id: 'system', label: 'Sistema', icon: Database }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Prices Tab */}
            {activeTab === 'prices' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Configuración de Precios</h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Activity className="h-4 w-4 mr-1" />
                    Sincronización automática habilitada
                  </div>
                </div>

                <form onSubmit={handlePriceUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <span className="text-lg">🎬</span>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900">Películas</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-blue-700">
                        Precio por película (CUP)
                      </label>
                      <input
                        type="number"
                        value={priceForm.moviePrice}
                        onChange={(e) => setPriceForm({ ...priceForm, moviePrice: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <span className="text-lg">📺</span>
                      </div>
                      <h3 className="text-lg font-semibold text-purple-900">Series</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-purple-700">
                        Precio por temporada (CUP)
                      </label>
                      <input
                        type="number"
                        value={priceForm.seriesPrice}
                        onChange={(e) => setPriceForm({ ...priceForm, seriesPrice: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <span className="text-lg">🏦</span>
                      </div>
                      <h3 className="text-lg font-semibold text-orange-900">Transferencia Bancaria</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-orange-700">
                        Recargo por transferencia (%)
                      </label>
                      <input
                        type="number"
                        value={priceForm.transferFeePercentage}
                        onChange={(e) => setPriceForm({ ...priceForm, transferFeePercentage: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-pink-100 p-2 rounded-lg mr-3">
                        <span className="text-lg">📚</span>
                      </div>
                      <h3 className="text-lg font-semibold text-pink-900">Novelas</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-pink-700">
                        Precio por capítulo (CUP)
                      </label>
                      <input
                        type="number"
                        value={priceForm.novelPricePerChapter}
                        onChange={(e) => setPriceForm({ ...priceForm, novelPricePerChapter: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Guardar Configuración de Precios
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Delivery Zones Tab */}
            {activeTab === 'zones' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Zonas de Entrega</h2>
                  <div className="text-sm text-gray-500">
                    Total: {state.deliveryZones.length} zonas configuradas
                  </div>
                </div>

                {/* Add/Edit Zone Form */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingZone ? 'Editar Zona de Entrega' : 'Agregar Nueva Zona'}
                  </h3>
                  
                  <form onSubmit={editingZone ? handleUpdateZone : handleAddZone} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la zona
                      </label>
                      <input
                        type="text"
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Santiago de Cuba > Santiago de Cuba > Vista Alegre"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo de entrega (CUP)
                      </label>
                      <input
                        type="number"
                        value={zoneForm.cost}
                        onChange={(e) => setZoneForm({ ...zoneForm, cost: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-3 flex space-x-3">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
                      >
                        {editingZone ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {editingZone ? 'Actualizar Zona' : 'Agregar Zona'}
                      </button>
                      
                      {editingZone && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Zones List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Zonas Configuradas</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {state.deliveryZones.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay zonas de entrega configuradas</p>
                      </div>
                    ) : (
                      state.deliveryZones.map((zone) => (
                        <div key={zone.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{zone.name}</h4>
                              <p className="text-sm text-gray-500">
                                Costo: ${zone.cost.toLocaleString()} CUP
                              </p>
                              <p className="text-xs text-gray-400">
                                Creado: {new Date(zone.createdAt).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditZone(zone)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar zona"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteDeliveryZone(zone.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar zona"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Novels Tab */}
            {activeTab === 'novels' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Novelas</h2>
                  <div className="text-sm text-gray-500">
                    Total: {state.novels.length} novelas administradas
                  </div>
                </div>

                {/* Add/Edit Novel Form */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingNovel ? 'Editar Novela' : 'Agregar Nueva Novela'}
                  </h3>
                  
                  <form onSubmit={editingNovel ? handleUpdateNovel : handleAddNovel} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título de la novela
                        </label>
                        <input
                          type="text"
                          value={novelForm.titulo}
                          onChange={(e) => setNovelForm({ ...novelForm, titulo: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Ej: La Usurpadora"
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
                          onChange={(e) => setNovelForm({ ...novelForm, genero: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Ej: Drama/Romance"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de capítulos
                        </label>
                        <input
                          type="number"
                          value={novelForm.capitulos}
                          onChange={(e) => setNovelForm({ ...novelForm, capitulos: Number(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Año de estreno
                        </label>
                        <input
                          type="number"
                          value={novelForm.año}
                          onChange={(e) => setNovelForm({ ...novelForm, año: Number(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (opcional)
                      </label>
                      <textarea
                        value={novelForm.descripcion}
                        onChange={(e) => setNovelForm({ ...novelForm, descripcion: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        rows={3}
                        placeholder="Descripción breve de la novela..."
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
                      >
                        {editingNovel ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {editingNovel ? 'Actualizar Novela' : 'Agregar Novela'}
                      </button>
                      
                      {editingNovel && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Novels List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Novelas Administradas</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {state.novels.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay novelas administradas</p>
                      </div>
                    ) : (
                      state.novels.map((novel) => (
                        <div key={novel.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{novel.titulo}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span>Género: {novel.genero}</span>
                                <span>Capítulos: {novel.capitulos}</span>
                                <span>Año: {novel.año}</span>
                              </div>
                              {novel.descripcion && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{novel.descripcion}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                Creado: {new Date(novel.createdAt).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditNovel(novel)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar novela"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteNovel(novel.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar novela"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h2>
                  <button
                    onClick={clearNotifications}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Todo
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {state.notifications.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay notificaciones</p>
                      </div>
                    ) : (
                      state.notifications.map((notification) => (
                        <div key={notification.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              notification.type === 'success' ? 'bg-green-100 text-green-600' :
                              notification.type === 'error' ? 'bg-red-100 text-red-600' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notification.type === 'success' ? <Check className="h-4 w-4" /> :
                               notification.type === 'error' ? <X className="h-4 w-4" /> :
                               notification.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                               <Info className="h-4 w-4" />}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                                <span>Sección: {notification.section}</span>
                                <span>Acción: {notification.action}</span>
                                <span>{new Date(notification.timestamp).toLocaleString('es-ES')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Administración del Sistema</h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Database className="h-4 w-4 mr-1" />
                    Versión {state.systemConfig.version}
                  </div>
                </div>

                {/* System Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Download className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">Exportar Configuración</h3>
                        <p className="text-sm text-blue-700">Descargar configuración JSON del sistema</p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportConfig}
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Download className="h-5 w-5 mr-2" />
                      )}
                      Exportar Configuración
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-900">Exportar Código Fuente</h3>
                        <p className="text-sm text-purple-700">Descargar sistema completo con código</p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportSourceCode}
                      disabled={isLoading}
                      className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Zap className="h-5 w-5 mr-2" />
                      )}
                      Exportar Código Fuente
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <Sync className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">Sincronización</h3>
                        <p className="text-sm text-green-700">Sincronizar con servidor remoto</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSync}
                      disabled={isLoading}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Sync className="h-5 w-5 mr-2" />
                      )}
                      Sincronizar Ahora
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg mr-4">
                        <Cloud className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-orange-900">Sincronización Completa</h3>
                        <p className="text-sm text-orange-700">Sincronizar todas las secciones</p>
                      </div>
                    </div>
                    <button
                      onClick={handleFullSync}
                      disabled={isLoading}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Cloud className="h-5 w-5 mr-2" />
                      )}
                      Sincronización Completa
                    </button>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Monitor className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">Versión</span>
                      </div>
                      <p className="text-sm text-gray-600">{state.systemConfig.version}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Activity className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">Estado</span>
                      </div>
                      <p className="text-sm text-green-600 font-medium">Operativo</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Smartphone className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">Plataforma</span>
                      </div>
                      <p className="text-sm text-gray-600">Web Application</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Database className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">Última Exportación</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {state.systemConfig.lastExport 
                          ? new Date(state.systemConfig.lastExport).toLocaleString('es-ES')
                          : 'Nunca'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Shield className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">Seguridad</span>
                      </div>
                      <p className="text-sm text-green-600 font-medium">Protegido</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Sync className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">Última Sincronización</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(state.syncStatus.lastSync).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}