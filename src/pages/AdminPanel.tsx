import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Lock,
  Home,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { PriceConfig, DeliveryZone, Novel, Notification } from '../context/AdminContext';

export function AdminPanel() {
  const navigate = useNavigate();
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
    removeNotification,
    clearNotifications,
    exportSystemBackup
  } = useAdmin();

  // Authentication state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'prices' | 'zones' | 'novels' | 'notifications'>('prices');
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showAddNovelModal, setShowAddNovelModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);

  // Form states
  const [priceForm, setPriceForm] = useState<PriceConfig>(state.prices);
  const [zoneForm, setZoneForm] = useState({ name: '', cost: 0, active: true });
  const [novelForm, setNovelForm] = useState({
    titulo: '',
    genero: '',
    capitulos: 0,
    año: new Date().getFullYear(),
    descripcion: '',
    active: true
  });

  // Update price form when state changes
  useEffect(() => {
    setPriceForm(state.prices);
  }, [state.prices]);

  const correctPassword = 'admin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      login();
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(priceForm);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneForm.name.trim() && zoneForm.cost >= 0) {
      addDeliveryZone(zoneForm);
      setZoneForm({ name: '', cost: 0, active: true });
      setShowAddZoneModal(false);
    }
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      cost: zone.cost,
      active: zone.active
    });
    setShowAddZoneModal(true);
  };

  const handleUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone && zoneForm.name.trim() && zoneForm.cost >= 0) {
      updateDeliveryZone({
        ...editingZone,
        name: zoneForm.name,
        cost: zoneForm.cost,
        active: zoneForm.active
      });
      setEditingZone(null);
      setZoneForm({ name: '', cost: 0, active: true });
      setShowAddZoneModal(false);
    }
  };

  const handleAddNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (novelForm.titulo.trim() && novelForm.genero.trim() && novelForm.capitulos > 0) {
      addNovel(novelForm);
      setNovelForm({
        titulo: '',
        genero: '',
        capitulos: 0,
        año: new Date().getFullYear(),
        descripcion: '',
        active: true
      });
      setShowAddNovelModal(false);
    }
  };

  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel);
    setNovelForm({
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || '',
      active: novel.active
    });
    setShowAddNovelModal(true);
  };

  const handleUpdateNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel && novelForm.titulo.trim() && novelForm.genero.trim() && novelForm.capitulos > 0) {
      updateNovel({
        ...editingNovel,
        titulo: novelForm.titulo,
        genero: novelForm.genero,
        capitulos: novelForm.capitulos,
        año: novelForm.año,
        descripcion: novelForm.descripcion,
        active: novelForm.active
      });
      setEditingNovel(null);
      setNovelForm({
        titulo: '',
        genero: '',
        capitulos: 0,
        año: new Date().getFullYear(),
        descripcion: '',
        active: true
      });
      setShowAddNovelModal(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Export system functionality
  const exportCompleteSystem = async () => {
    try {
      // Generate all component files
      const files = {
        'AdminContext.tsx': generateAdminContextFile(),
        'CartContext.tsx': generateCartContextFile(),
        'CheckoutModal.tsx': generateCheckoutModalFile(),
        'NovelasModal.tsx': generateNovelasModalFile(),
        'PriceCard.tsx': generatePriceCardFile(),
        'AdminPanel.tsx': generateAdminPanelFile(),
        'system-config.json': JSON.stringify({
          prices: state.prices,
          deliveryZones: state.deliveryZones,
          novels: state.novels,
          exportDate: new Date().toISOString(),
          version: '2.0'
        }, null, 2)
      };

      // Create and download ZIP
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-system-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Sistema exportado exitosamente');
    } catch (error) {
      console.error('Error exporting system:', error);
      alert('Error al exportar el sistema: ' + (error as Error).message);
    }
  };

  const generateAdminContextFile = () => {
    return `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

export interface PriceConfig {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  cost: number;
  active: boolean;
  createdAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  lastBackup?: string;
}

const initialState: AdminState = {
  isAuthenticated: false,
  prices: ${JSON.stringify(state.prices, null, 2)},
  deliveryZones: ${JSON.stringify(state.deliveryZones, null, 2)},
  novels: ${JSON.stringify(state.novels, null, 2)},
  notifications: []
};

// ... rest of AdminContext implementation
`;
  };

  const generateCartContextFile = () => {
    return `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Toast } from '../components/Toast';
import { AdminContext } from './AdminContext';
import type { CartItem } from '../types/movie';

// Current prices configuration
const CURRENT_PRICES = ${JSON.stringify(state.prices, null, 2)};

// ... rest of CartContext implementation with current prices
`;
  };

  const generateCheckoutModalFile = () => {
    return `import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Current delivery zones configuration
const DELIVERY_ZONES = ${JSON.stringify(state.deliveryZones.reduce((acc, zone) => {
      acc[zone.name] = zone.cost;
      return acc;
    }, {} as { [key: string]: number }), null, 2)};

// Current prices configuration
const CURRENT_PRICES = ${JSON.stringify(state.prices, null, 2)};

// ... rest of CheckoutModal implementation with current configuration
`;
  };

  const generateNovelasModalFile = () => {
    // Get current prices from state
    const { moviePrice, seriesPrice, transferFeePercentage, novelPricePerChapter } = state.prices;
    
    return `import React, { useState, useEffect } from 'react';
import { X, Download, MessageCircle, Phone, BookOpen, Info, Check, DollarSign, CreditCard, Calculator, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Current novels catalog
const NOVELS_CATALOG = ${JSON.stringify(state.novels, null, 2)};

// Current pricing configuration
const PRICING_CONFIG = {
  moviePrice: ${moviePrice},
  seriesPrice: ${seriesPrice},
  transferFeePercentage: ${transferFeePercentage},
  novelPricePerChapter: ${novelPricePerChapter}
};

interface Novela {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  paymentType?: 'cash' | 'transfer';
}

interface NovelasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovelasModal({ isOpen, onClose }: NovelasModalProps) {
  const adminContext = React.useContext(AdminContext);
  const [selectedNovelas, setSelectedNovelas] = useState<number[]>([]);
  const [novelasWithPayment, setNovelasWithPayment] = useState<Novela[]>([]);
  const [showNovelList, setShowNovelList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState<'titulo' | 'año' | 'capitulos'>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get novels and prices from admin context with real-time updates or fallback to static config
  const adminNovels = adminContext?.state?.novels || NOVELS_CATALOG;
  const novelPricePerChapter = adminContext?.state?.prices?.novelPricePerChapter || PRICING_CONFIG.novelPricePerChapter;
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || PRICING_CONFIG.transferFeePercentage;
  
  // Use admin novels or fallback to static catalog
  const allNovelas = adminNovels.map(novel => ({
    id: novel.id,
    titulo: novel.titulo,
    genero: novel.genero,
    capitulos: novel.capitulos,
    año: novel.año,
    descripcion: novel.descripcion
  }));

  const phoneNumber = '+5354690878';

  // ... rest of NovelasModal implementation
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {/* Modal content */}
    </div>
  );
}`;
  };

  const generatePriceCardFile = () => {
    return `import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Current prices configuration
const CURRENT_PRICES = ${JSON.stringify(state.prices, null, 2)};

interface PriceCardProps {
  type: 'movie' | 'tv';
  selectedSeasons?: number[];
  episodeCount?: number;
  isAnime?: boolean;
}

export function PriceCard({ type, selectedSeasons = [], episodeCount = 0, isAnime = false }: PriceCardProps) {
  const adminContext = React.useContext(AdminContext);
  
  // Get prices from admin context with real-time updates or fallback to static config
  const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES.moviePrice;
  const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES.seriesPrice;
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || CURRENT_PRICES.transferFeePercentage;
  
  // ... rest of PriceCard implementation
}`;
  };

  const generateAdminPanelFile = () => {
    return `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Lock,
  Home,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { PriceConfig, DeliveryZone, Novel, Notification } from '../context/AdminContext';

// Current system configuration
const SYSTEM_CONFIG = {
  prices: ${JSON.stringify(state.prices, null, 2)},
  deliveryZones: ${JSON.stringify(state.deliveryZones, null, 2)},
  novels: ${JSON.stringify(state.novels, null, 2)},
  lastUpdate: '${new Date().toISOString()}'
};

export function AdminPanel() {
  // ... AdminPanel implementation with current configuration
}`;
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="bg-white/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-blue-100 mt-2">TV a la Carta</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Ingrese la contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {loginError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {loginError}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Volver al Inicio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Home className="h-5 w-5 mr-1" />
                Inicio
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'prices', label: 'Precios', icon: DollarSign },
                { id: 'zones', label: 'Zonas de Entrega', icon: MapPin },
                { id: 'novels', label: 'Novelas', icon: BookOpen },
                { id: 'notifications', label: 'Notificaciones', icon: Bell }
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
                  {id === 'notifications' && state.notifications.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.notifications.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'prices' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Configuración de Precios</h2>
              <div className="flex space-x-3">
                <button
                  onClick={exportSystemBackup}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Backup
                </button>
                <button
                  onClick={exportCompleteSystem}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Sistema
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePriceUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Película (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceForm.moviePrice}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Temporada de Serie (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceForm.seriesPrice}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recargo por Transferencia (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={priceForm.transferFeePercentage}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, transferFeePercentage: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Capítulo de Novela (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={priceForm.novelPricePerChapter}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, novelPricePerChapter: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Precios
              </button>
            </form>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Zonas de Entrega</h2>
              <button
                onClick={() => setShowAddZoneModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Zona
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo (CUP)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.deliveryZones.map((zone) => (
                    <tr key={zone.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {zone.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${zone.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          zone.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {zone.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(zone.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditZone(zone)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDeliveryZone(zone.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'novels' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Catálogo de Novelas</h2>
              <button
                onClick={() => setShowAddNovelModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Novela
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capítulos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.novels.map((novel) => (
                    <tr key={novel.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {novel.titulo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {novel.genero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {novel.capitulos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {novel.año}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          novel.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {novel.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditNovel(novel)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteNovel(novel.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Notificaciones del Sistema ({state.notifications.length})
              </h2>
              {state.notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar Todo
                </button>
              )}
            </div>
            
            {state.notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-gray-600">
                  Las notificaciones del sistema aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${getNotificationBgColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-700 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>Sección: {notification.section}</span>
                            <span>Acción: {notification.action}</span>
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingZone ? 'Editar Zona' : 'Agregar Nueva Zona'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddZoneModal(false);
                    setEditingZone(null);
                    setZoneForm({ name: '', cost: 0, active: true });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={editingZone ? handleUpdateZone : handleAddZone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Zona
                  </label>
                  <input
                    type="text"
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Habana > Centro Habana > Cayo Hueso"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo de Entrega (CUP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={zoneForm.cost}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={zoneForm.active}
                    onChange={(e) => setZoneForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Zona activa
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddZoneModal(false);
                      setEditingZone(null);
                      setZoneForm({ name: '', cost: 0, active: true });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingZone ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Novel Modal */}
      {showAddNovelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingNovel ? 'Editar Novela' : 'Agregar Nueva Novela'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddNovelModal(false);
                    setEditingNovel(null);
                    setNovelForm({
                      titulo: '',
                      genero: '',
                      capitulos: 0,
                      año: new Date().getFullYear(),
                      descripcion: '',
                      active: true
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={editingNovel ? handleUpdateNovel : handleAddNovel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={novelForm.titulo}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Drama, Romance, Acción"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Capítulos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={novelForm.capitulos}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, capitulos: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={novelForm.año}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    value={novelForm.descripcion}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Breve descripción de la novela..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="novelActive"
                    checked={novelForm.active}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="novelActive" className="ml-2 block text-sm text-gray-900">
                    Novela activa
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddNovelModal(false);
                      setEditingNovel(null);
                      setNovelForm({
                        titulo: '',
                        genero: '',
                        capitulos: 0,
                        año: new Date().getFullYear(),
                        descripcion: '',
                        active: true
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingNovel ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}