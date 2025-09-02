import type { AdminState } from '../context/AdminContext';

// Generate system README
export function generateSystemReadme(state: AdminState): string {
  return `# TV a la Carta - Sistema Completo

## Descripción
Sistema completo de TV a la Carta para gestión de películas, series, anime y novelas con carrito de compras integrado.

## Características Principales
- 🎬 Catálogo de películas
- 📺 Series y anime
- 📚 Gestión de novelas
- 🛒 Carrito de compras
- 💰 Sistema de precios dinámico
- 🚚 Zonas de entrega configurables
- 📱 Integración con WhatsApp
- ⚙️ Panel de administración

## Configuración Actual

### Precios
- Películas: $${state.prices.moviePrice} CUP
- Series (por temporada): $${state.prices.seriesPrice} CUP
- Novelas (por capítulo): $${state.prices.novelPricePerChapter} CUP
- Recargo transferencia: ${state.prices.transferFeePercentage}%

### Zonas de Entrega
${state.deliveryZones.length > 0 
  ? state.deliveryZones.map(zone => `- ${zone.name}: $${zone.cost} CUP`).join('\n')
  : '- No hay zonas configuradas'
}

### Novelas Administradas
${state.novels.length > 0 
  ? state.novels.map(novel => `- ${novel.titulo} (${novel.año}) - ${novel.capitulos} capítulos`).join('\n')
  : '- No hay novelas administradas'
}

## Instalación

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts Disponibles
- \`npm run dev\`: Servidor de desarrollo
- \`npm run build\`: Construir para producción
- \`npm run preview\`: Vista previa de producción

## Tecnologías Utilizadas
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Lucide React Icons

## Exportado el: ${new Date().toLocaleString('es-ES')}
`;
}

// Generate system configuration
export function generateSystemConfig(state: AdminState): string {
  return JSON.stringify({
    version: "2.0.0",
    exportDate: new Date().toISOString(),
    configuration: {
      prices: state.prices,
      deliveryZones: state.deliveryZones,
      novels: state.novels,
      syncStatus: state.syncStatus
    },
    metadata: {
      totalZones: state.deliveryZones.length,
      totalNovels: state.novels.length,
      totalNotifications: state.notifications.length
    }
  }, null, 2);
}

// Generate updated package.json
export function generateUpdatedPackageJson(): string {
  return JSON.stringify({
    "name": "tv-a-la-carta-sistema-completo",
    "private": true,
    "version": "2.0.0",
    "type": "module",
    "description": "Sistema completo de TV a la Carta con gestión de contenido y carrito de compras",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "lint": "eslint .",
      "preview": "vite preview"
    },
    "dependencies": {
      "@types/node": "^24.2.1",
      "jszip": "^3.10.1",
      "lucide-react": "^0.344.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^7.8.0"
    },
    "devDependencies": {
      "@eslint/js": "^9.9.1",
      "@types/react": "^18.3.5",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      "autoprefixer": "^10.4.18",
      "eslint": "^9.9.1",
      "eslint-plugin-react-hooks": "^5.1.0-rc.0",
      "eslint-plugin-react-refresh": "^0.4.11",
      "globals": "^15.9.0",
      "postcss": "^8.4.35",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.5.3",
      "typescript-eslint": "^8.3.0",
      "vite": "^5.4.2"
    }
  }, null, 2);
}

