import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

// Configuración actual de precios clonada y sincronizada
const CURRENT_PRICES_CLONE = {
  moviePrice: 5,
  seriesPrice: 8,
  transferFeePercentage: 3,
  novelPricePerChapter: 2
};

interface PriceCardProps {
  type: 'movie' | 'tv';
  selectedSeasons?: number[];
  episodeCount?: number;
  isAnime?: boolean;
}

export function PriceCardClone({ type, selectedSeasons = [], episodeCount = 0, isAnime = false }: PriceCardProps) {
  const adminContext = React.useContext(AdminContext);
  
  // Obtener precios del admin context con actualizaciones en tiempo real o fallback a configuración clonada
  const moviePrice = adminContext?.state?.prices?.moviePrice || CURRENT_PRICES_CLONE.moviePrice;
  const seriesPrice = adminContext?.state?.prices?.seriesPrice || CURRENT_PRICES_CLONE.seriesPrice;
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || CURRENT_PRICES_CLONE.transferFeePercentage;
  
  const calculatePrice = () => {
    if (type === 'movie') {
      return moviePrice;
    } else {
      // Series: precio dinámico por temporada
      return selectedSeasons.length * seriesPrice;
    }
  };

  const price = calculatePrice();
  const transferPrice = Math.round(price * (1 + transferFeePercentage / 100));
  
  const getIcon = () => {
    if (type === 'movie') {
      return isAnime ? '🎌' : '🎬';
    }
    return isAnime ? '🎌' : '📺';
  };

  const getTypeLabel = () => {
    if (type === 'movie') {
      return isAnime ? 'Película Animada (Clon)' : 'Película (Clon)';
    }
    return isAnime ? 'Anime (Clon)' : 'Serie (Clon)';
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm">
            <span className="text-lg">{getIcon()}</span>
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-sm">{getTypeLabel()}</h3>
            <p className="text-green-600 text-xs">
              {type === 'tv' && selectedSeasons.length > 0 
                ? `${selectedSeasons.length} temporada${selectedSeasons.length > 1 ? 's' : ''}`
                : 'Contenido completo'
              }
            </p>
          </div>
        </div>
        <div className="bg-green-500 text-white p-2 rounded-full shadow-md">
          <DollarSign className="h-4 w-4" />
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Cash Price */}
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-green-700 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              Efectivo
            </span>
            <span className="text-lg font-bold text-green-700">
              ${price.toLocaleString()} CUP
            </span>
          </div>
        </div>
        
        {/* Transfer Price */}
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-orange-700 flex items-center">
              <CreditCard className="h-3 w-3 mr-1" />
              Transferencia
            </span>
            <span className="text-lg font-bold text-orange-700">
              ${transferPrice.toLocaleString()} CUP
            </span>
          </div>
          <div className="text-xs text-orange-600">
            +{transferFeePercentage}% recargo bancario
          </div>
        </div>
        
        {type === 'tv' && selectedSeasons.length > 0 && (
          <div className="text-xs text-green-600 text-center bg-green-100 rounded-lg p-2">
            ${(price / selectedSeasons.length).toLocaleString()} CUP por temporada (efectivo)
          </div>
        )}
      </div>
    </div>
  );
}