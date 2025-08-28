import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Settings, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Download, 
  Bell, 
  Activity, 
  Users, 
  TrendingUp, 
  Eye, 
  EyeOff,
  Home,
  ArrowLeft,
  Lock,
  User,
  Zap,
  Globe,
  Database,
  FileText,
  Save,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  AlertCircle,
  Info,
  RefreshCw,
  Calendar,
  Clock,
  Star,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { PriceConfig, DeliveryZone, Novel } from '../context/AdminContext';

// Animated Network Background Component
const AnimatedNetworkBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
        
        <svg className="absolute inset-0 w-full h-full">
          {[...Array(15)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="1"
              className="animate-pulse"
              style={{
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </svg>
        
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
};

// Modern Login Component
const ModernLogin = ({ onLogin }: { onLogin: (username: string, password: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = onLogin(username, password);
    if (!success) {
      setError('Credenciales incorrectas');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedNetworkBackground />
      
      <Link
        to="/"
        className="absolute top-8 left-8 z-20 group"
      >
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-3 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-2 rounded-full group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-medium text-lg group-hover:text-blue-100 transition-colors duration-300">
            Volver al Inicio
          </span>
        </div>
      </Link>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm p-8 text-center">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
            <p className="text-blue-100 text-lg">Sistema de Administración</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-medium text-sm uppercase tracking-wide">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    placeholder="Ingresa tu usuario"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Acceder al Sistema</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                <div className="flex items-center justify-center space-x-2 text-blue-200 text-sm">
                  <Info className="h-4 w-4" />
                  <span>Sistema seguro con autenticación avanzada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30 text-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
            <span className="text-green-200 text-xs font-medium">Sistema Online</span>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30 text-center">
            <Database className="h-4 w-4 text-blue-300 mx-auto mb-2" />
            <span className="text-blue-200 text-xs font-medium">Base de Datos</span>
          </div>
          <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 text-center">
            <Globe className="h-4 w-4 text-purple-300 mx-auto mb-2" />
            <span className="text-purple-200 text-xs font-medium">Red Activa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AdminPanel Component
export function AdminPanel() {
  const { state, login, logout, updatePrices, addDeliveryZone, updateDeliveryZone, deleteDeliveryZone, addNovel, updateNovel, deleteNovel, clearNotifications, exportSystemBackup } = useAdmin();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'prices' | 'zones' | 'novels' | 'system' | 'notifications'>('dashboard');
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [showAddZoneForm, setShowAddZoneForm] = useState(false);
  const [showAddNovelForm, setShowAddNovelForm] = useState(false);

  // Form states
  const [priceForm, setPriceForm] = useState<PriceConfig>(state.prices);
  const [zoneForm, setZoneForm] = useState({ name: '', cost: 0, active: true });
  const [novelForm, setNovelForm] = useState({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '', active: true });

  useEffect(() => {
    setPriceForm(state.prices);
  }, [state.prices]);

  if (!state.isAuthenticated) {
    return <ModernLogin onLogin={login} />;
  }

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(priceForm);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    addDeliveryZone(zoneForm);
    setZoneForm({ name: '', cost: 0, active: true });
    setShowAddZoneForm(false);
  };

  const handleUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateDeliveryZone({ ...editingZone, ...zoneForm });
      setEditingZone(null);
      setZoneForm({ name: '', cost: 0, active: true });
    }
  };

  const handleAddNovel = (e: React.FormEvent) => {
    e.preventDefault();
    addNovel(novelForm);
    setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '', active: true });
    setShowAddNovelForm(false);
  };

  const handleUpdateNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel) {
      updateNovel({ ...editingNovel, ...novelForm });
      setEditingNovel(null);
      setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '', active: true });
    }
  };

  const startEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({ name: zone.name, cost: zone.cost, active: zone.active });
  };

  const startEditNovel = (novel: Novel) => {
    setEditingNovel(novel);
    setNovelForm({ titulo: novel.titulo, genero: novel.genero, capitulos: novel.capitulos, año: novel.año, descripcion: novel.descripcion || '', active: novel.active });
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Main statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Zonas de Entrega</p>
              <p className="text-3xl font-bold">{state.deliveryZones.length}</p>
            </div>
            <MapPin className="h-12 w-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Novelas</p>
              <p className="text-3xl font-bold">{state.novels.length}</p>
            </div>
            <BookOpen className="h-12 w-12 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Precio Película</p>
              <p className="text-3xl font-bold">${state.prices.moviePrice}</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Notificaciones</p>
              <p className="text-3xl font-bold">{state.notifications.length}</p>
            </div>
            <Bell className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="mr-3 h-6 w-6 text-blue-600" />
            Actividad Reciente
          </h3>
        </div>
        <div className="p-6">
          {state.notifications.slice(0, 5).map((notification) => (
            <div key={notification.id} className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-b-0">
              <div className={`p-2 rounded-full ${
                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                notification.type === 'error' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {notification.type === 'success' ? <Check className="h-4 w-4" /> :
                 notification.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                 notification.type === 'error' ? <X className="h-4 w-4" /> :
                 <Info className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{notification.title}</p>
                <p className="text-gray-600 text-sm">{notification.message}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(notification.timestamp).toLocaleString('es-ES')} • {notification.section}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrices = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <DollarSign className="mr-3 h-6 w-6 text-green-600" />
          Configuración de Precios
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Los cambios se aplicarán en tiempo real en toda la aplicación
        </p>
      </div>
      <form onSubmit={handlePriceUpdate} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Películas (CUP)
            </label>
            <input
              type="number"
              value={priceForm.moviePrice}
              onChange={(e) => setPriceForm({ ...priceForm, moviePrice: parseInt(e.target.value) })}
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
              onChange={(e) => setPriceForm({ ...priceForm, seriesPrice: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recargo por Transferencia (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={priceForm.transferFeePercentage}
                onChange={(e) => setPriceForm({ ...priceForm, transferFeePercentage: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                max="100"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Se aplicará automáticamente en todos los cálculos de transferencia
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio por Capítulo de Novela (CUP)
            </label>
            <input
              type="number"
              value={priceForm.novelPricePerChapter}
              onChange={(e) => setPriceForm({ ...priceForm, novelPricePerChapter: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              required
            />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Vista Previa de Cambios</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">• Película: ${priceForm.moviePrice} CUP</p>
              <p className="text-blue-700">• Serie (1 temp.): ${priceForm.seriesPrice} CUP</p>
            </div>
            <div>
              <p className="text-blue-700">• Transferencia película: ${Math.round(priceForm.moviePrice * (1 + priceForm.transferFeePercentage / 100))} CUP</p>
              <p className="text-blue-700">• Transferencia serie: ${Math.round(priceForm.seriesPrice * (1 + priceForm.transferFeePercentage / 100))} CUP</p>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Guardar Precios</span>
        </button>
      </form>
    </div>
  );

  const renderZones = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">Zonas de Entrega</h3>
        <button
          onClick={() => setShowAddZoneForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Zona</span>
        </button>
      </div>

      {(showAddZoneForm || editingZone) && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-bold text-gray-900">
              {editingZone ? 'Editar Zona' : 'Nueva Zona de Entrega'}
            </h4>
          </div>
          <form onSubmit={editingZone ? handleUpdateZone : handleAddZone} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Zona
              </label>
              <input
                type="text"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Santiago de Cuba > Santiago de Cuba > Vista Alegre"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Entrega (CUP)
              </label>
              <input
                type="number"
                value={zoneForm.cost}
                onChange={(e) => setZoneForm({ ...zoneForm, cost: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="zoneActive"
                checked={zoneForm.active}
                onChange={(e) => setZoneForm({ ...zoneForm, active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="zoneActive" className="ml-2 block text-sm text-gray-900">
                Zona activa
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{editingZone ? 'Actualizar' : 'Guardar'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddZoneForm(false);
                  setEditingZone(null);
                  setZoneForm({ name: '', cost: 0, active: true });
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-bold text-gray-900">Zonas Configuradas ({state.deliveryZones.length})</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {state.deliveryZones.map((zone) => (
            <div key={zone.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{zone.name}</h5>
                  <p className="text-gray-600 text-sm mt-1">
                    Costo: ${zone.cost.toLocaleString()} CUP
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      zone.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {zone.active ? 'Activa' : 'Inactiva'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Creada: {new Date(zone.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditZone(zone)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteDeliveryZone(zone.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNovels = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">Gestión de Novelas</h3>
        <button
          onClick={() => setShowAddNovelForm(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Novela</span>
        </button>
      </div>

      {(showAddNovelForm || editingNovel) && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-bold text-gray-900">
              {editingNovel ? 'Editar Novela' : 'Nueva Novela'}
            </h4>
          </div>
          <form onSubmit={editingNovel ? handleUpdateNovel : handleAddNovel} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={novelForm.titulo}
                  onChange={(e) => setNovelForm({ ...novelForm, titulo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capítulos
                </label>
                <input
                  type="number"
                  value={novelForm.capitulos}
                  onChange={(e) => setNovelForm({ ...novelForm, capitulos: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  value={novelForm.año}
                  onChange={(e) => setNovelForm({ ...novelForm, año: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  min="1900"
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
                onChange={(e) => setNovelForm({ ...novelForm, descripcion: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="novelActive"
                checked={novelForm.active}
                onChange={(e) => setNovelForm({ ...novelForm, active: e.target.checked })}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="novelActive" className="ml-2 block text-sm text-gray-900">
                Novela activa
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{editingNovel ? 'Actualizar' : 'Guardar'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddNovelForm(false);
                  setEditingNovel(null);
                  setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '', active: true });
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-bold text-gray-900">Novelas Configuradas ({state.novels.length})</h4>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {state.novels.map((novel) => (
            <div key={novel.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{novel.titulo}</h5>
                  <p className="text-gray-600 text-sm mt-1">
                    {novel.genero} • {novel.capitulos} capítulos • {novel.año}
                  </p>
                  {novel.descripcion && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{novel.descripcion}</p>
                  )}
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      novel.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {novel.active ? 'Activa' : 'Inactiva'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Costo: ${(novel.capitulos * state.prices.novelPricePerChapter).toLocaleString()} CUP
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditNovel(novel)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteNovel(novel.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 h-6 w-6 text-indigo-600" />
            Sistema y Exportación
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-900">Estado del Sistema</h4>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-blue-700 text-sm">Sistema operativo y sincronizado</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-purple-900">Último Backup</h4>
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-purple-700 text-sm">
                {state.lastBackup ? new Date(state.lastBackup).toLocaleString('es-ES') : 'Nunca'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-green-900">Archivos del Sistema</h4>
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-green-700 text-sm">6 archivos principales</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Exportar Sistema Completo</h4>
              <p className="text-gray-600 mb-6">
                Exporta el sistema completo incluyendo AdminContext.tsx, CheckoutModal.tsx, NovelasModal.tsx y todos los archivos con las configuraciones actuales sincronizadas en tiempo real
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-3">Archivos Principales Incluidos:</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="font-medium text-blue-800">AdminContext.tsx</div>
                    <div className="text-blue-600 text-xs">Estado actual sincronizado</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="font-medium text-purple-800">CheckoutModal.tsx</div>
                    <div className="text-purple-600 text-xs">Zonas de entrega actualizadas</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="font-medium text-pink-800">NovelasModal.tsx</div>
                    <div className="text-pink-600 text-xs">Catálogo de novelas completo</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                <h5 className="font-semibold text-green-900 mb-2">Configuraciones Actuales:</h5>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• Precios: Películas ${state.prices.moviePrice} CUP, Series ${state.prices.seriesPrice} CUP</div>
                  <div>• Zonas de entrega: {state.deliveryZones.length} configuradas</div>
                  <div>• Novelas: {state.novels.length} en catálogo</div>
                  <div>• Recargo transferencia: {state.prices.transferFeePercentage}%</div>
                </div>
              </div>
              
              <button
                onClick={exportSystemBackup}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mx-auto group"
              >
                <Download className="h-6 w-6 group-hover:animate-bounce" />
                <span>Exportar Sistema Completo</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Archivos del Sistema</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Total: {6 + state.deliveryZones.length + state.novels.length} archivos
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Sincronizado</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { 
                  name: 'AdminContext.tsx', 
                  description: `Contexto principal del sistema`, 
                  details: `${state.deliveryZones.length} zonas de entrega, ${state.novels.length} novelas administradas, precios sincronizados`,
                  status: 'Sincronizado', 
                  priority: 'Crítica',
                  lastUpdate: new Date().toISOString(),
                  size: '~15KB'
                },
                { 
                  name: 'CheckoutModal.tsx', 
                  description: `Modal de finalización de pedidos`, 
                  details: `${Object.keys({...{}, ...state.deliveryZones.reduce((acc, zone) => { acc[zone.name] = zone.cost; return acc; }, {} as any)}).length} zonas de entrega disponibles, cálculos automáticos`,
                  status: 'Sincronizado', 
                  priority: 'Crítica',
                  lastUpdate: new Date().toISOString(),
                  size: '~12KB'
                },
                { 
                  name: 'NovelasModal.tsx', 
                  description: `Catálogo completo de novelas`, 
                  details: `${50 + state.novels.length} novelas totales, filtros avanzados, precios dinámicos`,
                  status: 'Sincronizado', 
                  priority: 'Crítica',
                  lastUpdate: new Date().toISOString(),
                  size: '~18KB'
                },
                { 
                  name: 'AdminPanel.tsx', 
                  description: 'Panel de control administrativo', 
                  details: 'Dashboard, gestión completa, notificaciones en tiempo real',
                  status: 'Sincronizado', 
                  priority: 'Alta',
                  lastUpdate: new Date().toISOString(),
                  size: '~25KB'
                },
                { 
                  name: 'PriceCard.tsx', 
                  description: 'Componente de visualización de precios', 
                  details: `Película $${state.prices.moviePrice} CUP, Serie $${state.prices.seriesPrice} CUP, Transferencia +${state.prices.transferFeePercentage}%`,
                  status: 'Sincronizado', 
                  priority: 'Alta',
                  lastUpdate: new Date().toISOString(),
                  size: '~4KB'
                },
                { 
                  name: 'CartContext.tsx', 
                  description: 'Contexto del carrito de compras', 
                  details: 'Gestión de elementos, cálculos automáticos, persistencia',
                  status: 'Sincronizado', 
                  priority: 'Alta',
                  lastUpdate: new Date().toISOString(),
                  size: '~8KB'
                }
              ].map((file, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{file.name}</h5>
                      <p className="text-gray-600 text-sm">{file.description}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          file.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                          file.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                          file.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {file.priority}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {file.size}
                        </span>
                      <p className="text-gray-500 text-xs mt-1">{file.details}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs text-gray-500">
                          Última sincronización: {new Date(file.lastUpdate).toLocaleTimeString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                        {file.status}
                      </span>
                      <div className="text-xs text-gray-500">
                        Incluido en exportación
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">Notificaciones del Sistema</h3>
        <button
          onClick={clearNotifications}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
        >
          <Trash2 className="h-5 w-5" />
          <span>Limpiar Todo</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-bold text-gray-900">
            Historial de Actividades ({state.notifications.length})
          </h4>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {state.notifications.map((notification) => (
            <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${
                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  notification.type === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {notification.type === 'success' ? <Check className="h-4 w-4" /> :
                   notification.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                   notification.type === 'error' ? <X className="h-4 w-4" /> :
                   <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-900">{notification.title}</h5>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-gray-500">Sección: {notification.section}</span>
                    <span className="text-xs text-gray-500">Acción: {notification.action}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="group flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 px-4 py-2 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors duration-300">
                  Volver al Inicio
                </span>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Panel de Control</h1>
                  <p className="text-sm text-gray-600">Sistema de Administración</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Navegación</h2>
                <div className="space-y-2">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'prices', label: 'Precios', icon: DollarSign },
                    { id: 'zones', label: 'Zonas de Entrega', icon: MapPin },
                    { id: 'novels', label: 'Gestión de Novelas', icon: BookOpen },
                    { id: 'notifications', label: 'Notificaciones', icon: Bell },
                    { id: 'system', label: 'Sistema', icon: Settings }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'prices' && renderPrices()}
            {activeSection === 'zones' && renderZones()}
            {activeSection === 'novels' && renderNovels()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'system' && renderSystem()}
          </div>
        </div>
      </div>
    </div>
  );
}