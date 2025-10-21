import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import WhiteButtonIcon from '../utils/WhiteButtonIcon';
import WhiteButtonTrans from '../utils/WhiteButtonTrans';
import GreenButton from '../utils/GreenButton';
import { assetUrl, handleImgError } from '../utils/imageHelpers';
import ModalSuccess from './ModalSuccess';

//const API_URL = "http://143.110.239.79:5010"; // tu base URL del backend
const API_URL = "https://lajuanita.mindnt.com.mx";
//const API_URL = "http://localhost:5010"; // tu base URL del backend

const ModalBilling = ({ isOpen, onClose, onStartProcessing, orderCode }) => {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  
  // CONFIGURABLE BUSINESS HOURS - Easy to modify
  const BUSINESS_START_HOUR = 12; // 12 PM (24h format)
  const BUSINESS_END_HOUR = 15;   // 3 PM (24h format)

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    date: '',
    hour: '',
    minute: ''
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [customerName, setCustomerName] = useState(''); // Add state for customer name
  const [deliveryType, setDeliveryType] = useState(''); // 'pickup', 'delivery', 'someone_else'
  const [location, setLocation] = useState('');
  const [customAddress, setCustomAddress] = useState({
    street: '',
    number: '',
    neighborhood: ''
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [promotionData, setPromotionData] = useState(null); // Store promotion results

  // Reset form to initial state
  const resetForm = () => {
    setCustomerInfo({
      name: '',
      phone: '',
      date: '',
      hour: '',
      minute: ''
    });
    setIsVerified(false);
    setIsNewCustomer(false);
    setOrderCount(0);
    setCustomerName(''); // Reset customer name
    setDeliveryType('');
    setLocation('');
    setCustomAddress({
      street: '',
      number: '',
      neighborhood: ''
    });
    setIsLoadingLocation(false);
    setPromotionData(null); // Reset promotion data
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHourChange = (value) => {
    // Only allow numbers and limit to 2 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 2);
    setCustomerInfo(prev => ({
      ...prev,
      hour: numericValue
    }));
  };

  const handleMinuteChange = (value) => {
    // Only allow numbers and limit to 2 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 2);
    setCustomerInfo(prev => ({
      ...prev,
      minute: numericValue
    }));
  };

  const handlePhoneChange = (value) => {
    // Only allow numbers and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setCustomerInfo(prev => ({
      ...prev,
      phone: numericValue
    }));
  };

  const formatDisplayTime = (hour, minute) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const validateTimeFormat = (timeString) => {
    // Check if format is HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(timeString);
  };

  const validateSelectedTime = () => {
    if (!customerInfo.hour || !customerInfo.minute) return false;
    
    const hours = parseInt(customerInfo.hour, 10);
    const minutes = parseInt(customerInfo.minute, 10);
    
    // Validate hour and minute ranges
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return false;
    }
    
    // Only validate business hours range
    return hours >= BUSINESS_START_HOUR && hours < BUSINESS_END_HOUR;
  };

  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const defaultDate = now.toISOString().split('T')[0];
      
      setCustomerInfo(prev => ({
        ...prev,
        date: defaultDate,
        hour: '12',
        minute: '00'
      }));
    }
  }, [isOpen]);

  // Real API call function to verify phone number
  const verifyPhoneNumber = async (phone) => {
    try {
      const response = await fetch(`${API_URL}/customers/verify-phone?phone=${phone}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return {
        exists: data.exists,
        name: data.name || ''
      };
    } catch (error) {
      console.error('Error verifying phone number:', error);
      alert('Error al verificar el número de teléfono. Inténtalo de nuevo.');
      return null;
    }
  };

  // Real API call function to get order count by phone
  const getOrderCountByPhone = async (phone) => {
    try {
      const response = await fetch(`${API_URL}/orders/count-by-phone?phone=${phone}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data.status === 'success' ? data.order_count : 0;
    } catch (error) {
      console.error('Error getting order count:', error);
      return 0; // Return 0 if there's an error
    }
  };

  const handleVerifyPhone = async () => {
    if (!customerInfo.phone) {
      alert('Por favor ingresa un número de teléfono');
      return;
    }

    const response = await verifyPhoneNumber(customerInfo.phone);
    if (response !== null) {
      setIsVerified(true);
      setIsNewCustomer(response.exists === 0);
      
      if (response.exists === 1) {
        // For existing customers, store the name and get real order count from API
        setCustomerName(response.name);
        const realOrderCount = await getOrderCountByPhone(customerInfo.phone);
        setOrderCount(realOrderCount);
      } else {
        // Clear customer name for new customers
        setCustomerName('');
      }
    }
  };

  // Real API call function to check for promotions
  const checkPromotions = async (orderData) => {
    try {
      // Transform items to the required format for the API
      const itemsForApi = {};
      orderData.items.forEach(item => {
        itemsForApi[item.id] = item.quantity;
      });

      // Prepare the promotion check data
      const promotionCheckData = {
        data: {
          sale_id: null, // Will be assigned by backend
          customer_id: null, // Will be assigned by backend
          code_order: orderData.orderCode || '',
          phone: orderData.customerInfo.phone,
          sale_date: new Date().toISOString(),
          items: itemsForApi,
          total_amount: orderData.totalPrice,
          promotions: {},
          maps_url: orderData.location || ''
        }
      };

      const response = await fetch(`${API_URL}/promotions/combo_checker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionCheckData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        return {
          hasPromotions: Object.keys(result.data.dict_combos_apply || {}).length > 0,
          promotions: result.data.dict_combos_apply || {},
          updatedTotal: result.data.total_amountOrder || orderData.totalPrice,
          discountPercentage: result.data.discount_percentage || 0,
          subtotal: result.data.subtotal || orderData.totalPrice
        };
      } else {
        return {
          hasPromotions: false,
          promotions: {},
          updatedTotal: orderData.totalPrice,
          discountPercentage: 0,
          subtotal: orderData.totalPrice
        };
      }
    } catch (error) {
      console.error('Error checking promotions:', error);
      // Return original data if promotion check fails
      return {
        hasPromotions: false,
        promotions: {},
        updatedTotal: orderData.totalPrice,
        discountPercentage: 0,
        subtotal: orderData.totalPrice
      };
    }
  };

  const handleSendOrder = async () => {
    // Validate required fields based on customer type
    if (isNewCustomer && !customerInfo.name) {
      alert('Por favor completa tu nombre');
      return;
    }
    
    if (!customerInfo.phone) {
      alert('Por favor completa el número de teléfono');
      return;
    }
    
    if (!customerInfo.hour || !customerInfo.minute) {
      alert('Por favor ingresa hora y minutos');
      return;
    }
    
    if (!validateSelectedTime()) {
      alert(`Por favor selecciona una hora válida entre ${BUSINESS_START_HOUR}:00 y ${BUSINESS_END_HOUR}:00`);
      return;
    }

    if (!deliveryType) {
      alert('Por favor selecciona un tipo de entrega');
      return;
    }
    
    if (deliveryType === 'delivery' && !location) {
      alert('Por favor obtén tu ubicación o ingresa una dirección');
      return;
    }
    
    if (deliveryType === 'someone_else' && (!customAddress.street.trim() || !customAddress.number.trim() || !customAddress.neighborhood.trim())) {
      alert('Por favor completa todos los campos de la dirección');
      return;
    }

    // STEP 1: Prepare initial order data for promotion check
    const initialOrderData = {
      customerInfo,
      deliveryType,
      location,
      customAddress,
      items,
      totalPrice: getTotalPrice(),
      isNewCustomer
    };

    // STEP 2: Check for promotions first
    const promotionResult = await checkPromotions(initialOrderData);

    // Store promotion data in state for display
    setPromotionData(promotionResult);

    // STEP 3: Prepare the final order data with promotions and discounted price
    const finalOrderData = {
      customerInfo,
      deliveryType,
      location,
      customAddress,
      items,
      promotions: promotionResult.promotions, // dict_combos_apply: {"4":1}
      originalTotal: getTotalPrice(),
      totalPrice: promotionResult.subtotal, // Use subtotal (with discount) as the final price
      discountPercentage: promotionResult.discountPercentage,
      hasPromotions: promotionResult.hasPromotions,
      isNewCustomer
    };

    // STEP 4: Generate order code and save order (delegate to parent)
    // The parent component will generate the order code and save with finalOrderData
    onStartProcessing(finalOrderData, (savedOrderData) => {
      setShowSuccessModal(true);
    });
  };

  const handleSuccessClose = () => {
    // Clear everything and reset to initial state
    clearCart();
    resetForm();
    setShowSuccessModal(false);
    onClose(); // Close the billing modal
  };

  const getLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en este navegador');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Call your endpoint to get Google Maps URL
          const response = await fetch(
            `${API_URL}/utils/generate-maps-url?lat=${latitude}&lng=${longitude}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data.google_maps_url) {
              setLocation(data.data.google_maps_url);
            } else {
              setLocation(`https://www.google.com/maps?q=${latitude},${longitude}`);
            }
          } else {
            // Fallback to manual URL creation
            setLocation(`https://www.google.com/maps?q=${latitude},${longitude}`);
          }
        } catch (error) {
          console.error('Error getting Google Maps URL:', error);
          // Fallback to manual URL creation
          const { latitude, longitude } = position.coords;
          setLocation(`https://www.google.com/maps?q=${latitude},${longitude}`);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        
        let errorMessage = 'No se pudo obtener la ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Puedes activarlo en la configuración de tu navegador y recargar la página.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }
        
        alert(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const isOrderValid = () => {
    if (!isVerified) return false;
    if (isNewCustomer && !customerInfo.name) return false;
    if (!customerInfo.phone || !validateSelectedTime()) return false;
    if (!deliveryType) return false;
    
    if (deliveryType === 'delivery' && !location) return false;
    if (deliveryType === 'someone_else' && (!customAddress.street.trim() || !customAddress.number.trim() || !customAddress.neighborhood.trim())) return false;
    
    return true;
  };

  // Get the display price (with discount if available)
  const getDisplayPrice = () => {
    if (promotionData && promotionData.hasPromotions) {
      return promotionData.subtotal;
    }
    return getTotalPrice();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="relative bg-gradient-to-br from-red-900/95 via-red-800/95 to-red-950/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-all duration-200 z-10 p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="relative p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Tu Orden
              </h1>
              <p className="text-white/70 text-sm">
                Revisa y confirma tu pedido
              </p>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="text-center text-white/80 py-12">
                <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                  </svg>
                </div>
                <p className="text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-8 max-h-64 overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.id} className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-medium text-sm leading-relaxed pr-3 flex-1">{item.title}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-300/80 hover:text-red-200 p-1.5 -m-1.5 flex-shrink-0 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        >
                          <img src={assetUrl('/assets/trash-2.svg')} alt="Eliminar" className="w-4 h-4" onError={handleImgError} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                          >
                            <img src={assetUrl('/assets/minus-circle.svg')} alt="Menos" className="w-4 h-4" onError={handleImgError} />
                          </button>
                          <span className="text-white text-base w-8 text-center font-semibold bg-white/10 rounded-lg py-1">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                          >
                            <img src={assetUrl('/assets/plus-circle.svg')} alt="Más" className="w-4 h-4" onError={handleImgError} />
                          </button>
                        </div>
                        <span className="text-white font-bold text-lg">${item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Info Form */}
                <div className="space-y-6 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg flex items-center space-x-2">
                      <img src={assetUrl('/assets/phone.svg')} alt="Teléfono" className="w-5 h-5" onError={handleImgError} />
                      <span>Información de contacto</span>
                    </h3>
                    
                    <div className="flex gap-3 relative">
                      <input
                        type="tel"
                        placeholder="Número de teléfono"
                        value={customerInfo.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="flex-1 p-3 text-sm rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 h-10"
                        maxLength={10}
                      />
                      
                      {/* Modern verification button - only shows when 10 digits */}
                      {customerInfo.phone.length === 10 && (
                        <div className="relative">
                          <button
                            onClick={handleVerifyPhone}
                            className="group h-10 px-2 sm:px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-green-500/25 hover:scale-105 min-w-0 flex-shrink-0"
                          >
                            <img src={assetUrl('/assets/check-circle.svg')} alt="Verificar" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" onError={handleImgError} />
                            <span className="text-xs sm:text-sm whitespace-nowrap">Verificar</span>
                          </button>
                          
                          {/* Tooltip/hint */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            Haz clic para continuar
                          </div>
                        </div>
                      )}
                      
                      {/* Progress indicator when typing */}
                      {customerInfo.phone.length > 0 && customerInfo.phone.length < 10 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                          <span className="text-white/60 text-xs">{customerInfo.phone.length}/10</span>
                          <div className="w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {isVerified && (
                      <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          {isNewCustomer ? (
                            <div className="space-y-3">
                              <p className="text-white/90 text-sm text-center">¡Bienvenido a La Juanita! Por favor ingresa tu nombre:</p>
                              <input
                                type="text"
                                placeholder="Nombre completo"
                                value={customerInfo.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full p-3 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                              />
                            </div>
                          ) : (
                            <p className="text-green-300/90 text-sm text-center">
                              Bienvenido {customerName}, gracias por tu preferencia, estamos listos para procesar tu pedido número {orderCount + 1}
                            </p>
                          )}
                        </div>

                        {/* Delivery Type Selection */}
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold text-base flex items-center space-x-2">
                            <img src={assetUrl('/assets/truck.svg')} alt="Entrega" className="w-5 h-5" onError={handleImgError} />
                            <span>¿Cómo recibirás tu pedido?</span>
                          </h4>
                          
                          <div className="grid grid-cols-3 gap-3">
                            {/* Pickup Option */}
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                onClick={() => setDeliveryType('pickup')}
                                className={`w-16 h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                  deliveryType === 'pickup'
                                    ? 'bg-white/25 border-white/60 shadow-lg scale-105'
                                    : 'bg-white/10 border-white/30 hover:bg-white/15 hover:border-white/40 hover:scale-105'
                                }`}
                              >
                                <img 
                                  src={assetUrl('/assets/store.svg')} 
                                  alt="Tienda" 
                                  className={`w-7 h-7 transition-all duration-200 ${
                                    deliveryType === 'pickup' ? 'brightness-110' : 'opacity-80'
                                  }`} 
                                  onError={handleImgError} 
                                />
                              </button>
                              <p className={`text-xs text-center leading-tight transition-all duration-200 ${
                                deliveryType === 'pickup' ? 'text-white font-medium' : 'text-white/70'
                              }`}>
                                Recoger en tienda
                              </p>
                            </div>
                            
                            {/* Delivery Option */}
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                onClick={() => setDeliveryType('delivery')}
                                className={`w-16 h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                  deliveryType === 'delivery'
                                    ? 'bg-white/25 border-white/60 shadow-lg scale-105'
                                    : 'bg-white/10 border-white/30 hover:bg-white/15 hover:border-white/40 hover:scale-105'
                                }`}
                              >
                                <img 
                                  src={assetUrl('/assets/truck.svg')} 
                                  alt="Domicilio" 
                                  className={`w-7 h-7 transition-all duration-200 ${
                                    deliveryType === 'delivery' ? 'brightness-110' : 'opacity-80'
                                  }`} 
                                  onError={handleImgError} 
                                />
                              </button>
                              <p className={`text-xs text-center leading-tight transition-all duration-200 ${
                                deliveryType === 'delivery' ? 'text-white font-medium' : 'text-white/70'
                              }`}>
                                Entrega a mi ubicación actual
                              </p>
                            </div>
                            
                            {/* Someone Else Option */}
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                onClick={() => setDeliveryType('someone_else')}
                                className={`w-16 h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                  deliveryType === 'someone_else'
                                    ? 'bg-white/25 border-white/60 shadow-lg scale-105'
                                    : 'bg-white/10 border-white/30 hover:bg-white/15 hover:border-white/40 hover:scale-105'
                                }`}
                              >
                                <img 
                                  src={assetUrl('/assets/users.svg')} 
                                  alt="Otra ubicación" 
                                  className={`w-7 h-7 transition-all duration-200 ${
                                    deliveryType === 'someone_else' ? 'brightness-110' : 'opacity-80'
                                  }`} 
                                  onError={handleImgError} 
                                />
                              </button>
                              <p className={`text-xs text-center leading-tight transition-all duration-200 ${
                                deliveryType === 'someone_else' ? 'text-white font-medium' : 'text-white/70'
                              }`}>
                                Entrega a otra ubicación
                              </p>
                            </div>
                          </div>

                          {/* Location/Address Input */}
                          {deliveryType === 'delivery' && (
                            <div className="space-y-3">
                              <button
                                onClick={getLocation}
                                disabled={isLoadingLocation}
                                className="w-full h-8 bg-green-600/90 hover:bg-green-600 disabled:bg-gray-600/50 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm text-sm"
                              >
                                {isLoadingLocation ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Obteniendo ubicación...</span>
                                  </>
                                ) : (
                                  <>
                                    <img src={assetUrl('/assets/map-pin.svg')} alt="Ubicación" className="w-4 h-4" onError={handleImgError} />
                                    <span>Usar mi ubicación actual</span>
                                  </>
                                )}
                              </button>
                              {location && (
                                <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                                   <div className="flex items-center space-x-2">
                                    <img src={assetUrl('/assets/check-circle.svg')} alt="Confirmado" className="w-4 h-4 text-green-400 flex-shrink-0" onError={handleImgError} />
                                    <p className="text-white/90 text-sm font-medium flex-shrink-0">
                                      Ubicación obtenida:
                                    </p>
                                    <a 
                                      href={location} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-300 hover:text-blue-200 underline text-sm truncate"
                                    >
                                      Ver en Google Maps →
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {deliveryType === 'someone_else' && (
                            <div className="space-y-3">
                              <label className="text-white/90 text-sm font-medium block">Dirección completa:</label>
                              
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  placeholder="Calle"
                                  value={customAddress.street}
                                  onChange={(e) => setCustomAddress(prev => ({ ...prev, street: e.target.value }))}
                                  className="w-full p-3 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                                />
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Número"
                                    value={customAddress.number}
                                    onChange={(e) => setCustomAddress(prev => ({ ...prev, number: e.target.value }))}
                                    className="w-full p-3 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                                  />
                                  
                                  <input
                                    type="text"
                                    placeholder="Colonia"
                                    value={customAddress.neighborhood}
                                    onChange={(e) => setCustomAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                                    className="w-full p-3 text-sm rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                                  />
                                </div>
                                
                                <div className="text-xs text-white/60 text-center">
                                  La dirección será: [Calle] [Número], [Colonia], Montemorelos, Nuevo León
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Time Selection */}
                        {deliveryType && (
                          <div className="space-y-4">
                            <h4 className="text-white font-semibold text-base flex items-center space-x-2">
                              <img src={assetUrl('/assets/clock.svg')} alt="Hora" className="w-5 h-5" onError={handleImgError} />
                              <span>
                                {deliveryType === 'pickup' ? 'Hora de recolección' : 'Hora de entrega'}
                              </span>
                            </h4>
                            
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                              <div className="text-xs text-white/70 mb-3 text-center">
                                Horario disponible: {BUSINESS_START_HOUR}:00 - {BUSINESS_END_HOUR}:00
                              </div>
                              
                              <div className="flex items-center justify-center space-x-3">
                                <div className="text-center">
                                  <label className="text-white/70 text-xs block mb-1">Hora</label>
                                  <input
                                    type="text"
                                    placeholder="12"
                                    value={customerInfo.hour}
                                    onChange={(e) => handleHourChange(e.target.value)}
                                    className="w-16 p-3 text-base text-center rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                                    maxLength={2}
                                  />
                                </div>
                                <div className="text-white text-xl font-bold mt-5">:</div>
                                <div className="text-center">
                                  <label className="text-white/70 text-xs block mb-1">Min</label>
                                  <input
                                    type="text"
                                    placeholder="00"
                                    value={customerInfo.minute}
                                    onChange={(e) => handleMinuteChange(e.target.value)}
                                    className="w-16 p-3 text-base text-center rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                                    maxLength={2}
                                  />
                                </div>
                              </div>

                              {/* Display selected time if valid */}
                              {customerInfo.hour && customerInfo.minute && validateSelectedTime() && (
                                <div className="text-center mt-4">
                                  <div className="inline-block bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2 text-green-200 text-sm font-medium">
                                    ✓ {(() => {
                                      const hours = parseInt(customerInfo.hour, 10);
                                      const minutes = parseInt(customerInfo.minute, 10);
                                      return formatDisplayTime(hours, minutes);
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="relative mb-6">
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-xl scale-105 opacity-30"></div>
                  
                  {/* Main total container */}
                  <div className="relative bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    {/* Top section - Items count */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white/70 text-sm font-medium">
                          {items.length} artículo{items.length !== 1 ? 's' : ''} en tu orden
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        <div className="w-1 h-1 bg-white/80 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Divider line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                    
                    {/* Show original price if there's a discount */}
                    {promotionData && promotionData.hasPromotions && (
                      <div className="text-center mb-2">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-white/50 text-sm line-through">
                            ${getTotalPrice()} MXN
                          </span>
                          <span className="bg-green-500/30 text-green-200 text-xs px-2 py-1 rounded-full font-medium">
                            -{promotionData.discountPercentage}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Total amount */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center space-x-2 mb-2">
                        <span className="text-white/60 text-sm font-medium">Total</span>
                        <div className="flex items-center">
                          <span className="text-3xl font-bold text-white tracking-tight">
                            ${getDisplayPrice()}
                          </span>
                          <span className="text-white/70 text-lg font-medium ml-1">MXN</span>
                        </div>
                      </div>
                      {promotionData && promotionData.hasPromotions && (
                        <p className="text-green-300/90 text-xs font-medium">
                          ¡Descuento aplicado!
                        </p>
                      )}
                    </div>
                    
                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-green-400/60 to-blue-400/60 rounded-full"></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <WhiteButtonIcon
                    text="Levantar Pedido"
                    onClick={handleSendOrder}
                    disabled={!isOrderValid()}
                    className={`justify-center font-bold text-sm rounded-xl transition-all duration-200 h-10 ${
                      !isOrderValid() 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:scale-[1.02] shadow-lg'
                    }`}
                    iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  
                  <WhiteButtonTrans
                    text="Volver"
                    onClick={onClose}
                    disabled={false}
                    className={`justify-center font-semibold text-sm rounded-xl transition-all duration-200 hover:bg-white/10 h-10`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Success Modal - now receives orderData with correct discounted price */}
      <ModalSuccess 
        isOpen={showSuccessModal} 
        onClose={handleSuccessClose}
        orderData={{
          customerInfo,
          deliveryType,
          location,
          customAddress,
          items,
          totalPrice: promotionData ? promotionData.subtotal : getTotalPrice(),
          originalTotal: getTotalPrice(),
          hasPromotions: promotionData?.hasPromotions || false,
          discountPercentage: promotionData?.discountPercentage || 0,
          isNewCustomer
        }}
        orderCode={orderCode}
      />
    </>
  );
};

export default ModalBilling;