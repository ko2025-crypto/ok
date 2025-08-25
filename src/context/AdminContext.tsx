import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
  prices: {
    moviePrice: 5,
    seriesPrice: 8,
    transferFeePercentage: 3,
    novelPricePerChapter: 2
  },
  deliveryZones: [],
  novels: [],
  notifications: []
};

type AdminAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Novel }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LAST_BACKUP'; payload: string };

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICES':
      return { ...state, prices: action.payload };
    case 'ADD_DELIVERY_ZONE':
      return { ...state, deliveryZones: [...state.deliveryZones, action.payload] };
    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id ? action.payload : zone
        )
      };
    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload)
      };
    case 'ADD_NOVEL':
      return { ...state, novels: [...state.novels, action.payload] };
    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id ? action.payload : novel
        )
      };
    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_LAST_BACKUP':
      return { ...state, lastBackup: action.payload };
    default:
      return state;
  }
}

export const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  login: () => void;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => void;
} | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const login = () => {
    dispatch({ type: 'LOGIN' });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios Actualizados',
      message: `Película: $${prices.moviePrice} CUP, Serie: $${prices.seriesPrice} CUP, Transferencia: ${prices.transferFeePercentage}%, Novela: $${prices.novelPricePerChapter} CUP/cap`,
      section: 'Precios',
      action: 'Actualizar'
    });
  };

  const addDeliveryZone = (zoneData: Omit<DeliveryZone, 'id' | 'createdAt'>) => {
    const newZone: DeliveryZone = {
      ...zoneData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: newZone });
    addNotification({
      type: 'success',
      title: 'Zona de Entrega Agregada',
      message: `Nueva zona "${zoneData.name}" con costo de $${zoneData.cost} CUP`,
      section: 'Zonas de Entrega',
      action: 'Agregar'
    });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'info',
      title: 'Zona de Entrega Actualizada',
      message: `Zona "${zone.name}" actualizada con costo de $${zone.cost} CUP`,
      section: 'Zonas de Entrega',
      action: 'Actualizar'
    });
  };

  const deleteDeliveryZone = (id: number) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    if (zone) {
      addNotification({
        type: 'warning',
        title: 'Zona de Entrega Eliminada',
        message: `Zona "${zone.name}" ha sido eliminada del sistema`,
        section: 'Zonas de Entrega',
        action: 'Eliminar'
      });
    }
  };

  const addNovel = (novelData: Omit<Novel, 'id'>) => {
    const newNovel: Novel = {
      ...novelData,
      id: Date.now()
    };
    dispatch({ type: 'ADD_NOVEL', payload: newNovel });
    addNotification({
      type: 'success',
      title: 'Novela Agregada',
      message: `"${novelData.titulo}" (${novelData.capitulos} caps) agregada al catálogo`,
      section: 'Novelas',
      action: 'Agregar'
    });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'info',
      title: 'Novela Actualizada',
      message: `"${novel.titulo}" ha sido actualizada en el catálogo`,
      section: 'Novelas',
      action: 'Actualizar'
    });
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    if (novel) {
      addNotification({
        type: 'warning',
        title: 'Novela Eliminada',
        message: `"${novel.titulo}" ha sido eliminada del catálogo`,
        section: 'Novelas',
        action: 'Eliminar'
      });
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    addNotification({
      type: 'info',
      title: 'Notificaciones Limpiadas',
      message: 'Todas las notificaciones han sido eliminadas',
      section: 'Sistema',
      action: 'Limpiar'
    });
  };

  const exportSystemBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        data: {
          prices: state.prices,
          deliveryZones: state.deliveryZones,
          novels: state.novels,
          notifications: state.notifications
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch({ type: 'SET_LAST_BACKUP', payload: new Date().toISOString() });
      
      addNotification({
        type: 'success',
        title: 'Backup Exportado',
        message: 'El respaldo del sistema ha sido descargado exitosamente',
        section: 'Sistema',
        action: 'Exportar'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en Backup',
        message: 'No se pudo exportar el respaldo del sistema',
        section: 'Sistema',
        action: 'Exportar'
      });
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.prices) {
          dispatch({ type: 'UPDATE_PRICES', payload: parsedData.prices });
        }
        if (parsedData.deliveryZones) {
          parsedData.deliveryZones.forEach((zone: DeliveryZone) => {
            dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
          });
        }
        if (parsedData.novels) {
          parsedData.novels.forEach((novel: Novel) => {
            dispatch({ type: 'ADD_NOVEL', payload: novel });
          });
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      prices: state.prices,
      deliveryZones: state.deliveryZones,
      novels: state.novels
    };
    localStorage.setItem('adminData', JSON.stringify(dataToSave));
  }, [state.prices, state.deliveryZones, state.novels]);

  return (
    <AdminContext.Provider value={{ 
      state, 
      dispatch,
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
      removeNotification,
      clearNotifications,
      exportSystemBackup
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};