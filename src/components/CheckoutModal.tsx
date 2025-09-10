import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard, Navigation, Clock, Car, Bike, MapPin as LocationIcon, ChevronDown, Search, Filter, Grid, List } from 'lucide-react';

// ZONAS DE ENTREGA EMBEBIDAS - Generadas automáticamente
const EMBEDDED_DELIVERY_ZONES = [];

// PRECIOS EMBEBIDOS
const EMBEDDED_PRICES = {
  "moviePrice": 80,
  "seriesPrice": 300,
  "transferFeePercentage": 10,
  "novelPricePerChapter": 5
};

// Coordenadas del local de TV a la Carta
const TV_A_LA_CARTA_LOCATION = {
  lat: 20.039585,
  lng: -75.849663,
  address: "Reparto Nuevo Vista Alegre, Santiago de Cuba",
  googleMapsUrl: "https://www.google.com/maps/place/20%C2%B002'22.5%22N+75%C2%B050'58.8%22W/@20.0394604,-75.8495414,180m/data=!3m1!1e3!4m4!3m3!8m2!3d20.039585!4d-75.849663?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D"
};

interface DistanceInfo {
  distance: string;
  duration: string;
  mode: 'driving' | 'walking' | 'bicycling';
  status: 'OK' | 'ERROR';
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
  coordinates?: { lat: number; lng: number };
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
  distanceInfo?: {
    driving?: DistanceInfo;
    walking?: DistanceInfo;
    bicycling?: DistanceInfo;
  };
  isLocalPickup?: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: OrderData) => void;
  items: any[];
  total: number;
}

// Zonas específicas de Santiago de Cuba organizadas por sectores
const SANTIAGO_DELIVERY_ZONES = {
  // Centro Histórico y Comercial
  'Centro Histórico': {
    icon: '🏛️',
    color: 'from-amber-500 to-orange-500',
    zones: {
      'Santiago de Cuba > Centro > Parque Céspedes': 50,
      'Santiago de Cuba > Centro > Plaza de Marte': 50,
      'Santiago de Cuba > Centro > Calle Enramadas': 50,
      'Santiago de Cuba > Centro > Plaza de Dolores': 50,
      'Santiago de Cuba > Centro > Catedral': 45,
      'Santiago de Cuba > Centro > Museo del Carnaval': 45,
    }
  },
  
  // Zona Norte (Residencial)
  'Zona Norte': {
    icon: '🏘️',
    color: 'from-blue-500 to-cyan-500',
    zones: {
      'Santiago de Cuba > Norte > Vista Alegre': 60,
      'Santiago de Cuba > Norte > Sueño': 70,
      'Santiago de Cuba > Norte > Los Olmos': 80,
      'Santiago de Cuba > Norte > Altamira': 90,
      'Santiago de Cuba > Norte > Reparto Flores': 65,
      'Santiago de Cuba > Norte > Micro 9': 75,
    }
  },
  
  // Zona Este
  'Zona Este': {
    icon: '🌅',
    color: 'from-green-500 to-emerald-500',
    zones: {
      'Santiago de Cuba > Este > Reparto Flores': 65,
      'Santiago de Cuba > Este > Micro 9': 75,
      'Santiago de Cuba > Este > Micro 10': 75,
      'Santiago de Cuba > Este > Reparto Terrazas': 85,
      'Santiago de Cuba > Este > Distrito José Martí': 70,
      'Santiago de Cuba > Este > Reparto Sánchez Hechavarría': 80,
    }
  },
  
  // Zona Oeste
  'Zona Oeste': {
    icon: '🌇',
    color: 'from-purple-500 to-pink-500',
    zones: {
      'Santiago de Cuba > Oeste > Abel Santamaría': 70,
      'Santiago de Cuba > Oeste > 30 de Noviembre': 80,
      'Santiago de Cuba > Oeste > Reparto Versalles': 90,
      'Santiago de Cuba > Oeste > Micro 4': 85,
      'Santiago de Cuba > Oeste > Reparto Portuondo': 80,
      'Santiago de Cuba > Oeste > Santa Bárbara': 75,
    }
  },
  
  // Zona Sur
  'Zona Sur': {
    icon: '🏔️',
    color: 'from-red-500 to-rose-500',
    zones: {
      'Santiago de Cuba > Sur > Santa Bárbara': 75,
      'Santiago de Cuba > Sur > Reparto Sánchez Hechavarría': 85,
      'Santiago de Cuba > Sur > Micro 1': 70,
      'Santiago de Cuba > Sur > Reparto Portuondo': 80,
      'Santiago de Cuba > Sur > Distrito Frank País': 85,
      'Santiago de Cuba > Sur > Reparto Chicharrones': 90,
    }
  },
  
  // Zonas Periféricas
  'Zonas Periféricas': {
    icon: '🏞️',
    color: 'from-indigo-500 to-purple-500',
    zones: {
      'Santiago de Cuba > Periferia > El Caney': 100,
      'Santiago de Cuba > Periferia > San Juan': 120,
      'Santiago de Cuba > Periferia > Siboney': 150,
      'Santiago de Cuba > Periferia > La Maya': 200,
      'Santiago de Cuba > Periferia > El Cobre': 180,
      'Santiago de Cuba > Periferia > Palma Soriano': 250,
      'Santiago de Cuba > Periferia > Contramaestre': 300,
      'Santiago de Cuba > Periferia > Songo La Maya': 280,
    }
  }
};