// Get Vite configuration
export function getViteConfig(): string {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
`;
}

// Get Tailwind configuration
export function getTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}

// Get index.html
export function getIndexHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/unnamed.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <base href="/" />
    <title>TV a la Carta: Películas y series ilimitadas y mucho más</title>
    <style>
      /* Deshabilitar zoom y selección de texto */
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      /* Permitir selección de texto solo en inputs y textareas */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      
      /* Deshabilitar zoom en iOS Safari */
      body {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        text-size-adjust: 100%;
        touch-action: manipulation;
      }
      
      /* Prevenir zoom en inputs en iOS */
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="password"],
      input[type="number"],
      input[type="search"],
      textarea,
      select {
        font-size: 16px !important;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

// Get Netlify redirects
export function getNetlifyRedirects(): string {
  return `# Netlify redirects for SPA routing
/*    /index.html   200

# Handle specific routes
/movies    /index.html   200
/tv        /index.html   200
/anime     /index.html   200
/cart      /index.html   200
/search    /index.html   200
/movie/*   /index.html   200
/tv/*      /index.html   200
`;
}

// Get Vercel configuration
export function getVercelConfig(): string {
  return JSON.stringify({ 
    "rewrites": [{ "source": "/(.*)", "destination": "/" }] 
  }, null, 2);
}

// Get main.tsx source
export function getMainTsxSource(): string {
  return `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;
}

// Get index.css source
export function getIndexCssSource(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Configuraciones adicionales para deshabilitar zoom */
@layer base {
  html {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
    touch-action: manipulation;
  }
  
  body {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    overflow-x: hidden;
  }
  
  /* Permitir selección solo en elementos de entrada */
  input, textarea, [contenteditable="true"] {
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
    user-select: text !important;
  }
  
  /* Prevenir zoom accidental en dispositivos móviles */
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"],
  input[type="number"],
  input[type="search"],
  textarea,
  select {
    font-size: 16px !important;
    transform: translateZ(0);
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  
  /* Deshabilitar zoom en imágenes */
  img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    pointer-events: none;
  }
  
  /* Permitir interacción en botones e imágenes clickeables */
  button, a, [role="button"], .clickable {
    pointer-events: auto;
  }
  
  button img, a img, [role="button"] img, .clickable img {
    pointer-events: none;
  }
  
  /* Custom animations */
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .animate-shrink {
    animation: shrink 3s linear forwards;
  }
  
  /* Animaciones para efectos visuales modernos */
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  
  /* Animaciones para el modal */
  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-in {
    animation: fade-in 0.3s ease-out;
  }
}
`;
}

// Get App.tsx source
export function getAppTsxSource(): string {
  return `import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TVShows } from './pages/TVShows';
