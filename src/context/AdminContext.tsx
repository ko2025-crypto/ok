import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// Interfaces
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
  updatedAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
  lastBackup: string | null;
  syncStatus: {
    isOnline: boolean;
    lastSync: string | null;
    pendingChanges: number;
  };
}

// Actions
type AdminAction =
  | { type: 'LOGIN'; payload: { username: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SYNC_STATUS'; payload: Partial<AdminState['syncStatus']> }
  | { type: 'SYNC_STATE'; payload: Partial<AdminState> };

// Context
interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => void;
  syncWithRemote: () => Promise<void>;
  broadcastChange: (change: any) => void;
}

// Initial state
const initialState: AdminState = {
  isAuthenticated: false,
  prices: {
    moviePrice: 801,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5,
  },
  deliveryZones: [
  {
    "name": "123",
    "cost": 1,
    "active": true,
    "id": 1756230281051,
    "createdAt": "2025-08-26T17:44:41.051Z",
    "updatedAt": "2025-08-26T17:44:41.051Z"
  }
],
  novels: [
  {
    "titulo": "1",
    "genero": "1",
    "capitulos": 1,
    "año": 2025,
    "descripcion": "",
    "active": true,
    "id": 1756230290435,
    "createdAt": "2025-08-26T17:44:50.435Z",
    "updatedAt": "2025-08-26T17:44:50.435Z"
  }
],
  notifications: [],
  lastBackup: null,
  syncStatus: {
    isOnline: true,
    lastSync: null,
    pendingChanges: 0,
  },
};

// Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      if (action.payload.username === 'admin' && action.payload.password === 'admin123') {
        return { ...state, isAuthenticated: true };
      }
      return state;

    case 'LOGOUT':
      return { ...state, isAuthenticated: false };

    case 'UPDATE_PRICES':
      return {
        ...state,
        prices: action.payload,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'ADD_DELIVERY_ZONE':
      const newZone: DeliveryZone = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        deliveryZones: [...state.deliveryZones, newZone],
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : zone
        ),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'ADD_NOVEL':
      const newNovel: Novel = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        novels: [...state.novels, newNovel],
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : novel
        ),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications].slice(0, 100), // Keep only last 100
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'UPDATE_SYNC_STATUS':
      return {
        ...state,
        syncStatus: { ...state.syncStatus, ...action.payload },
      };

    case 'SYNC_STATE':
      return {
        ...state,
        ...action.payload,
        syncStatus: { ...state.syncStatus, lastSync: new Date().toISOString(), pendingChanges: 0 }
      };

    default:
      return state;
  }
}

// Context creation
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Real-time sync service
class RealTimeSyncService {
  private listeners: Set<(data: any) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private storageKey = 'admin_system_state';

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Periodic sync every 5 seconds
    this.syncInterval = setInterval(() => {
      this.checkForUpdates();
    }, 5000);

    // Sync on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === this.storageKey && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        this.notifyListeners(newState);
      } catch (error) {
        console.error('Error parsing sync data:', error);
      }
    }
  }

  private checkForUpdates() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const storedState = JSON.parse(stored);
        this.notifyListeners(storedState);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcast(state: AdminState) {
    try {
      const syncData = {
        ...state,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(syncData));
      
      // Notify all listeners
      this.notifyListeners(syncData);
    } catch (error) {
      console.error('Error broadcasting state:', error);
    }
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    this.listeners.clear();
  }
}