export function CheckoutModal({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    address: '',
  });
  
  const [deliveryZone, setDeliveryZone] = useState('Por favor seleccionar su Barrio/Zona');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderGenerated, setOrderGenerated] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState('');
  const [copied, setCopied] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<{
    driving?: DistanceInfo;
    walking?: DistanceInfo;
    bicycling?: DistanceInfo;
  }>({});
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showDeliverySelector, setShowDeliverySelector] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get delivery zones from embedded configuration
  const embeddedZonesMap = EMBEDDED_DELIVERY_ZONES.reduce((acc, zone) => {
    acc[zone.name] = zone.cost;
    return acc;
  }, {} as { [key: string]: number });
  
  const deliveryCost = deliveryZone === 'Por favor seleccionar su Barrio/Zona' ? 0 :
                      deliveryZone === 'Entrega en Local > TV a la Carta > Local TV a la Carta' ? 0 :
                      embeddedZonesMap[deliveryZone] || 
                      Object.values(SANTIAGO_DELIVERY_ZONES).flatMap(sector => Object.entries(sector.zones)).find(([zone]) => zone === deliveryZone)?.[1] || 0;
  
  const finalTotal = total + deliveryCost;
  const isLocalPickup = deliveryZone === 'Entrega en Local > TV a la Carta > Local TV a la Carta';

  // Get current transfer fee percentage from embedded prices
  const transferFeePercentage = EMBEDDED_PRICES.transferFeePercentage;

  const isFormValid = customerInfo.fullName.trim() !== '' && 
                     customerInfo.phone.trim() !== '' && 
                     customerInfo.address.trim() !== '' &&
                     deliveryZone !== 'Por favor seleccionar su Barrio/Zona';

  // Filtrar zonas por búsqueda
  const getFilteredZones = () => {
    if (!searchTerm) return SANTIAGO_DELIVERY_ZONES;
    
    const filtered: typeof SANTIAGO_DELIVERY_ZONES = {};
    
    Object.entries(SANTIAGO_DELIVERY_ZONES).forEach(([sectorName, sectorData]) => {
      const matchingZones: { [key: string]: number } = {};
      
      Object.entries(sectorData.zones).forEach(([zoneName, cost]) => {
        const zoneDisplayName = zoneName.split(' > ')[2] || zoneName;
        if (zoneDisplayName.toLowerCase().includes(searchTerm.toLowerCase())) {
          matchingZones[zoneName] = cost;
        }
      });
      
      if (Object.keys(matchingZones).length > 0) {
        filtered[sectorName] = {
          ...sectorData,
          zones: matchingZones
        };
      }
    });
    
    return filtered;
  };

  const filteredZones = getFilteredZones();

  // Función para obtener coordenadas de una dirección
  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Santiago de Cuba, Cuba')}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  // Función para calcular distancia usando OpenRouteService (alternativa gratuita)
  const calculateDistance = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'bicycling'
  ): Promise<DistanceInfo> => {
    try {
      // Calcular distancia euclidiana como fallback
      const R = 6371; // Radio de la Tierra en km
      const dLat = (end.lat - start.lat) * Math.PI / 180;
      const dLon = (end.lng - start.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Estimar tiempo basado en velocidades promedio
      const speeds = {
        driving: 30, // km/h en ciudad
        bicycling: 15, // km/h
        walking: 5 // km/h
      };

      const duration = (distance / speeds[mode]) * 60; // en minutos

      return {
        distance: `${distance.toFixed(1)} km`,
        duration: duration < 60 ? `${Math.round(duration)} min` : `${Math.round(duration / 60)}h ${Math.round(duration % 60)}min`,
        mode,
        status: 'OK'
      };
    } catch (error) {
      console.error('Error calculating distance:', error);
      return {
        distance: 'No disponible',
        duration: 'No disponible',
        mode,
        status: 'ERROR'
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TVC-${timestamp}-${random}`.toUpperCase();
  };

  const calculateTotals = () => {
    const cashItems = items.filter(item => item.paymentType === 'cash');
    const transferItems = items.filter(item => item.paymentType === 'transfer');
    
    // Get current prices from embedded configuration
    const moviePrice = EMBEDDED_PRICES.moviePrice;
    const seriesPrice = EMBEDDED_PRICES.seriesPrice;
    
    const cashTotal = cashItems.reduce((sum, item) => {
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      return sum + basePrice;
    }, 0);
    
    const transferTotal = transferItems.reduce((sum, item) => {
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      return sum + Math.round(basePrice * (1 + transferFeePercentage / 100));
    }, 0);
    
    return { cashTotal, transferTotal };
  };

  const generateOrderText = () => {
    const orderId = generateOrderId();
    const { cashTotal, transferTotal } = calculateTotals();
    const transferFee = transferTotal - items.filter(item => item.paymentType === 'transfer').reduce((sum, item) => {
      const moviePrice = EMBEDDED_PRICES.moviePrice;
      const seriesPrice = EMBEDDED_PRICES.seriesPrice;
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      return sum + basePrice;
    }, 0);

    // Format product list with embedded pricing
    const itemsList = items
      .map(item => {
        const seasonInfo = item.selectedSeasons && item.selectedSeasons.length > 0 
          ? `\n  📺 Temporadas: ${item.selectedSeasons.sort((a, b) => a - b).join(', ')}` 
          : '';
        const itemType = item.type === 'movie' ? 'Película' : 'Serie';
        const moviePrice = EMBEDDED_PRICES.moviePrice;
        const seriesPrice = EMBEDDED_PRICES.seriesPrice;
        const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
        const finalPrice = item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
        const paymentTypeText = item.paymentType === 'transfer' ? `Transferencia (+${transferFeePercentage}%)` : 'Efectivo';
        const emoji = item.type === 'movie' ? '🎬' : '📺';
        return `${emoji} *${item.title}*${seasonInfo}\n  📋 Tipo: ${itemType}\n  💳 Pago: ${paymentTypeText}\n  💰 Precio: $${finalPrice.toLocaleString()} CUP`;
      })
      .join('\n\n');

    let orderText = `🎬 *PEDIDO - TV A LA CARTA*\n\n`;
    orderText += `📋 *ID de Orden:* ${orderId}\n\n`;
    
    orderText += `👤 *DATOS DEL CLIENTE:*\n`;
    orderText += `• Nombre: ${customerInfo.fullName}\n`;
    orderText += `• Teléfono: ${customerInfo.phone}\n`;
    orderText += `• Dirección: ${customerInfo.address}\n\n`;
    
    orderText += `🎯 *PRODUCTOS SOLICITADOS:*\n${itemsList}\n\n`;
    
    orderText += `💰 *RESUMEN DE COSTOS:*\n`;
    
    if (cashTotal > 0) {
      orderText += `💵 Efectivo: $${cashTotal.toLocaleString()} CUP\n`;
    }
    if (transferTotal > 0) {
      orderText += `🏦 Transferencia: $${transferTotal.toLocaleString()} CUP\n`;
    }
    orderText += `• *Subtotal Contenido: $${total.toLocaleString()} CUP*\n`;
    
    if (transferFee > 0) {
      orderText += `• Recargo transferencia (${transferFeePercentage}%): +$${transferFee.toLocaleString()} CUP\n`;
    }
    
    if (isLocalPickup) {
      orderText += `🏪 Entrega en Local: GRATIS\n`;
    } else {
      orderText += `🚚 Entrega (${deliveryZone.split(' > ')[2]}): +$${deliveryCost.toLocaleString()} CUP\n`;
    }
    orderText += `\n🎯 *TOTAL FINAL: $${finalTotal.toLocaleString()} CUP*\n\n`;
    
    if (isLocalPickup) {
      orderText += `🏪 *ENTREGA EN LOCAL:*\n`;
      orderText += `📍 Ubicación: ${TV_A_LA_CARTA_LOCATION.address}\n`;
      orderText += `🗺️ Google Maps: ${TV_A_LA_CARTA_LOCATION.googleMapsUrl}\n`;
      orderText += `💰 Costo: GRATIS\n\n`;
      
      // Agregar información de distancia si está disponible
      if (distanceInfo.driving || distanceInfo.walking || distanceInfo.bicycling) {
        orderText += `🚗 *INFORMACIÓN DE DISTANCIA Y TIEMPO:*\n`;
        orderText += `📍 Desde: ${customerInfo.address}\n`;
        orderText += `📍 Hasta: ${TV_A_LA_CARTA_LOCATION.address}\n\n`;
        
        if (distanceInfo.driving?.status === 'OK') {
          orderText += `🚗 *En Automóvil:*\n`;
          orderText += `   📏 Distancia: ${distanceInfo.driving.distance}\n`;
          orderText += `   ⏱️ Tiempo estimado: ${distanceInfo.driving.duration}\n\n`;
        }
        
        if (distanceInfo.bicycling?.status === 'OK') {
          orderText += `🚴 *En Bicicleta (eléctrica/pedales):*\n`;
          orderText += `   📏 Distancia: ${distanceInfo.bicycling.distance}\n`;
          orderText += `   ⏱️ Tiempo estimado: ${distanceInfo.bicycling.duration}\n\n`;
        }
        
        if (distanceInfo.walking?.status === 'OK') {
          orderText += `🚶 *Caminando:*\n`;
          orderText += `   📏 Distancia: ${distanceInfo.walking.distance}\n`;
          orderText += `   ⏱️ Tiempo estimado: ${distanceInfo.walking.duration}\n\n`;
        }
      }
    } else {
      orderText += `📍 *ZONA DE ENTREGA:*\n`;
      orderText += `${deliveryZone.replace(' > ', ' → ')}\n`;
      orderText += `💰 Costo de entrega: $${deliveryCost.toLocaleString()} CUP\n\n`;
    }
    
    orderText += `⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}\n`;
    orderText += `🌟 *¡Gracias por elegir TV a la Carta!*`;

    return { orderText, orderId };
  };

  const handleGenerateOrder = () => {
    if (!isFormValid) {
      alert('Por favor complete todos los campos requeridos antes de generar la orden.');
      return;
    }
    
    const { orderText } = generateOrderText();
    setGeneratedOrder(orderText);
    setOrderGenerated(true);
  };

  const handleCopyOrder = async () => {
    try {
      await navigator.clipboard.writeText(generatedOrder);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deliveryZone === 'Por favor seleccionar su Barrio/Zona') {
      alert('Por favor selecciona un barrio específico para la entrega.');
      return;
    }

    setIsProcessing(true);

    try {
      const { orderId } = generateOrderText();
      const { cashTotal, transferTotal } = calculateTotals();
      const transferFee = transferTotal - items.filter(item => item.paymentType === 'transfer').reduce((sum, item) => {
        const moviePrice = EMBEDDED_PRICES.moviePrice;
        const seriesPrice = EMBEDDED_PRICES.seriesPrice;
        const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
        return sum + basePrice;
      }, 0);

      const orderData: OrderData = {
        orderId,
        customerInfo,
        deliveryZone,
        deliveryCost,
        items,
        subtotal: total,
        transferFee,
        total: finalTotal,
        cashTotal,
        transferTotal,
        distanceInfo,
        isLocalPickup
      };

      await onCheckout(orderData);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZoneSelect = (zoneName: string) => {
    setDeliveryZone(zoneName);
    setShowDeliverySelector(false);
    setSelectedSector(null);
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Finalizar Pedido</h2>
                <p className="text-sm opacity-90">Complete sus datos para procesar el pedido</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-4 sm:p-6">
            {/* Order Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Calculator className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Resumen del Pedido</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                      ${total.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-gray-600">Subtotal Contenido</div>
                    <div className="text-xs text-gray-500 mt-1">{items.length} elementos</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                      ${deliveryCost.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-gray-600">Costo de Entrega</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {deliveryZone.split(' > ')[2] || 'Seleccionar zona'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border-2 border-green-300">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Total Final:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600">
                    ${finalTotal.toLocaleString()} CUP
                  </span>
                </div>
              </div>
            </div>

            {!orderGenerated ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                    <User className="h-5 w-5 mr-3 text-blue-600" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={customerInfo.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ingrese su nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+53 5XXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Calle, número, entre calles..."
                      />
                    </div>
                  </div>
                </div>

                {/* Modern Delivery Zone Selector */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                    <MapPin className="h-5 w-5 mr-3 text-green-600" />
                    Zona de Entrega
                  </h3>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <span className="text-sm">📍</span>
                      </div>
                      <h4 className="font-semibold text-green-900">Información de Entrega</h4>
                    </div>
                    <p className="text-sm text-green-700 ml-11">
                      Seleccione su zona para calcular el costo de entrega. Los precios pueden variar según la distancia.
                    </p>
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-4">
                    {/* Local Pickup Option */}
                    <div 
                      onClick={() => handleZoneSelect('Entrega en Local > TV a la Carta > Local TV a la Carta')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        isLocalPickup
                          ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-xl mr-4 ${
                            isLocalPickup ? 'bg-green-500' : 'bg-gray-100'
                          }`}>
                            <span className="text-2xl">🏪</span>
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg ${
                              isLocalPickup ? 'text-green-900' : 'text-gray-900'
                            }`}>
                              Entrega en Local
                            </h4>
                            <p className={`text-sm ${
                              isLocalPickup ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              Recoge tu pedido directamente en nuestro local
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {TV_A_LA_CARTA_LOCATION.address}
                            </p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold ${
                          isLocalPickup 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          GRATIS
                        </div>
                      </div>
                      
                      {isLocalPickup && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <a
                            href={TV_A_LA_CARTA_LOCATION.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Ver Ubicación en Google Maps
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Home Delivery Option */}
                    <div 
                      onClick={() => setShowDeliverySelector(!showDeliverySelector)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        !isLocalPickup && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg'
                          : showDeliverySelector
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-xl mr-4 ${
                            !isLocalPickup && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                              ? 'bg-blue-500' 
                              : 'bg-gray-100'
                          }`}>
                            <span className="text-2xl">🚚</span>
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg ${
                              !isLocalPickup && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                                ? 'text-blue-900' 
                                : 'text-gray-900'
                            }`}>
                              Entrega a Domicilio
                            </h4>
                            <p className={`text-sm ${
                              !isLocalPickup && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                                ? 'text-blue-700' 
                                : 'text-gray-600'
                            }`}>
                              {!isLocalPickup && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                                ? `${deliveryZone.split(' > ')[2]} - $${deliveryCost.toLocaleString()} CUP`
                                : 'Selecciona tu zona de entrega'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {!isLocalPickup && deliveryZone !== 'Por favor seleccionar su Barrio/Zona' && (
                            <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold mr-3">
                              ${deliveryCost.toLocaleString()} CUP
                            </div>
                          )}
                          <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                            showDeliverySelector ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </div>
                    </div>

                    {/* Modern Zone Selector */}
                    {showDeliverySelector && (
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-blue-200 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-bold text-gray-900 flex items-center">
                            <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                            Seleccionar Zona de Entrega
                          </h4>
                          
                          <div className="flex items-center space-x-3">
                            {/* Search */}
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Buscar zona..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            
                            {/* View Mode Toggle */}
                            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                              <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${
                                  viewMode === 'grid' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <Grid className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${
                                  viewMode === 'list' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <List className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Zones Display */}
                        <div className="max-h-96 overflow-y-auto">
                          {viewMode === 'grid' ? (
                            /* Grid View */
                            <div className="space-y-6">
                              {Object.entries(filteredZones).map(([sectorName, sectorData]) => (
                                <div key={sectorName} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                  <div className="flex items-center mb-4">
                                    <div className={`bg-gradient-to-r ${sectorData.color} p-3 rounded-xl mr-4 shadow-lg`}>
                                      <span className="text-2xl">{sectorData.icon}</span>
                                    </div>
                                    <div>
                                      <h5 className="text-lg font-bold text-gray-900">{sectorName}</h5>
                                      <p className="text-sm text-gray-600">
                                        {Object.keys(sectorData.zones).length} zonas disponibles
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(sectorData.zones).map(([zoneName, cost]) => {
                                      const zoneDisplayName = zoneName.split(' > ')[2] || zoneName;
                                      return (
                                        <button
                                          key={zoneName}
                                          onClick={() => handleZoneSelect(zoneName)}
                                          className={`p-3 rounded-lg border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                                            deliveryZone === zoneName
                                              ? `border-blue-500 bg-gradient-to-r ${sectorData.color} text-white shadow-lg`
                                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className={`font-semibold text-sm ${
                                                deliveryZone === zoneName ? 'text-white' : 'text-gray-900'
                                              }`}>
                                                {zoneDisplayName}
                                              </p>
                                              <p className={`text-xs ${
                                                deliveryZone === zoneName ? 'text-white/80' : 'text-gray-600'
                                              }`}>
                                                {sectorName}
                                              </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                              deliveryZone === zoneName 
                                                ? 'bg-white/20 text-white' 
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                              ${cost.toLocaleString()} CUP
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* List View */
                            <div className="space-y-2">
                              {Object.entries(filteredZones).flatMap(([sectorName, sectorData]) =>
                                Object.entries(sectorData.zones).map(([zoneName, cost]) => {
                                  const zoneDisplayName = zoneName.split(' > ')[2] || zoneName;
                                  return (
                                    <button
                                      key={zoneName}
                                      onClick={() => handleZoneSelect(zoneName)}
                                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.01] ${
                                        deliveryZone === zoneName
                                          ? `border-blue-500 bg-gradient-to-r ${sectorData.color} text-white shadow-lg`
                                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className={`p-2 rounded-lg mr-4 ${
                                            deliveryZone === zoneName 
                                              ? 'bg-white/20' 
                                              : `bg-gradient-to-r ${sectorData.color}`
                                          }`}>
                                            <span className={`text-lg ${
                                              deliveryZone === zoneName ? 'text-white' : 'text-white'
                                            }`}>
                                              {sectorData.icon}
                                            </span>
                                          </div>
                                          <div>
                                            <p className={`font-semibold ${
                                              deliveryZone === zoneName ? 'text-white' : 'text-gray-900'
                                            }`}>
                                              {zoneDisplayName}
                                            </p>
                                            <p className={`text-sm ${
                                              deliveryZone === zoneName ? 'text-white/80' : 'text-gray-600'
                                            }`}>
                                              {sectorName}
                                            </p>
                                          </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full font-bold ${
                                          deliveryZone === zoneName 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                          ${cost.toLocaleString()} CUP
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                          
                          {Object.keys(filteredZones).length === 0 && searchTerm && (
                            <div className="text-center py-8">
                              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No se encontraron zonas
                              </h3>
                              <p className="text-gray-600 mb-4">
                                No hay zonas que coincidan con "{searchTerm}"
                              </p>
                              <button
                                onClick={() => setSearchTerm('')}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                Limpiar búsqueda
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Selected Zone Summary */}
                        {!isLocalPickup && deliveryZone !== 'Por favor seleccionar su Barrio/Zona' && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="bg-green-500 p-2 rounded-lg mr-3">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-green-900">Zona Seleccionada:</p>
                                  <p className="text-sm text-green-700">
                                    {deliveryZone.split(' > ')[2]} ({deliveryZone.split(' > ')[1]})
                                  </p>
                                </div>
                              </div>
                              <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                                ${deliveryCost.toLocaleString()} CUP
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {deliveryZone === 'Por favor seleccionar su Barrio/Zona' && (
                          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                            <div className="flex items-center">
                              <span className="text-orange-600 mr-2">⚠️</span>
                              <span className="text-sm font-medium text-orange-700">
                                Por favor seleccione una opción de entrega para continuar
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateOrder}
                    disabled={!isFormValid || deliveryZone === 'Por favor seleccionar su Barrio/Zona'}
                    className={`flex-1 px-6 py-4 rounded-xl transition-all font-medium ${
                      isFormValid && deliveryZone !== 'Por favor seleccionar su Barrio/Zona'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Generar Orden
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !isFormValid || deliveryZone === 'Por favor seleccionar su Barrio/Zona'}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Generated Order Display */
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <Check className="h-6 w-6 text-green-600 mr-3" />
                    Orden Generada
                  </h3>
                  <button
                    onClick={handleCopyOrder}
                    className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center ${
                      copied
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Orden
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-96 overflow-y-auto">
                  <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedOrder}
                  </pre>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setOrderGenerated(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Volver a Editar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !isFormValid}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl transition-all font-medium flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar por WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}