import { Anime } from './pages/Anime';
import { SearchPage } from './pages/Search';
import { MovieDetail } from './pages/MovieDetail';
import { TVDetail } from './pages/TVDetail';
import { Cart } from './pages/Cart';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  // Detectar refresh y redirigir a la página principal
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('pageRefreshed', 'true');
    };

    const handleLoad = () => {
      if (sessionStorage.getItem('pageRefreshed') === 'true') {
        sessionStorage.removeItem('pageRefreshed');
        if (window.location.pathname !== '/') {
          window.location.href = 'https://tvalacarta.vercel.app/';
          return;
        }
      }
    };

    if (sessionStorage.getItem('pageRefreshed') === 'true') {
      sessionStorage.removeItem('pageRefreshed');
      if (window.location.pathname !== '/') {
        window.location.href = 'https://tvalacarta.vercel.app/';
        return;
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Deshabilitar zoom con teclado y gestos
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        return false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return false;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <AdminProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/*" element={
                <>
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/movies" element={<Movies />} />
                      <Route path="/tv" element={<TVShows />} />
                      <Route path="/anime" element={<Anime />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/movie/:id" element={<MovieDetail />} />
                      <Route path="/tv/:id" element={<TVDetail />} />
                      <Route path="/cart" element={<Cart />} />
                    </Routes>
                  </main>
                </>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AdminProvider>
  );
}

export default App;
`;
}

// Get AdminContext source
export function getAdminContextSource(state: AdminState): string {
  return `// AdminContext.tsx - Sistema de administración completo
// Exportado automáticamente desde TV a la Carta
// Fecha: ${new Date().toLocaleString('es-ES')}

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// [El contenido completo del AdminContext se incluiría aquí]
// Este es un placeholder para la exportación del sistema

export const AdminContext = createContext(undefined);
export function AdminProvider({ children }) {
  // Implementación completa del AdminProvider
  return React.createElement(AdminContext.Provider, { value: {} }, children);
}
export function useAdmin() {
  return useContext(AdminContext);
}
`;
}

// Get CartContext source
export function getCartContextSource(state: AdminState): string {
  return `// CartContext.tsx - Sistema de carrito de compras
// Exportado automáticamente desde TV a la Carta
// Fecha: ${new Date().toLocaleString('es-ES')}

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// [El contenido completo del CartContext se incluiría aquí]
// Este es un placeholder para la exportación del sistema

export const CartContext = createContext(undefined);
export function CartProvider({ children }) {
  return React.createElement(CartContext.Provider, { value: {} }, children);
}
export function useCart() {
  return useContext(CartContext);
}
`;
}

// Get CheckoutModal source
export function getCheckoutModalSource(state: AdminState): string {
  return `// CheckoutModal.tsx - Modal de checkout
// Exportado automáticamente desde TV a la Carta
// Configuración actual: Películas $${state.prices.moviePrice} CUP, Series $${state.prices.seriesPrice} CUP

import React from 'react';

export function CheckoutModal(props) {
  return React.createElement('div', { className: 'checkout-modal' }, 'Checkout Modal');
}
`;
}

// Get PriceCard source
export function getPriceCardSource(state: AdminState): string {
  return `// PriceCard.tsx - Componente de precios
// Precios actuales: Películas $${state.prices.moviePrice} CUP, Series $${state.prices.seriesPrice} CUP

import React from 'react';

export function PriceCard(props) {
  return React.createElement('div', { className: 'price-card' }, 'Price Card');
}
`;
}

// Get NovelasModal source
export function getNovelasModalSource(state: AdminState): string {
  return `// NovelasModal.tsx - Modal de novelas
// Novelas administradas: ${state.novels.length}
// Precio por capítulo: $${state.prices.novelPricePerChapter} CUP

import React from 'react';

export function NovelasModal(props) {
  return React.createElement('div', { className: 'novelas-modal' }, 'Novelas Modal');
}
`;
}

// Get Toast source
export function getToastSource(): string {
  return `// Toast.tsx - Componente de notificaciones
import React from 'react';

export function Toast(props) {
  return React.createElement('div', { className: 'toast' }, 'Toast Component');
}
`;
}

// Get OptimizedImage source
export function getOptimizedImageSource(): string {
  return `// OptimizedImage.tsx - Componente de imagen optimizada
import React from 'react';

export function OptimizedImage(props) {
  return React.createElement('img', props);
}
`;
}

// Get LoadingSpinner source
export function getLoadingSpinnerSource(): string {
  return `// LoadingSpinner.tsx - Componente de carga
import React from 'react';

export function LoadingSpinner() {
  return React.createElement('div', { className: 'loading-spinner' }, 'Loading...');
}
`;
}

// Get ErrorMessage source
export function getErrorMessageSource(): string {
  return `// ErrorMessage.tsx - Componente de error
import React from 'react';

export function ErrorMessage({ message }) {
  return React.createElement('div', { className: 'error-message' }, message);
}
`;
}

// Get SystemExport source (self-reference)
export function getSystemExportSource(): string {
  return `// systemExport.ts - Utilidades de exportación del sistema
// Este archivo contiene todas las funciones necesarias para exportar el sistema completo

export function generateSystemReadme(state) {
  return "# TV a la Carta - Sistema Completo\\n\\nSistema exportado automáticamente.";
}

// [Todas las demás funciones de exportación estarían aquí]
`;
}

// Get WhatsApp utils source
export function getWhatsAppUtilsSource(): string {
  return `// whatsapp.ts - Utilidades de WhatsApp
export function sendOrderToWhatsApp(orderData) {
  const phoneNumber = '5354690878';
  const message = "Nuevo pedido desde TV a la Carta";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = \`https://wa.me/\${phoneNumber}?text=\${encodedMessage}\`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}
`;
}

// Get Performance utils source
export function getPerformanceUtilsSource(): string {
  return `// performance.ts - Utilidades de rendimiento
export class PerformanceOptimizer {
  static getInstance() {
    return new PerformanceOptimizer();
  }
  
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  
  throttle(func, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();
`;
}

// Get ErrorHandler source
export function getErrorHandlerSource(): string {
  return `// errorHandler.ts - Manejo de errores
export class ErrorHandler {
  static getInstance() {
    return new ErrorHandler();
  }
  
  logError(error, context) {
    console.error(\`[\${context}] Error:\`, error);
  }
  
  handleAsyncError(promise, context) {
    return promise.catch(error => {
      this.logError(error, context);
      throw error;
    });
  }
}

export const errorHandler = ErrorHandler.getInstance();
`;
}

// Get TMDB service source
export function getTmdbServiceSource(): string {
  return `// tmdb.ts - Servicio de TMDB
import { apiService } from './api';

class TMDBService {
  async getPopularMovies(page = 1) {
    return apiService.fetchWithCache(\`/movie/popular?language=es-ES&page=\${page}\`);
  }
  
  async getPopularTVShows(page = 1) {
    return apiService.fetchWithCache(\`/tv/popular?language=es-ES&page=\${page}\`);
  }
  
  // [Más métodos del servicio TMDB]
}

export const tmdbService = new TMDBService();
`;
}

// Get API service source
export function getApiServiceSource(): string {
  return `// api.ts - Servicio de API
import { BASE_URL, API_OPTIONS } from '../config/api';

export class APIService {
  private cache = new Map();
  
  async fetchWithCache(endpoint, useCache = true) {
    // Implementación del servicio de API
    const response = await fetch(\`\${BASE_URL}\${endpoint}\`, API_OPTIONS);
    return response.json();
  }
  
  clearCache() {
    this.cache.clear();
  }
  
  getCacheSize() {
    return this.cache.size;
  }
  
  getCacheInfo() {
    return [];
  }
}

export const apiService = new APIService();
`;
}

// Get ContentSync source
export function getContentSyncSource(): string {
  return `// contentSync.ts - Servicio de sincronización de contenido
class ContentSyncService {
  async getTrendingContent(timeWindow) {
    // Implementación de sincronización
    return [];
  }
  
  async getPopularContent() {
    return { movies: [], tvShows: [], anime: [] };
  }
  
  getCachedVideos(id, type) {
    return [];
  }
  
  async forceRefresh() {
    // Implementación de refresh forzado
  }
  
  getSyncStatus() {
    return { lastDaily: null, lastWeekly: null, inProgress: false };
  }
}

export const contentSyncService = new ContentSyncService();
`;
}

// Get API config source
export function getApiConfigSource(): string {
  return `// api.ts - Configuración de API
const API_KEY = '36c08297b5565b5604ed8646cb0c1393';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNmMwODI5N2I1NTY1YjU2MDRlZDg2NDZjYjBjMTM5MyIsIm5iZiI6MTcxNzM3MjM0Ny44NDcwMDAxLCJzdWIiOiI2NjVkMDViYmZkOTMxM2QwZDNhMGFjZDciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.X8jcKcjIT1svPP5EeO0CtF3Ct11pZwrXaJ0DLAz5pDQ';

export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const POSTER_SIZE = 'w500';
export const BACKDROP_SIZE = 'w1280';

export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: \`Bearer \${ACCESS_TOKEN}\`
  }
};

export { API_KEY };
`;
}

// Get Movie types source
export function getMovieTypesSource(): string {
  return `// movie.ts - Tipos de TypeScript
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  video: boolean;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
}

// [Más interfaces y tipos]
`;
}

// Get hooks sources
export function getOptimizedContentHookSource(): string {
  return `// useOptimizedContent.ts - Hook de contenido optimizado
import { useState, useEffect } from 'react';

export function useOptimizedContent(fetchFunction, dependencies = []) {
  const [state, setState] = useState({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    page: 1
  });

  // [Implementación completa del hook]
  
  return state;
}
`;
}

export function getPerformanceHookSource(): string {
  return `// usePerformance.ts - Hook de rendimiento
import { useState, useEffect } from 'react';

export function usePerformance() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  });

  // [Implementación completa del hook]
  
  return { metrics };
}
`;
}

export function getContentSyncHookSource(): string {
  return `// useContentSync.ts - Hook de sincronización
import { useState, useEffect } from 'react';

export function useContentSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // [Implementación completa del hook]
  
  return { isLoading, lastUpdate };
}
`;
}

// Get pages sources
export function getHomePageSource(): string {
  return `// Home.tsx - Página principal
import React from 'react';

export function Home() {
  return React.createElement('div', { className: 'home-page' }, 'Home Page');
}
`;
}

export function getMoviesPageSource(): string {
  return `// Movies.tsx - Página de películas
import React from 'react';

export function Movies() {
  return React.createElement('div', { className: 'movies-page' }, 'Movies Page');
}
`;
}

export function getTVShowsPageSource(): string {
  return `// TVShows.tsx - Página de series
import React from 'react';

export function TVShows() {
  return React.createElement('div', { className: 'tv-shows-page' }, 'TV Shows Page');
}
`;
}

export function getAnimePageSource(): string {
  return `// Anime.tsx - Página de anime
import React from 'react';

export function Anime() {
  return React.createElement('div', { className: 'anime-page' }, 'Anime Page');
}
`;
}

export function getSearchPageSource(): string {
  return `// Search.tsx - Página de búsqueda
import React from 'react';

export function SearchPage() {
  return React.createElement('div', { className: 'search-page' }, 'Search Page');
}
`;
}

export function getCartPageSource(): string {
  return `// Cart.tsx - Página del carrito
import React from 'react';

export function Cart() {
  return React.createElement('div', { className: 'cart-page' }, 'Cart Page');
}
`;
}

export function getMovieDetailPageSource(): string {
  return `// MovieDetail.tsx - Página de detalle de película
import React from 'react';

export function MovieDetail() {
  return React.createElement('div', { className: 'movie-detail-page' }, 'Movie Detail Page');
}
`;
}

export function getTVDetailPageSource(): string {
  return `// TVDetail.tsx - Página de detalle de serie
import React from 'react';

export function TVDetail() {
  return React.createElement('div', { className: 'tv-detail-page' }, 'TV Detail Page');
}
`;
}

export function getAdminPanelSource(): string {
  return `// AdminPanel.tsx - Panel de administración
// Configuración actual exportada el: ${new Date().toLocaleString('es-ES')}

import React from 'react';

export function AdminPanel() {
  return React.createElement('div', { className: 'admin-panel' }, 'Admin Panel');
}
`;
}