// Provider component
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [syncService] = React.useState(() => new RealTimeSyncService());

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_system_state');
      if (stored) {
        const storedState = JSON.parse(stored);
        dispatch({ type: 'SYNC_STATE', payload: storedState });
      }
    } catch (error) {
      console.error('Error loading initial state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('admin_system_state', JSON.stringify(state));
      syncService.broadcast(state);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state, syncService]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = syncService.subscribe((syncedState) => {
      // Only sync if the state is different
      if (JSON.stringify(syncedState) !== JSON.stringify(state)) {
        dispatch({ type: 'SYNC_STATE', payload: syncedState });
      }
    });

    return unsubscribe;
  }, [syncService, state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      syncService.destroy();
    };
  }, [syncService]);

  // Context methods
  const login = (username: string, password: string): boolean => {
    dispatch({ type: 'LOGIN', payload: { username, password } });
    const success = username === 'admin' && password === 'admin123';
    if (success) {
      addNotification({
        type: 'success',
        title: 'Inicio de sesión exitoso',
        message: 'Bienvenido al panel de administración',
        section: 'Autenticación',
        action: 'login'
      });
    }
    return success;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    addNotification({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      section: 'Autenticación',
      action: 'logout'
    });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios actualizados',
      message: `Precios actualizados: Películas $${prices.moviePrice} CUP, Series $${prices.seriesPrice} CUP, Transferencia ${prices.transferFeePercentage}%, Novelas $${prices.novelPricePerChapter} CUP/cap. Sincronizado en tiempo real en CheckoutModal.tsx, NovelasModal.tsx y PriceCard.tsx`,
      section: 'Precios',
      action: 'update'
    });
    broadcastChange({ type: 'prices', data: prices });
  };

  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona de entrega agregada',
      message: `Nueva zona agregada: "${zone.name}" con costo $${zone.cost} CUP. Sincronizada automáticamente en CheckoutModal.tsx y disponible para todos los pedidos`,
      section: 'Zonas de Entrega',
      action: 'create'
    });
    broadcastChange({ type: 'delivery_zone_add', data: zone });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona de entrega actualizada',
      message: `Zona actualizada: "${zone.name}" ahora cuesta $${zone.cost} CUP. Cambios aplicados en tiempo real en CheckoutModal.tsx`,
      section: 'Zonas de Entrega',
      action: 'update'
    });
    broadcastChange({ type: 'delivery_zone_update', data: zone });
  };

  const deleteDeliveryZone = (id: number) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    addNotification({
      type: 'warning',
      title: 'Zona de entrega eliminada',
      message: `Zona eliminada: "${zone?.name || 'Desconocida'}". Removida automáticamente de CheckoutModal.tsx y ya no está disponible para nuevos pedidos`,
      section: 'Zonas de Entrega',
      action: 'delete'
    });
    broadcastChange({ type: 'delivery_zone_delete', data: { id } });
  };

  const addNovel = (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela agregada',
      message: `Nueva novela agregada: "${novel.titulo}" (${novel.año}) - ${novel.capitulos} capítulos, género ${novel.genero}. Costo: $${novel.capitulos * state.prices.novelPricePerChapter} CUP. Sincronizada en NovelasModal.tsx`,
      section: 'Gestión de Novelas',
      action: 'create'
    });
    broadcastChange({ type: 'novel_add', data: novel });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela actualizada',
      message: `Novela actualizada: "${novel.titulo}" - ${novel.capitulos} capítulos, ${novel.genero} (${novel.año}). Nuevo costo: $${novel.capitulos * state.prices.novelPricePerChapter} CUP. Cambios aplicados en NovelasModal.tsx`,
      section: 'Gestión de Novelas',
      action: 'update'
    });
    broadcastChange({ type: 'novel_update', data: novel });
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    addNotification({
      type: 'warning',
      title: 'Novela eliminada',
      message: `Novela eliminada: "${novel?.titulo || 'Desconocida'}" (${novel?.capitulos || 0} capítulos). Removida automáticamente del catálogo en NovelasModal.tsx`,
      section: 'Gestión de Novelas',
      action: 'delete'
    });
    broadcastChange({ type: 'novel_delete', data: { id } });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    addNotification({
      type: 'info',
      title: 'Notificaciones limpiadas',
      message: 'Se han eliminado todas las notificaciones del sistema',
      section: 'Notificaciones',
      action: 'clear'
    });
  };

  const broadcastChange = (change: any) => {
    // Broadcast change to all connected clients
    const changeEvent = {
      ...change,
      timestamp: new Date().toISOString(),
      source: 'admin_panel'
    };
    
    // Update sync status
    dispatch({ 
      type: 'UPDATE_SYNC_STATUS', 
      payload: { 
        lastSync: new Date().toISOString(),
        pendingChanges: Math.max(0, state.syncStatus.pendingChanges - 1)
      } 
    });

    // Emit custom event for real-time updates
    window.dispatchEvent(new CustomEvent('admin_state_change', { 
      detail: changeEvent 
    }));
  };

  const syncWithRemote = async (): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_SYNC_STATUS', payload: { isOnline: true } });
      
      // Simulate remote sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ 
        type: 'UPDATE_SYNC_STATUS', 
        payload: { 
          lastSync: new Date().toISOString(),
          pendingChanges: 0
        } 
      });

      addNotification({
        type: 'success',
        title: 'Sincronización completada',
        message: 'Todos los datos se han sincronizado correctamente con el sistema',
        section: 'Sistema',
        action: 'sync'
      });
    } catch (error) {
      dispatch({ type: 'UPDATE_SYNC_STATUS', payload: { isOnline: false } });
      addNotification({
        type: 'error',
        title: 'Error de sincronización',
        message: 'No se pudo sincronizar con el servidor remoto',
        section: 'Sistema',
        action: 'sync_error'
      });
    }
  };

  const exportSystemBackup = async () => {
    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Crear estructura de carpetas completa
      const srcFolder = zip.folder('src');
      const componentsFolder = srcFolder!.folder('components');
      const contextFolder = srcFolder!.folder('context');
      const pagesFolder = srcFolder!.folder('pages');
      const servicesFolder = srcFolder!.folder('services');
      const utilsFolder = srcFolder!.folder('utils');
      const hooksFolder = srcFolder!.folder('hooks');
      const typesFolder = srcFolder!.folder('types');
      const configFolder = srcFolder!.folder('config');
      const publicFolder = zip.folder('public');

      // Generar AdminContext.tsx con estado actual sincronizado
      const adminContextContent = `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// Interfaces
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
  updatedAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
  lastBackup: string | null;
  syncStatus: {
    isOnline: boolean;
    lastSync: string | null;
    pendingChanges: number;
  };
}

// Actions
type AdminAction =
  | { type: 'LOGIN'; payload: { username: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SYNC_STATUS'; payload: Partial<AdminState['syncStatus']> }
  | { type: 'SYNC_STATE'; payload: Partial<AdminState> };

// Context
interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => void;
  syncWithRemote: () => Promise<void>;
  broadcastChange: (change: any) => void;
}

// Initial state with current synchronized data
const initialState: AdminState = {
  isAuthenticated: false,
  prices: ${JSON.stringify(state.prices, null, 4)},
  deliveryZones: ${JSON.stringify(state.deliveryZones, null, 4)},
  novels: ${JSON.stringify(state.novels, null, 4)},
  notifications: [],
  lastBackup: null,
  syncStatus: {
    isOnline: true,
    lastSync: null,
    pendingChanges: 0,
  },
};

// [Resto del código del reducer y provider...]
${getAdminContextImplementation()}
`;

      // Generar CheckoutModal.tsx con zonas de entrega actualizadas
      const checkoutModalContent = `import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
}

export interface OrderData {
  orderId: string;
  customerInfo: CustomerInfo;
  deliveryZone: string;
  deliveryCost: number;
  items: any[];
  subtotal: number;
  transferFee: number;
  total: number;
  cashTotal?: number;
  transferTotal?: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: OrderData) => void;
  items: any[];
  total: number;
}

// Base delivery zones - synchronized with admin panel
const BASE_DELIVERY_ZONES = {
  'Por favor seleccionar su Barrio/Zona': 0,
  'Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre': 100,
  'Santiago de Cuba > Santiago de Cuba > Vista Alegre': 300,
  'Santiago de Cuba > Santiago de Cuba > Reparto Sueño': 250,
  'Santiago de Cuba > Santiago de Cuba > San Pedrito': 150,
  'Santiago de Cuba > Santiago de Cuba > Altamira': 300,
  'Santiago de Cuba > Santiago de Cuba > Micro 7, 8 , 9': 150,
  'Santiago de Cuba > Santiago de Cuba > Alameda': 150,
  'Santiago de Cuba > Santiago de Cuba > El Caney': 800,
  'Santiago de Cuba > Santiago de Cuba > Quintero': 200,
  'Santiago de Cuba > Santiago de Cuba > Marimon': 100,
  'Santiago de Cuba > Santiago de Cuba > Los cangrejitos': 150,
  'Santiago de Cuba > Santiago de Cuba > Trocha': 200,
  'Santiago de Cuba > Santiago de Cuba > Versalles': 800,
  'Santiago de Cuba > Santiago de Cuba > Reparto Portuondo': 600,
  'Santiago de Cuba > Santiago de Cuba > 30 de Noviembre': 600,
  'Santiago de Cuba > Santiago de Cuba > Rajayoga': 800,
  'Santiago de Cuba > Santiago de Cuba > Antonio Maceo': 600,
  'Santiago de Cuba > Santiago de Cuba > Los Pinos': 200,
  'Santiago de Cuba > Santiago de Cuba > Distrito José Martí': 100,
  'Santiago de Cuba > Santiago de Cuba > Cobre': 800,
  'Santiago de Cuba > Santiago de Cuba > El Parque Céspedes': 200,
  'Santiago de Cuba > Santiago de Cuba > Carretera del Morro': 300,
${state.deliveryZones.map(zone => `  '${zone.name}': ${zone.cost},`).join('\n')}
};

${getCheckoutModalImplementation()}
`;

      // Generar NovelasModal.tsx con novelas actualizadas
      const novelasModalContent = `import React, { useState, useEffect } from 'react';
import { X, Download, MessageCircle, Phone, BookOpen, Info, Check, DollarSign, CreditCard, Calculator, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

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

  // Get novels and prices from admin context with real-time updates
  const adminNovels = adminContext?.state?.novels || [];
  const novelPricePerChapter = adminContext?.state?.prices?.novelPricePerChapter || ${state.prices.novelPricePerChapter};
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || ${state.prices.transferFeePercentage};
  
  // Base novels list with current admin novels synchronized
  const defaultNovelas: Novela[] = [
    { id: 1, titulo: "Corazón Salvaje", genero: "Drama/Romance", capitulos: 185, año: 2009 },
    { id: 2, titulo: "La Usurpadora", genero: "Drama/Melodrama", capitulos: 98, año: 1998 },
    { id: 3, titulo: "María la del Barrio", genero: "Drama/Romance", capitulos: 73, año: 1995 },
    { id: 4, titulo: "Marimar", genero: "Drama/Romance", capitulos: 63, año: 1994 },
    { id: 5, titulo: "Rosalinda", genero: "Drama/Romance", capitulos: 80, año: 1999 },
    { id: 6, titulo: "La Madrastra", genero: "Drama/Suspenso", capitulos: 135, año: 2005 },
    { id: 7, titulo: "Rubí", genero: "Drama/Melodrama", capitulos: 115, año: 2004 },
    { id: 8, titulo: "Pasión de Gavilanes", genero: "Drama/Romance", capitulos: 188, año: 2003 },
    { id: 9, titulo: "Yo Soy Betty, la Fea", genero: "Comedia/Romance", capitulos: 335, año: 1999 },
    { id: 10, titulo: "El Cuerpo del Deseo", genero: "Drama/Fantasía", capitulos: 178, año: 2005 },
    { id: 11, titulo: "La Reina del Sur", genero: "Drama/Acción", capitulos: 63, año: 2011 },
    { id: 12, titulo: "Sin Senos Sí Hay Paraíso", genero: "Drama/Acción", capitulos: 91, año: 2016 },
    { id: 13, titulo: "El Señor de los Cielos", genero: "Drama/Acción", capitulos: 81, año: 2013 },
    { id: 14, titulo: "La Casa de las Flores", genero: "Comedia/Drama", capitulos: 33, año: 2018 },
    { id: 15, titulo: "Rebelde", genero: "Drama/Musical", capitulos: 440, año: 2004 },
    { id: 16, titulo: "Amigas y Rivales", genero: "Drama/Romance", capitulos: 185, año: 2001 },
    { id: 17, titulo: "Clase 406", genero: "Drama/Juvenil", capitulos: 344, año: 2002 },
    { id: 18, titulo: "Destilando Amor", genero: "Drama/Romance", capitulos: 171, año: 2007 },
    { id: 19, titulo: "Fuego en la Sangre", genero: "Drama/Romance", capitulos: 233, año: 2008 },
    { id: 20, titulo: "Teresa", genero: "Drama/Melodrama", capitulos: 152, año: 2010 },
    { id: 21, titulo: "Triunfo del Amor", genero: "Drama/Romance", capitulos: 176, año: 2010 },
    { id: 22, titulo: "Una Familia con Suerte", genero: "Comedia/Drama", capitulos: 357, año: 2011 },
    { id: 23, titulo: "Amores Verdaderos", genero: "Drama/Romance", capitulos: 181, año: 2012 },
    { id: 24, titulo: "De Que Te Quiero, Te Quiero", genero: "Comedia/Romance", capitulos: 181, año: 2013 },
    { id: 25, titulo: "Lo Que la Vida Me Robó", genero: "Drama/Romance", capitulos: 221, año: 2013 },
    { id: 26, titulo: "La Gata", genero: "Drama/Romance", capitulos: 135, año: 2014 },
    { id: 27, titulo: "Hasta el Fin del Mundo", genero: "Drama/Romance", capitulos: 177, año: 2014 },
    { id: 28, titulo: "Yo No Creo en los Hombres", genero: "Drama/Romance", capitulos: 142, año: 2014 },
    { id: 29, titulo: "La Malquerida", genero: "Drama/Romance", capitulos: 121, año: 2014 },
    { id: 30, titulo: "Antes Muerta que Lichita", genero: "Comedia/Romance", capitulos: 183, año: 2015 },
    { id: 31, titulo: "A Que No Me Dejas", genero: "Drama/Romance", capitulos: 153, año: 2015 },
    { id: 32, titulo: "Simplemente María", genero: "Drama/Romance", capitulos: 155, año: 2015 },
    { id: 33, titulo: "Tres Veces Ana", genero: "Drama/Romance", capitulos: 123, año: 2016 },
    { id: 34, titulo: "La Candidata", genero: "Drama/Político", capitulos: 60, año: 2016 },
    { id: 35, titulo: "Vino el Amor", genero: "Drama/Romance", capitulos: 143, año: 2016 },
    { id: 36, titulo: "La Doble Vida de Estela Carrillo", genero: "Drama/Musical", capitulos: 95, año: 2017 },
    { id: 37, titulo: "Mi Marido Tiene Familia", genero: "Comedia/Drama", capitulos: 175, año: 2017 },
    { id: 38, titulo: "La Piloto", genero: "Drama/Acción", capitulos: 80, año: 2017 },
    { id: 39, titulo: "Caer en Tentación", genero: "Drama/Suspenso", capitulos: 92, año: 2017 },
    { id: 40, titulo: "Por Amar Sin Ley", genero: "Drama/Romance", capitulos: 123, año: 2018 },
    { id: 41, titulo: "Amar a Muerte", genero: "Drama/Fantasía", capitulos: 190, año: 2018 },
    { id: 42, titulo: "Ringo", genero: "Drama/Musical", capitulos: 90, año: 2019 },
    { id: 43, titulo: "La Usurpadora (2019)", genero: "Drama/Melodrama", capitulos: 25, año: 2019 },
    { id: 44, titulo: "100 Días para Enamorarnos", genero: "Comedia/Romance", capitulos: 104, año: 2020 },
    { id: 45, titulo: "Te Doy la Vida", genero: "Drama/Romance", capitulos: 91, año: 2020 },
    { id: 46, titulo: "Como Tú No Hay 2", genero: "Comedia/Romance", capitulos: 120, año: 2020 },
    { id: 47, titulo: "La Desalmada", genero: "Drama/Romance", capitulos: 96, año: 2021 },
    { id: 48, titulo: "Si Nos Dejan", genero: "Drama/Romance", capitulos: 93, año: 2021 },
    { id: 49, titulo: "Vencer el Pasado", genero: "Drama/Familia", capitulos: 91, año: 2021 },
    { id: 50, titulo: "La Herencia", genero: "Drama/Romance", capitulos: 74, año: 2022 }
${state.novels.map(novel => `    ,{ id: ${novel.id}, titulo: "${novel.titulo}", genero: "${novel.genero}", capitulos: ${novel.capitulos}, año: ${novel.año}${novel.descripcion ? `, descripcion: "${novel.descripcion}"` : ''} }`).join('\n')}
  ];

${getNovelasModalImplementation()}
`;

      // Incluir archivos principales con configuraciones actualizadas
      contextFolder!.file('AdminContext.tsx', adminContextContent);
      componentsFolder!.file('CheckoutModal.tsx', checkoutModalContent);
      componentsFolder!.file('NovelasModal.tsx', novelasModalContent);

      // Incluir archivos de configuración actualizados
      const packageJsonContent = generateUpdatedPackageJson();
      const appTsxContent = generateUpdatedAppTsx();
      const cartContextContent = generateUpdatedCartContext();
      const priceCardContent = generateUpdatedPriceCard();

      zip.file('package.json', packageJsonContent);
      srcFolder!.file('App.tsx', appTsxContent);
      contextFolder!.file('CartContext.tsx', cartContextContent);
      componentsFolder!.file('PriceCard.tsx', priceCardContent);

      // Incluir archivos de configuración del sistema
      zip.file('vite.config.ts', getViteConfig());
      zip.file('tailwind.config.js', getTailwindConfig());
      zip.file('tsconfig.json', getTsConfig());
      zip.file('index.html', getIndexHtml());
      zip.file('vercel.json', getVercelConfig());
      publicFolder!.file('_redirects', getNetlifyRedirects());

      // Incluir archivos de servicios y utilidades
      servicesFolder!.file('tmdb.ts', getTmdbService());
      servicesFolder!.file('contentSync.ts', getContentSyncService());
      utilsFolder!.file('whatsapp.ts', getWhatsappUtils());
      hooksFolder!.file('useContentSync.ts', getContentSyncHook());
      typesFolder!.file('movie.ts', getMovieTypes());
      configFolder!.file('api.ts', getApiConfig());

      // Incluir componentes adicionales
      componentsFolder!.file('Header.tsx', getHeaderComponent());
      componentsFolder!.file('MovieCard.tsx', getMovieCardComponent());
      componentsFolder!.file('HeroCarousel.tsx', getHeroCarouselComponent());
      componentsFolder!.file('LoadingSpinner.tsx', getLoadingSpinnerComponent());
      componentsFolder!.file('ErrorMessage.tsx', getErrorMessageComponent());
      componentsFolder!.file('Toast.tsx', getToastComponent());
      componentsFolder!.file('VideoPlayer.tsx', getVideoPlayerComponent());
      componentsFolder!.file('CastSection.tsx', getCastSectionComponent());
      componentsFolder!.file('CartAnimation.tsx', getCartAnimationComponent());

      // Incluir páginas
      pagesFolder!.file('Home.tsx', getHomePageComponent());
      pagesFolder!.file('Movies.tsx', getMoviesPageComponent());
      pagesFolder!.file('TVShows.tsx', getTVShowsPageComponent());
      pagesFolder!.file('Anime.tsx', getAnimePageComponent());
      pagesFolder!.file('Search.tsx', getSearchPageComponent());
      pagesFolder!.file('MovieDetail.tsx', getMovieDetailPageComponent());
      pagesFolder!.file('TVDetail.tsx', getTVDetailPageComponent());
      pagesFolder!.file('Cart.tsx', getCartPageComponent());
      pagesFolder!.file('AdminPanel.tsx', getAdminPanelComponent());

      // Incluir archivos de estilos
      srcFolder!.file('index.css', getIndexCss());
      srcFolder!.file('main.tsx', getMainTsx());
      srcFolder!.file('vite-env.d.ts', getViteEnvDts());

      // Incluir archivos de configuración adicionales
      zip.file('eslint.config.js', getEslintConfig());
      zip.file('postcss.config.js', getPostcssConfig());
      zip.file('tsconfig.app.json', getTsConfigApp());
      zip.file('tsconfig.node.json', getTsConfigNode());

      // Incluir README con información del sistema
      const readmeContent = generateSystemReadme();
      zip.file('README.md', readmeContent);

      // Incluir archivo de configuración del sistema exportado
      const systemConfigContent = generateSystemConfig();
      zip.file('system-config.json', systemConfigContent);
      
      // Generar y descargar el ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-sistema-completo-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last backup timestamp
      dispatch({ 
        type: 'SYNC_STATE', 
        payload: { lastBackup: new Date().toISOString() } 
      });

      addNotification({
        type: 'success',
        title: 'Sistema exportado exitosamente',
        message: `Sistema completo exportado con todas las configuraciones actuales sincronizadas. Incluye: AdminContext.tsx, CheckoutModal.tsx, NovelasModal.tsx y todos los archivos del proyecto. Archivo: tv-a-la-carta-sistema-completo-${timestamp}.zip`,
        section: 'Sistema',
        action: 'export'
      });
    } catch (error) {
      console.error('Error exporting system:', error);
      addNotification({
        type: 'error',
        title: 'Error al exportar',
        message: 'No se pudo exportar el sistema completo. Verifique el espacio disponible e intente nuevamente.',
        section: 'Sistema',
        action: 'export_error'
      });
    }
  };

  return (
    <AdminContext.Provider
      value={{
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
        addNotification,
        clearNotifications,
        exportSystemBackup,
        syncWithRemote,
        broadcastChange,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export { AdminContext };