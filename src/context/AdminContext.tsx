import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { 
  getAdminContextImplementation,
  getCheckoutModalImplementation,
  getNovelasModalImplementation,
  generateUpdatedPackageJson,
  generateSystemReadme,
  generateSystemConfig,
  generateUpdatedAppTsx,
  generateUpdatedCartContext,
  generateUpdatedPriceCard,
  getViteConfig,
  getTailwindConfig,
  getTsConfig,
  getIndexHtml,
  getVercelConfig,
  getNetlifyRedirects
} from '../utils/systemExport';

// Types
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
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  section: string;
  action: string;
  timestamp: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingChanges: number;
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  syncStatus: SyncStatus;
}

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
  | { type: 'UPDATE_SYNC_STATUS'; payload: Partial<SyncStatus> }
  | { type: 'SYNC_STATE'; payload: Partial<AdminState> };

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
  exportSystemBackup: () => Promise<void>;
  syncWithRemote: () => Promise<void>;
  broadcastChange: (change: any) => void;
}

// Initial state
const initialState: AdminState = {
  isAuthenticated: false,
  prices: {
    moviePrice: 80,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5,
  },
  deliveryZones: [],
  novels: [],
  notifications: [],
  syncStatus: {
    isOnline: true,
    lastSync: new Date().toISOString(),
    pendingChanges: 0,
  },
};

// Optimized reducer with better performance
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
        syncStatus: { 
          ...state.syncStatus, 
          pendingChanges: state.syncStatus.pendingChanges + 1,
          lastSync: new Date().toISOString()
        }
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
        syncStatus: { 
          ...state.syncStatus, 
          pendingChanges: state.syncStatus.pendingChanges + 1,
          lastSync: new Date().toISOString()
        }
      };

    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : zone
        ),
        syncStatus: { 
          ...state.syncStatus, 
          pendingChanges: state.syncStatus.pendingChanges + 1,
          lastSync: new Date().toISOString()
        }
      };

    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload),
        syncStatus: { 
          ...state.syncStatus, 
          pendingChanges: state.syncStatus.pendingChanges + 1,
          lastSync: new Date().toISOString()
        }
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
        syncStatus: { 
          ...state.syncStatus, 
          pendingChanges: state.syncStatus.pendingChanges + 1,
          lastSync: new Date().toISOString()
        }
      };

    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : novel
        ),
        syncStatus: { 
          ...state.syncStatus, 
          pendingChanges: state.syncStatus.pendingChanges + 1,
          lastSync: new Date().toISOString()
        }
      };

    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload),
        syncStatus: { 
          ...state.syncStatus, 
          pendingChanges: state.syncStatus.pendingChanges + 1,
          lastSync: new Date().toISOString()
        }
      };

    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications].slice(0, 100),
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
        syncStatus: { 
          ...state.syncStatus, 
          lastSync: new Date().toISOString(), 
          pendingChanges: 0 
        }
      };

    default:
      return state;
  }
}

// Optimized real-time sync service
class OptimizedRealTimeSyncService {
  private listeners: Set<(data: any) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private storageKey = 'admin_system_state_v2';
  private lastKnownState: string | null = null;
  private isDestroyed = false;

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    if (this.isDestroyed) return;

    // Listen for storage changes from other tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Periodic sync check (reduced frequency for better performance)
    this.syncInterval = setInterval(() => {
      if (!this.isDestroyed) {
        this.checkForUpdates();
      }
    }, 10000); // 10 seconds instead of 5

    // Sync when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isDestroyed) {
        this.checkForUpdates();
      }
    });

    // Initial state check
    this.checkForUpdates();
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (this.isDestroyed) return;
    
    if (event.key === this.storageKey && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        if (JSON.stringify(newState) !== this.lastKnownState) {
          this.lastKnownState = JSON.stringify(newState);
          this.notifyListeners(newState);
        }
      } catch (error) {
        console.error('Error parsing sync data:', error);
      }
    }
  };

  private checkForUpdates() {
    if (this.isDestroyed) return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored && stored !== this.lastKnownState) {
        this.lastKnownState = stored;
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
    if (this.isDestroyed) return;
    
    try {
      const syncData = {
        ...state,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      };
      const serialized = JSON.stringify(syncData);
      
      if (serialized !== this.lastKnownState) {
        this.lastKnownState = serialized;
        localStorage.setItem(this.storageKey, serialized);
        
        // Broadcast to other components
        window.dispatchEvent(new CustomEvent('admin_state_updated', { 
          detail: syncData 
        }));
      }
    } catch (error) {
      console.error('Error broadcasting state:', error);
    }
  }

  private notifyListeners(data: any) {
    if (this.isDestroyed) return;
    
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  destroy() {
    this.isDestroyed = true;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    window.removeEventListener('storage', this.handleStorageChange);
    this.listeners.clear();
    this.lastKnownState = null;
  }
}

