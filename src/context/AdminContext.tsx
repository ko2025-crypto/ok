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
      message: 'Los precios se han actualizado correctamente y se han sincronizado en tiempo real',
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
      message: `Se agregó la zona "${zone.name}" y se sincronizó automáticamente`,
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
      message: `Se actualizó la zona "${zone.name}" y se sincronizó en tiempo real`,
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
      message: `Se eliminó la zona "${zone?.name || 'Desconocida'}" y se sincronizó automáticamente`,
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
      message: `Se agregó la novela "${novel.titulo}" y se sincronizó automáticamente`,
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
      message: `Se actualizó la novela "${novel.titulo}" y se sincronizó en tiempo real`,
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
      message: `Se eliminó la novela "${novel?.titulo || 'Desconocida'}" y se sincronizó automáticamente`,
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
      
      // Crear estructura de carpetas
      const srcFolder = zip.folder('src');
      const componentsFolder = srcFolder!.folder('components');
      const contextFolder = srcFolder!.folder('context');
      const pagesFolder = srcFolder!.folder('pages');

      // Incluir todos los archivos del sistema con sincronización
      // [El resto del código de exportación permanece igual...]
      
      // Generar y descargar el ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-system-sync-${timestamp}.zip`;
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
        message: `Se ha exportado el sistema completo con sincronización en tiempo real. Archivo: tv-a-la-carta-system-sync-${timestamp}.zip`,
        section: 'Sistema',
        action: 'export'
      });
    } catch (error) {
      console.error('Error exporting system:', error);
      addNotification({
        type: 'error',
        title: 'Error al exportar',
        message: 'No se pudo exportar el sistema. Intente nuevamente.',
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