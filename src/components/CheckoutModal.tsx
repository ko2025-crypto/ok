import React, { useState } from 'react';
import { X, User, MapPin, Phone, Copy, Check, MessageCircle, Calculator, DollarSign, CreditCard, Navigation, Clock, Car, Bike, MapPin as LocationIcon, ChevronRight, ChevronLeft, Home, Building, Search, Filter } from 'lucide-react';

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

// Base delivery zones - these will be combined with embedded zones
const BASE_DELIVERY_ZONES = {
  'Por favor seleccionar su Barrio/Zona': 0,
  'Entrega a Domicilio': 0,
};

// Zonas específicas de Santiago de Cuba con costos
const SANTIAGO_DELIVERY_ZONES = {
  // Centro de Santiago
  'Santiago de Cuba > Centro > Parque Céspedes': 50,
  'Santiago de Cuba > Centro > Plaza de Marte': 50,
  'Santiago de Cuba > Centro > Calle Enramadas': 50,
  'Santiago de Cuba > Centro > Plaza de Dolores': 50,
  
  // Zona Norte
  'Santiago de Cuba > Norte > Vista Alegre': 60,
  'Santiago de Cuba > Norte > Sueño': 70,
  'Santiago de Cuba > Norte > Los Olmos': 80,
  'Santiago de Cuba > Norte > Altamira': 90,
  
  // Zona Este
  'Santiago de Cuba > Este > Reparto Flores': 65,
  'Santiago de Cuba > Este > Micro 9': 75,
  'Santiago de Cuba > Este > Micro 10': 75,
  'Santiago de Cuba > Este > Reparto Terrazas': 85,
  
  // Zona Oeste
  'Santiago de Cuba > Oeste > Abel Santamaría': 70,
  'Santiago de Cuba > Oeste > 30 de Noviembre': 80,
  'Santiago de Cuba > Oeste > Reparto Versalles': 90,
  'Santiago de Cuba > Oeste > Micro 4': 85,
  
  // Zona Sur
  'Santiago de Cuba > Sur > Santa Bárbara': 75,
  'Santiago de Cuba > Sur > Reparto Sánchez Hechavarría': 85,
  'Santiago de Cuba > Sur > Micro 1': 70,
  'Santiago de Cuba > Sur > Reparto Portuondo': 80,
  
  // Zonas Periféricas (más alejadas)
  'Santiago de Cuba > Periferia > El Caney': 100,
  'Santiago de Cuba > Periferia > San Juan': 120,
  'Santiago de Cuba > Periferia > Siboney': 150,
  'Santiago de Cuba > Periferia > La Maya': 200,
  'Santiago de Cuba > Periferia > El Cobre': 180,
  'Santiago de Cuba > Periferia > Palma Soriano': 250,
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
  const [currentView, setCurrentView] = useState<'main' | 'santiago' | 'local'>('main');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [zoneSearchTerm, setZoneSearchTerm] = useState('');

  // Get delivery zones from embedded configuration
  const embeddedZonesMap = EMBEDDED_DELIVERY_ZONES.reduce((acc, zone) => {
    acc[zone.name] = zone.cost;
    return acc;
  }, {} as { [key: string]: number });
  
  // Combine embedded zones with base zones
  const allZones = { 
    ...BASE_DELIVERY_ZONES, 
    ...embeddedZonesMap
  };

  // Organizar zonas de Santiago por región
  const santiagoRegions = {
    'Centro': Object.entries(SANTIAGO_DELIVERY_ZONES).filter(([zone]) => zone.includes('> Centro >')),
    'Norte': Object.entries(SANTIAGO_DELIVERY_ZONES).filter(([zone]) => zone.includes('> Norte >')),
    'Este': Object.entries(SANTIAGO_DELIVERY_ZONES).filter(([zone]) => zone.includes('> Este >')),
    'Oeste': Object.entries(SANTIAGO_DELIVERY_ZONES).filter(([zone]) => zone.includes('> Oeste >')),
    'Sur': Object.entries(SANTIAGO_DELIVERY_ZONES).filter(([zone]) => zone.includes('> Sur >')),
    'Periferia': Object.entries(SANTIAGO_DELIVERY_ZONES).filter(([zone]) => zone.includes('> Periferia >'))
  };

  // Filtrar zonas por búsqueda
  const getFilteredZones = (zones: [string, number][]) => {
    if (!zoneSearchTerm) return zones;
    return zones.filter(([zoneName]) => 
      zoneName.toLowerCase().includes(zoneSearchTerm.toLowerCase())
    );
  };
  
  const deliveryCost = allZones[deliveryZone as keyof typeof allZones] || 0;
  const finalTotal = total + deliveryCost;
  const isLocalPickup = deliveryZone === 'Entrega en Local > TV a la Carta > Local TV a la Carta';

  // Get current transfer fee percentage from embedded prices
  const transferFeePercentage = EMBEDDED_PRICES.transferFeePercentage;

  const isFormValid = customerInfo.fullName.trim() !== '' && 
                     customerInfo.phone.trim() !== '' && 
                     customerInfo.address.trim() !== '' &&
                     deliveryZone !== 'Por favor seleccionar su Barrio/Zona';

  // Manejar cambio de zona de entrega
  const handleZoneSelection = (zoneName: string, cost: number) => {
    setDeliveryZone(zoneName);
    setCurrentView('main');
    setZoneSearchTerm('');
  };

  const handleViewChange = (view: 'main' | 'santiago' | 'local') => {
    setCurrentView(view);
    setSelectedRegion('');
    setZoneSearchTerm('');
    if (view === 'main') {
      setDeliveryZone('Por favor seleccionar su Barrio/Zona');
    }
  };

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
      // Usar OpenRouteService como alternativa gratuita
      const profile = mode === 'driving' ? 'driving-car' : mode === 'bicycling' ? 'cycling-regular' : 'foot-walking';
      
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

                {/* Delivery Zone */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center text-gray-900">
                    <MapPin className="h-5 w-5 mr-3 text-green-600" />
                    Zona de Entrega
                  </h3>
                  
                  {/* Sistema moderno de selección de zona */}
                  <div className="space-y-4">
                    {/* Vista principal */}
                    {currentView === 'main' && (
                      <div className="space-y-3">
                        {/* Entrega en Local */}
                        <div 
                          onClick={() => handleZoneSelection('Entrega en Local > TV a la Carta > Local TV a la Carta', 0)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            deliveryZone === 'Entrega en Local > TV a la Carta > Local TV a la Carta'
                              ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-green-100 p-3 rounded-xl mr-4 shadow-sm">
                                <Home className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">Entrega en Local</h4>
                                <p className="text-sm text-gray-600">Recoge en nuestro local</p>
                                <p className="text-xs text-green-600 font-medium mt-1">
                                  📍 {TV_A_LA_CARTA_LOCATION.address}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-md">
                                GRATIS
                              </div>
                              <p className="text-xs text-green-600 mt-1">$0 CUP</p>
                            </div>
                          </div>
                          
                          {deliveryZone === 'Entrega en Local > TV a la Carta > Local TV a la Carta' && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <div className="bg-white rounded-lg p-3 border border-green-200">
                                <div className="flex items-center mb-2">
                                  <LocationIcon className="h-4 w-4 text-green-600 mr-2" />
                                  <span className="text-sm font-semibold text-green-800">Ubicación del Local:</span>
                                </div>
                                <p className="text-sm text-green-700 ml-6 mb-2">{TV_A_LA_CARTA_LOCATION.address}</p>
                                <div className="ml-6">
                                  <a
                                    href={TV_A_LA_CARTA_LOCATION.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition-colors"
                                  >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Ver en Google Maps
                                  </a>
                                </div>
                              </div>
                              
                              {/* Información de distancia para entrega en local */}
                              {customerInfo.address.trim() !== '' && (
                                <div className="bg-white rounded-lg p-3 border border-green-200 mt-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <Navigation className="h-4 w-4 text-green-600 mr-2" />
                                      <span className="text-sm font-semibold text-green-800">Información de Distancia:</span>
                                    </div>
                                    {isCalculatingDistance && (
                                      <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                        <span className="text-xs text-green-600">Calculando...</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {!isCalculatingDistance && (distanceInfo.driving || distanceInfo.walking || distanceInfo.bicycling) && (
                                    <div className="space-y-2 ml-6">
                                      {distanceInfo.driving?.status === 'OK' && (
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center">
                                            <Car className="h-3 w-3 text-gray-600 mr-2" />
                                            <span>En automóvil:</span>
                                          </div>
                                          <span className="font-medium">{distanceInfo.driving.distance} • {distanceInfo.driving.duration}</span>
                                        </div>
                                      )}
                                      
                                      {distanceInfo.bicycling?.status === 'OK' && (
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center">
                                            <Bike className="h-3 w-3 text-gray-600 mr-2" />
                                            <span>En bicicleta:</span>
                                          </div>
                                          <span className="font-medium">{distanceInfo.bicycling.distance} • {distanceInfo.bicycling.duration}</span>
                                        </div>
                                      )}
                                      
                                      {distanceInfo.walking?.status === 'OK' && (
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center">
                                            <span className="text-gray-600 mr-2">🚶</span>
                                            <span>Caminando:</span>
                                          </div>
                                          <span className="font-medium">{distanceInfo.walking.distance} • {distanceInfo.walking.duration}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {!isCalculatingDistance && !distanceInfo.driving && !distanceInfo.walking && !distanceInfo.bicycling && (
                                    <p className="text-xs text-gray-500 ml-6">
                                      Ingrese su dirección completa para calcular distancia y tiempo estimado
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Entrega a Domicilio */}
                        <div 
                          onClick={() => handleViewChange('santiago')}
                          className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-3 rounded-xl mr-4 shadow-sm">
                                <Building className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">Entrega a Domicilio</h4>
                                <p className="text-sm text-gray-600">Santiago de Cuba y alrededores</p>
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                  📍 Ver zonas disponibles y precios
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="bg-blue-500 text-white px-3 py-2 rounded-xl font-bold text-sm shadow-md mr-2">
                                Desde $50
                              </div>
                              <ChevronRight className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        {/* Zonas embebidas adicionales */}
                        {Object.entries(embeddedZonesMap).map(([zoneName, cost]) => (
                          <div 
                            key={zoneName}
                            onClick={() => handleZoneSelection(zoneName, cost)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              deliveryZone === zoneName
                                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-xl mr-4 shadow-sm">
                                  <MapPin className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg">
                                    {zoneName.split(' > ')[2] || zoneName}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {zoneName.split(' > ')[1] || 'Zona personalizada'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-md">
                                  ${cost.toLocaleString()} CUP
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vista de zonas de Santiago */}
                    {currentView === 'santiago' && (
                      <div className="space-y-4">
                        {/* Header con navegación */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleViewChange('main')}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors mr-3"
                            >
                              <ChevronLeft className="h-5 w-5 text-blue-600" />
                            </button>
                            <div>
                              <h4 className="font-bold text-blue-900 text-lg">Zonas de Santiago de Cuba</h4>
                              <p className="text-sm text-blue-700">Selecciona tu zona para ver el costo de entrega</p>
                            </div>
                          </div>
                        </div>
                  </div>
                </div>

                        {/* Buscador de zonas */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                        {/* Navegación por regiones */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(santiagoRegions).map(([region, zones]) => {
                            const filteredZones = getFilteredZones(zones);
                            if (filteredZones.length === 0 && zoneSearchTerm) return null;
                            
                            const minPrice = Math.min(...zones.map(([, cost]) => cost));
                            const maxPrice = Math.max(...zones.map(([, cost]) => cost));
                            const priceRange = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}-${maxPrice}`;
                            
                            return (
                              <button
                                key={region}
                                onClick={() => setSelectedRegion(selectedRegion === region ? '' : region)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                  selectedRegion === region
                                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl mb-2">
                                    {region === 'Centro' ? '🏛️' : 
                                     region === 'Norte' ? '🌄' : 
                                     region === 'Este' ? '🌅' : 
                                     region === 'Oeste' ? '🌇' : 
                                     region === 'Sur' ? '🏞️' : '🏘️'}
                                  </div>
                                  <h5 className="font-bold text-gray-900 text-sm">{region}</h5>
                                  <p className="text-xs text-gray-600">{zones.length} zonas</p>
                                  <p className="text-xs text-blue-600 font-medium">{priceRange} CUP</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                            type="text"
                        {/* Lista de zonas de la región seleccionada */}
                        {selectedRegion && (
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 border-b border-gray-200">
                              <h5 className="font-bold text-blue-900">
                                Zonas de {selectedRegion} ({getFilteredZones(santiagoRegions[selectedRegion]).length})
                              </h5>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {getFilteredZones(santiagoRegions[selectedRegion]).map(([zoneName, cost]) => (
                                <div
                                  key={zoneName}
                                  onClick={() => handleZoneSelection(zoneName, cost)}
                                  className={`p-3 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                                    deliveryZone === zoneName ? 'bg-blue-100 border-blue-300' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h6 className="font-semibold text-gray-900 text-sm">
                                        {zoneName.split(' > ')[2]}
                                      </h6>
                                      <p className="text-xs text-gray-600">{selectedRegion}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="bg-blue-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                        ${cost.toLocaleString()} CUP
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                            placeholder="Buscar zona o barrio..."
                        {/* Mostrar todas las zonas si hay búsqueda */}
                        {zoneSearchTerm && !selectedRegion && (
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 border-b border-gray-200">
                              <h5 className="font-bold text-green-900">
                                Resultados de búsqueda para "{zoneSearchTerm}"
                              </h5>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {Object.entries(SANTIAGO_DELIVERY_ZONES)
                                .filter(([zoneName]) => 
                                  zoneName.toLowerCase().includes(zoneSearchTerm.toLowerCase())
                                )
                                .map(([zoneName, cost]) => (
                                  <div
                                    key={zoneName}
                                    onClick={() => handleZoneSelection(zoneName, cost)}
                                    className={`p-3 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-green-50 ${
                                      deliveryZone === zoneName ? 'bg-green-100 border-green-300' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h6 className="font-semibold text-gray-900 text-sm">
                                          {zoneName.split(' > ')[2]}
                                        </h6>
                                        <p className="text-xs text-gray-600">{zoneName.split(' > ')[1]}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                          ${cost.toLocaleString()} CUP
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                            value={zoneSearchTerm}
                    {/* Zona seleccionada - Resumen */}
                    {deliveryZone !== 'Por favor seleccionar su Barrio/Zona' && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-green-800">
                              Zona de entrega seleccionada:
                            </span>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 border border-green-300">
                            <span className="text-lg font-bold text-green-600">
                              ${deliveryCost.toLocaleString()} CUP
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-green-600 ml-11">
                          ✅ {isLocalPickup 
                            ? 'Entrega en Local - GRATIS' 
                            : deliveryZone.includes('Santiago de Cuba') 
                              ? `${deliveryZone.split(' > ')[2]} (${deliveryZone.split(' > ')[1]})` 
                              : deliveryZone.split(' > ')[2] || deliveryZone
                          }
                        </div>
                        
                        {/* Botón para cambiar zona */}
                        <div className="mt-3 ml-11">
                          <button
                            onClick={() => {
                              setCurrentView('main');
                              setDeliveryZone('Por favor seleccionar su Barrio/Zona');
                            }}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors"
                          >
                            Cambiar zona
                          </button>
                        </div>
                      </div>
                    )}
                            onChange={(e) => setZoneSearchTerm(e.target.value)}
                    {/* Mensaje de selección pendiente */}
                    {deliveryZone === 'Por favor seleccionar su Barrio/Zona' && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center">
                          <span className="text-orange-600 mr-2">⚠️</span>
                          <span className="text-sm font-medium text-orange-700">
                            Por favor seleccione su zona de entrega para continuar
                          </span>
                        </div>
                      </div>
                    )}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
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