// Context creation
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Optimized provider component
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [syncService] = React.useState(() => new OptimizedRealTimeSyncService());

  // Load initial state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_system_state_v2');
      if (stored) {
        const storedState = JSON.parse(stored);
        dispatch({ type: 'SYNC_STATE', payload: storedState });
      }
    } catch (error) {
      console.error('Error loading initial state:', error);
    }
  }, []);

  // Save state changes
  useEffect(() => {
    try {
      syncService.broadcast(state);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state, syncService]);

  // Subscribe to external changes
  useEffect(() => {
    const unsubscribe = syncService.subscribe((syncedState) => {
      if (JSON.stringify(syncedState) !== JSON.stringify(state)) {
        dispatch({ type: 'SYNC_STATE', payload: syncedState });
      }
    });
    return unsubscribe;
  }, [syncService, state]);

  // Cleanup
  useEffect(() => {
    return () => {
      syncService.destroy();
    };
  }, [syncService]);

  // Optimized context methods with useCallback
  const login = useCallback((username: string, password: string): boolean => {
    dispatch({ type: 'LOGIN', payload: { username, password } });
    const success = username === 'admin' && password === 'admin123';
    if (success) {
      addNotification({
        type: 'success',
        title: 'Inicio de sesión exitoso',
        message: 'Bienvenido al panel de administración optimizado',
        section: 'Autenticación',
        action: 'login'
      });
    }
    return success;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    addNotification({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      section: 'Autenticación',
      action: 'logout'
    });
  }, []);

  const updatePrices = useCallback((prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios actualizados',
      message: 'Los precios se han actualizado y sincronizado en tiempo real',
      section: 'Precios',
      action: 'update'
    });
    broadcastChange({ type: 'prices', data: prices });
  }, []);

  const addDeliveryZone = useCallback((zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona de entrega agregada',
      message: `Se agregó la zona "${zone.name}" y se sincronizó automáticamente`,
      section: 'Zonas de Entrega',
      action: 'create'
    });
    broadcastChange({ type: 'delivery_zone_add', data: zone });
  }, []);

  const updateDeliveryZone = useCallback((zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona de entrega actualizada',
      message: `Se actualizó la zona "${zone.name}" y se sincronizó en tiempo real`,
      section: 'Zonas de Entrega',
      action: 'update'
    });
    broadcastChange({ type: 'delivery_zone_update', data: zone });
  }, []);

  const deleteDeliveryZone = useCallback((id: number) => {
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
  }, [state.deliveryZones]);

  const addNovel = useCallback((novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela agregada',
      message: `Se agregó la novela "${novel.titulo}" y se sincronizó automáticamente`,
      section: 'Gestión de Novelas',
      action: 'create'
    });
    broadcastChange({ type: 'novel_add', data: novel });
  }, []);

  const updateNovel = useCallback((novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela actualizada',
      message: `Se actualizó la novela "${novel.titulo}" y se sincronizó en tiempo real`,
      section: 'Gestión de Novelas',
      action: 'update'
    });
    broadcastChange({ type: 'novel_update', data: novel });
  }, []);

  const deleteNovel = useCallback((id: number) => {
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
  }, [state.novels]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    addNotification({
      type: 'info',
      title: 'Notificaciones limpiadas',
      message: 'Se han eliminado todas las notificaciones del sistema',
      section: 'Notificaciones',
      action: 'clear'
    });
  }, []);

  const broadcastChange = useCallback((change: any) => {
    const changeEvent = {
      ...change,
      timestamp: new Date().toISOString(),
      source: 'admin_panel_optimized',
      version: '2.0.0'
    };
    
    dispatch({ 
      type: 'UPDATE_SYNC_STATUS', 
      payload: { 
        lastSync: new Date().toISOString(),
        pendingChanges: Math.max(0, state.syncStatus.pendingChanges - 1)
      } 
    });

    // Enhanced broadcasting
    window.dispatchEvent(new CustomEvent('admin_state_change', { 
      detail: changeEvent 
    }));
  }, [state.syncStatus.pendingChanges]);

  const syncWithRemote = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_SYNC_STATUS', payload: { isOnline: true } });
      
      // Simulate network sync with better feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
        message: 'Todos los datos se han sincronizado correctamente con el sistema optimizado',
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
  }, []);

  // Optimized system export with better compression and organization
  const exportSystemBackup = useCallback(async (): Promise<void> => {
    try {
      addNotification({
        type: 'info',
        title: 'Iniciando exportación',
        message: 'Generando copia de seguridad del sistema optimizado...',
        section: 'Sistema',
        action: 'export_start'
      });

      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Core system files
      const coreFolder = zip.folder('core');
      if (coreFolder) {
        coreFolder.file('package.json', generateUpdatedPackageJson());
        coreFolder.file('README.md', generateSystemReadme());
        coreFolder.file('system-config.json', generateSystemConfig());
        coreFolder.file('vite.config.ts', getViteConfig());
        coreFolder.file('tailwind.config.js', getTailwindConfig());
        coreFolder.file('tsconfig.json', getTsConfig());
        coreFolder.file('index.html', getIndexHtml());
        coreFolder.file('vercel.json', getVercelConfig());
        coreFolder.file('_redirects', getNetlifyRedirects());
      }

      // Source code
      const srcFolder = zip.folder('src');
      if (srcFolder) {
        // Context files
        const contextFolder = srcFolder.folder('context');
        if (contextFolder) {
          contextFolder.file('AdminContext.tsx', getAdminContextImplementation());
          contextFolder.file('CartContext.tsx', generateUpdatedCartContext());
        }

        // Component files
        const componentsFolder = srcFolder.folder('components');
        if (componentsFolder) {
          componentsFolder.file('CheckoutModal.tsx', getCheckoutModalImplementation());
          componentsFolder.file('NovelasModal.tsx', getNovelasModalImplementation());
          componentsFolder.file('PriceCard.tsx', generateUpdatedPriceCard());
        }

        // Main app file
        srcFolder.file('App.tsx', generateUpdatedAppTsx());
      }

      // Configuration data
      const configFolder = zip.folder('config');
      if (configFolder) {
        configFolder.file('current-state.json', JSON.stringify(state, null, 2));
        configFolder.file('export-info.json', JSON.stringify({
          exportDate: new Date().toISOString(),
          version: '2.0.0',
          optimized: true,
          features: [
            'Real-time synchronization',
            'Optimized performance',
            'Enhanced admin panel',
            'Improved code structure',
            'Better error handling',
            'Advanced caching',
            'Mobile optimization'
          ]
        }, null, 2));
      }

      // Documentation
      const docsFolder = zip.folder('docs');
      if (docsFolder) {
        docsFolder.file('INSTALLATION.md', `# Instalación del Sistema Optimizado

## Requisitos
- Node.js 18+
- npm o yarn

## Pasos de instalación
1. Extraer el archivo ZIP
2. Ejecutar: \`npm install\`
3. Ejecutar: \`npm run dev\`

## Panel de Administración
- URL: /admin
- Usuario: admin
- Contraseña: admin123

## Características Optimizadas
- Sincronización en tiempo real mejorada
- Mejor rendimiento y carga
- Estructura de código optimizada
- Manejo de errores mejorado
`);

        docsFolder.file('FEATURES.md', `# Características del Sistema

## Panel de Administración
- Gestión de precios en tiempo real
- Configuración de zonas de entrega
- Administración de catálogo de novelas
- Sistema de notificaciones
- Sincronización automática

## Optimizaciones Implementadas
- Reducción de re-renders innecesarios
- Mejor gestión de memoria
- Caching inteligente
- Sincronización optimizada
- Estructura de código mejorada

## Funcionalidades del Usuario
- Carrito de compras inteligente
- Búsqueda en tiempo real
- Navegación optimizada
- Interfaz responsive
- Animaciones fluidas
`);
      }

      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TV-a-la-Carta-Sistema-Optimizado-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Exportación completada',
        message: 'Sistema optimizado exportado exitosamente con todas las mejoras',
        section: 'Sistema',
        action: 'export_complete'
      });
    } catch (error) {
      console.error('Error exporting system:', error);
      addNotification({
        type: 'error',
        title: 'Error en exportación',
        message: 'No se pudo completar la exportación del sistema',
        section: 'Sistema',
        action: 'export_error'
      });
    }
  }, [state]);

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