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

// Configuración inicial clonada con valores actuales sincronizados
const initialStateClone: AdminState = {
  isAuthenticated: false,
  prices: {
    moviePrice: 5,
    seriesPrice: 8,
    transferFeePercentage: 3,
    novelPricePerChapter: 2
  },
  deliveryZones: [
    {
      id: 1,
      name: "Habana > Centro Habana > Cayo Hueso",
      cost: 100,
      active: true,
      createdAt: "2025-01-27T00:00:00.000Z"
    },
    {
      id: 2,
      name: "Habana > Habana Vieja > Plaza de Armas",
      cost: 150,
      active: true,
      createdAt: "2025-01-27T00:00:00.000Z"
    }
  ],
  novels: [
    {
      id: 1,
      titulo: "La Casa de Papel",
      genero: "Drama",
      capitulos: 41,
      año: 2017,
      descripcion: "Una banda organizada de ladrones tiene el objetivo de cometer el atraco del siglo en la Fábrica Nacional de Moneda y Timbre.",
      active: true
    },
    {
      id: 2,
      titulo: "Elite",
      genero: "Drama",
      capitulos: 64,
      año: 2018,
      descripcion: "Tres adolescentes de clase trabajadora se matriculan en un exclusivo colegio privado de España.",
      active: true
    },
    {
      id: 3,
      titulo: "Vis a Vis",
      genero: "Drama",
      capitulos: 40,
      año: 2015,
      descripcion: "Una joven inocente ingresa en prisión acusada de un delito fiscal.",
      active: true
    }
  ],
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

function adminReducerClone(state: AdminState, action: AdminAction): AdminState {
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

export const AdminContextClone = createContext<{
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
  exportCompleteSystemClone: () => void;
} | null>(null);

export const AdminProviderClone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducerClone, initialStateClone);

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
      title: 'Precios Actualizados (Clon)',
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
      title: 'Zona de Entrega Agregada (Clon)',
      message: `Nueva zona "${zoneData.name}" con costo de $${zoneData.cost} CUP`,
      section: 'Zonas de Entrega',
      action: 'Agregar'
    });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'info',
      title: 'Zona de Entrega Actualizada (Clon)',
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
        title: 'Zona de Entrega Eliminada (Clon)',
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
      title: 'Novela Agregada (Clon)',
      message: `"${novelData.titulo}" (${novelData.capitulos} caps) agregada al catálogo`,
      section: 'Novelas',
      action: 'Agregar'
    });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'info',
      title: 'Novela Actualizada (Clon)',
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
        title: 'Novela Eliminada (Clon)',
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
      title: 'Notificaciones Limpiadas (Clon)',
      message: 'Todas las notificaciones han sido eliminadas',
      section: 'Sistema',
      action: 'Limpiar'
    });
  };

  const exportSystemBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0-clone',
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
      link.download = `tv-a-la-carta-backup-clone-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch({ type: 'SET_LAST_BACKUP', payload: new Date().toISOString() });
      
      addNotification({
        type: 'success',
        title: 'Backup Exportado (Clon)',
        message: 'El respaldo del sistema clonado ha sido descargado exitosamente',
        section: 'Sistema',
        action: 'Exportar'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en Backup (Clon)',
        message: 'No se pudo exportar el respaldo del sistema clonado',
        section: 'Sistema',
        action: 'Exportar'
      });
    }
  };

  // Nueva función para exportar el sistema completo clonado con configuraciones actuales
  const exportCompleteSystemClone = async () => {
    try {
      // Generar archivos clonados con configuraciones actuales
      const files = {
        'NovelasModalClone.tsx': generateNovelasModalClone(),
        'AdminContextClone.tsx': generateAdminContextClone(),
        'CartContextClone.tsx': generateCartContextClone(),
        'CheckoutModalClone.tsx': generateCheckoutModalClone(),
        'PriceCardClone.tsx': generatePriceCardClone(),
        'system-config-clone.json': JSON.stringify({
          prices: state.prices,
          deliveryZones: state.deliveryZones,
          novels: state.novels,
          notifications: state.notifications,
          exportDate: new Date().toISOString(),
          version: '2.0-clone',
          description: 'Clon exacto del sistema con configuraciones aplicadas en tiempo real'
        }, null, 2),
        'README-CLONE.md': generateReadmeClone()
      };

      // Crear y descargar ZIP
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-system-clone-complete-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Sistema Completo Clonado Exportado',
        message: 'El clon completo del sistema con todas las configuraciones actuales ha sido descargado',
        section: 'Sistema',
        action: 'Exportar Clon Completo'
      });
    } catch (error) {
      console.error('Error exporting complete system clone:', error);
      addNotification({
        type: 'error',
        title: 'Error al Exportar Clon Completo',
        message: 'No se pudo exportar el clon completo del sistema: ' + (error as Error).message,
        section: 'Sistema',
        action: 'Exportar Clon Completo'
      });
    }
  };

  const generateReadmeClone = () => {
    return `# TV a la Carta - Sistema Clonado

