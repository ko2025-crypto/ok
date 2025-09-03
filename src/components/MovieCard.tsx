import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Plus, Check, Sparkles, Zap } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useCart } from '../context/CartContext';
import { CartAnimation } from './CartAnimation';
import { IMAGE_BASE_URL, POSTER_SIZE } from '../config/api';
import type { Movie, TVShow, CartItem } from '../types/movie';

interface MovieCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tv';
}

export function MovieCard({ item, type }: MovieCardProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const [showAnimation, setShowAnimation] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  
  const title = 'title' in item ? item.title : item.name;
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const posterUrl = item.poster_path 
    ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${item.poster_path}`
    : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&crop=center';

  const inCart = isInCart(item.id);

  const handleCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cartItem: CartItem = {
      id: item.id,
      title,
      poster_path: item.poster_path,
      type,
      release_date: 'release_date' in item ? item.release_date : undefined,
      first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
      vote_average: item.vote_average,
      selectedSeasons: type === 'tv' ? [1] : undefined,
    };

    if (inCart) {
      removeItem(item.id);
    } else {
      addItem(cartItem);
      setShowAnimation(true);
    }
  };

  return (
    <>
    <div 
      className={`group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 transform ${
        isHovered 
          ? 'shadow-2xl scale-110 -translate-y-2 ring-4 ring-blue-200 ring-opacity-50' 
          : 'hover:shadow-xl hover:scale-105'
      } ${isPressed ? 'scale-95' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {/* Animated background glow */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-500 ${
        isHovered ? 'opacity-20' : ''
      }`} />
      
      {/* Floating particles effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-60"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
      
      <Link to={`/${type}/${item.id}`}>
        <div className="relative overflow-hidden rounded-t-xl">
          <OptimizedImage
            src={posterUrl}
            alt={title}
            className={`w-full h-80 transition-all duration-700 ${
              isHovered ? 'scale-125 brightness-110' : 'group-hover:scale-110'
            }`}
            lazy={true}
          />
          <div className={`absolute inset-0 transition-all duration-500 ${
            isHovered 
              ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent' 
              : 'bg-black/0 group-hover:bg-black/20'
          }`} />
          
          {/* Shimmer effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
          
          <div className={`absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm flex items-center space-x-1 transition-all duration-300 ${
            isHovered ? 'scale-110 bg-gradient-to-r from-yellow-500 to-orange-500' : ''
          }`}>
            <Star className={`h-4 w-4 transition-all duration-300 ${
              isHovered ? 'fill-white text-white animate-pulse' : 'fill-yellow-400 text-yellow-400'
            }`} />
            <span className="font-bold">{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          
          {/* Premium badge for high-rated content */}
          {item.vote_average >= 8.0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              PREMIUM
            </div>
          )}
        </div>
        
        <div className="p-5 relative">
          {/* Animated title with gradient effect */}
          <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 transition-all duration-300 ${
            isHovered 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 transform scale-105' 
              : 'group-hover:text-blue-600'
          }`}>
            {title}
          </h3>
          
          <div className={`flex items-center text-gray-500 text-sm mb-3 transition-all duration-300 ${
            isHovered ? 'text-blue-600 transform translate-x-1' : ''
          }`}>
            <Calendar className={`h-4 w-4 mr-2 transition-all duration-300 ${
              isHovered ? 'text-blue-500 animate-pulse' : ''
            }`} />
            <span>{year}</span>
          </div>
          
          <p className={`text-gray-600 text-sm line-clamp-2 mb-4 transition-all duration-300 ${
            isHovered ? 'text-gray-700 leading-relaxed' : ''
          }`}>
            {item.overview || 'Sin descripción disponible'}
          </p>
          
          {/* Animated progress bar for rating */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ${
                isHovered ? 'animate-pulse' : ''
              }`}
              style={{ 
                width: `${(item.vote_average / 10) * 100}%`,
                transform: isHovered ? 'scaleY(1.5)' : 'scaleY(1)'
              }}
            />
          </div>
        </div>
      </Link>
      
      {/* Enhanced cart button with animations */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={handleCartAction}
          className={`p-3 rounded-full shadow-xl transition-all duration-500 transform ${
            inCart
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white scale-110 animate-pulse'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-125'
          } ${isHovered ? 'scale-125 shadow-2xl' : ''}`}
        >
          {inCart ? (
            <Check className="h-5 w-5 animate-bounce" />
          ) : (
            <Plus className={`h-5 w-5 transition-transform duration-300 ${
              isHovered ? 'rotate-90' : ''
            }`} />
          )}
        </button>
        
        {/* Ripple effect */}
        {isHovered && (
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
        )}
      </div>
      
      {/* Enhanced selection indicator */}
      {inCart && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-pulse" />
      )}
      
      {/* Floating success indicator */}
      {inCart && isHovered && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-bounce shadow-lg">
          <Check className="h-3 w-3 mr-1" />
          EN CARRITO
        </div>
      )}
      
      <CartAnimation 
        show={showAnimation} 
        onComplete={() => setShowAnimation(false)} 
      />
    </div>
    </>
  );
}