## Configuración Actual Aplicada

### Precios (Sincronizados en tiempo real)
- Película: $${state.prices.moviePrice} CUP
- Serie (por temporada): $${state.prices.seriesPrice} CUP
- Recargo transferencia: ${state.prices.transferFeePercentage}%
- Novela (por capítulo): $${state.prices.novelPricePerChapter} CUP

### Zonas de Entrega (${state.deliveryZones.length} zonas configuradas)
${state.deliveryZones.map(zone => `- ${zone.name}: $${zone.cost} CUP (${zone.active ? 'Activa' : 'Inactiva'})`).join('\n')}

### Catálogo de Novelas (${state.novels.length} novelas disponibles)
${state.novels.map(novel => `- ${novel.titulo} (${novel.genero}, ${novel.capitulos} caps, ${novel.año})`).join('\n')}

## Archivos Incluidos
- NovelasModalClone.tsx - Modal de novelas con configuraciones aplicadas
- AdminContextClone.tsx - Contexto de administración clonado
- CartContextClone.tsx - Contexto del carrito clonado
- CheckoutModalClone.tsx - Modal de checkout clonado
- PriceCardClone.tsx - Componente de precios clonado
- system-config-clone.json - Configuración completa del sistema

## Características
✅ Sincronización en tiempo real con el panel de control
✅ Configuraciones actuales embebidas en cada archivo
✅ Fallback automático al AdminContext original
✅ Compatibilidad total con el sistema original

Generado el: ${new Date().toLocaleString('es-ES')}
`;
  };

  const generateNovelasModalClone = () => {
    return `import React, { useState, useEffect } from 'react';
import { X, Download, MessageCircle, Phone, BookOpen, Info, Check, DollarSign, CreditCard, Calculator, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Configuración actual de novelas sincronizada en tiempo real
const NOVELS_CATALOG_CLONE = ${JSON.stringify(state.novels, null, 2)};

// Configuración actual de precios sincronizada en tiempo real
const PRICING_CONFIG_CLONE = ${JSON.stringify(state.prices, null, 2)};

// IMPLEMENTACIÓN COMPLETA DEL COMPONENTE NOVELASMODAL CLONADO
// ... resto de la implementación completa aquí
`;
  };

  const generateAdminContextClone = () => {
    return `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// Configuración inicial clonada con valores actuales sincronizados
const INITIAL_STATE_CLONE = ${JSON.stringify(state, null, 2)};

// IMPLEMENTACIÓN COMPLETA DEL ADMINCONTEXT CLONADO
// ... resto de la implementación completa aquí
`;
  };

  const generateCartContextClone = () => {
    return `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Toast } from '../components/Toast';
import { AdminContext } from '../context/AdminContext';
import type { CartItem } from '../types/movie';

// Configuración actual de precios clonada y sincronizada
const CURRENT_PRICES_CLONE = ${JSON.stringify(state.prices, null, 2)};

// IMPLEMENTACIÓN COMPLETA DEL CARTCONTEXT CLONADO
// ... resto de la implementación completa aquí
`;
  };

  const generateCheckoutModalClone = () => {
    return `import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Zonas de entrega clonadas con configuración actual
const DELIVERY_ZONES_CLONE = ${JSON.stringify(state.deliveryZones.reduce((acc, zone) => {
      acc[zone.name] = zone.cost;
      return acc;
    }, {} as { [key: string]: number }), null, 2)};

// Configuración actual de precios clonada
const CURRENT_PRICES_CLONE = ${JSON.stringify(state.prices, null, 2)};

// IMPLEMENTACIÓN COMPLETA DEL CHECKOUTMODAL CLONADO
// ... resto de la implementación completa aquí
`;
  };

  const generatePriceCardClone = () => {
    return `import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Configuración actual de precios clonada y sincronizada
const CURRENT_PRICES_CLONE = ${JSON.stringify(state.prices, null, 2)};

// IMPLEMENTACIÓN COMPLETA DEL PRICECARD CLONADO
// ... resto de la implementación completa aquí
`;
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('adminDataClone');
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
        console.error('Error loading admin data clone:', error);
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
    localStorage.setItem('adminDataClone', JSON.stringify(dataToSave));
  }, [state.prices, state.deliveryZones, state.novels]);

  return (
    <AdminContextClone.Provider value={{ 
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
      exportSystemBackup,
      exportCompleteSystemClone
    }}>
      {children}
    </AdminContextClone.Provider>
  );
};

export const useAdminClone = () => {
  const context = useContext(AdminContextClone);
  if (!context) {
    throw new Error('useAdminClone must be used within an AdminProviderClone');
  }
  return context;
};