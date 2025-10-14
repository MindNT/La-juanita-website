import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import WhiteButtonIcon from '../utils/WhiteButtonIcon';
import WhiteButtonTrans from '../utils/WhiteButtonTrans';
import GreenButton from '../utils/GreenButton';


//const API_URL = "http://143.110.239.79:5010"; // tu base URL del backend
const API_URL = "https://lajuanita.mindnt.com.mx";
//const API_URL = "http://localhost:5010"; // tu base URL del backend

const ModalBilling = ({ isOpen, onClose }) => {
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
  const [deliveryType, setDeliveryType] = useState(''); // 'pickup', 'delivery', 'someone_else'
  const [location, setLocation] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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
    setDeliveryType('');
    setLocation('');
    setCustomAddress('');
    setIsLoadingLocation(false);
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

  const formatOrderForWhatsApp = () => {
    let message = `🍽️ *NUEVA ORDEN - LA JUANITA*\n\n`;
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
    message += `📱 *Teléfono:* ${customerInfo.phone}\n`;
    message += `📅 *Fecha:* ${customerInfo.date}\n`;
    message += `⏰ *Hora:* ${customerInfo.hour}:${customerInfo.minute}\n\n`;
    
    // Add delivery information
    if (deliveryType === 'pickup') {
      message += `🏪 *Tipo:* Recoger en tienda\n\n`;
    } else if (deliveryType === 'delivery') {
      message += `🚗 *Tipo:* Entrega a domicilio\n`;
      message += `📍 *Ubicación:* ${location}\n\n`;
    } else if (deliveryType === 'someone_else') {
      message += `👥 *Tipo:* Para alguien más\n`;
      message += `📍 *Dirección:* ${customAddress}\n\n`;
    }
    
    message += `🛒 *PEDIDO:*\n`;
    
    items.forEach(item => {
      message += `• ${item.quantity}x ${item.title} - $${item.price * item.quantity}\n`;
    });
    
    message += `\n💰 *Total: $${getTotalPrice()}*\n\n`;
    message += `¡Gracias por elegir La Juanita! 🙏`;
    
    return encodeURIComponent(message);
  };

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
      return data.exists;
    } catch (error) {
      console.error('Error verifying phone number:', error);
      alert('Error al verificar el número de teléfono. Inténtalo de nuevo.');
      return null;
    }
  };

  // Real API call function to add new customer
  const addCustomer = async (name, phone) => {
    try {
      const response = await fetch(`${API_URL}/customers/add-customer?name=${encodeURIComponent(name)}&phone=${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error al registrar el cliente. El pedido se enviará de todas formas.');
      return null;
    }
  };

  // Real API call function to save order
  const saveOrder = async (orderData) => {
    try {
      // Create query parameters
      const params = new URLSearchParams();
      params.append('phone', orderData.phone);
      params.append('total_amount', orderData.total_amount);
      params.append('items', JSON.stringify(orderData.items));
      params.append('maps_url', orderData.maps_url || '');
      params.append('promotions', JSON.stringify(orderData.promotions));
      
      const response = await fetch(`${API_URL}/orders/save-order?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar el pedido. El pedido se enviará por WhatsApp de todas formas.');
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
      setIsNewCustomer(response === 0);
      if (response === 1) {
        // For existing customers, get real order count from API
        const realOrderCount = await getOrderCountByPhone(customerInfo.phone);
        setOrderCount(realOrderCount);
      }
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
    
    if (deliveryType === 'someone_else' && !customAddress.trim()) {
      alert('Por favor ingresa la dirección para la entrega');
      return;
    }

    // If it's a new customer, add them to the database first
    if (isNewCustomer) {
      await addCustomer(customerInfo.name, customerInfo.phone);
    }

    // Prepare order data for saving
    const orderData = {
      phone: customerInfo.phone,
      items: {},
      total_amount: parseFloat(getTotalPrice()),
      maps_url: '',
      promotions: {} // Add promotions logic if needed
    };

    // Convert cart items to the required format
    items.forEach(item => {
      orderData.items[item.id] = item.quantity;
    });

    // Set maps_url based on delivery type
    if (deliveryType === 'delivery' && location) {
      orderData.maps_url = location;
    } else if (deliveryType === 'someone_else' && customAddress.trim()) {
      orderData.maps_url = customAddress.trim();
    }

    // Save the order to the database
    const saveResult = await saveOrder(orderData);
    
    // If order saving failed, ask user if they want to continue
    if (!saveResult) {
      const continueAnyway = window.confirm('¿Deseas continuar enviando el pedido por WhatsApp?');
      if (!continueAnyway) {
        return;
      }
    }
    
    const whatsappNumber = '525659105865'; // Replace with actual number
    const message = formatOrderForWhatsApp();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    resetForm(); // Reset form after successful order
    onClose();
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
            errorMessage = 'Permiso de ubicación denegado';
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
    if (deliveryType === 'someone_else' && !customAddress.trim()) return false;
    
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-3 py-6 sm:p-4 sm:py-8 md:py-12">
      <div className="relative bg-gradient-to-b from-red-900 via-red-800 to-red-950 rounded-xl sm:rounded-2xl shadow-2xl max-w-xs sm:max-w-sm md:max-w-lg w-full mx-2 my-2 sm:mx-4 sm:my-4 md:my-8 overflow-hidden border-2 sm:border-4 border-white max-h-[85vh] sm:max-h-[80vh] lg:max-h-[85vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-white hover:text-gray-300 transition-colors z-10 p-1 rounded-full touch-manipulation"
        >
          <svg className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
              Tu Orden
            </h1>
            <p className="text-white text-xs sm:text-sm opacity-80">
              Revisa y confirma tu pedido
            </p>
          </div>

          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="text-center text-white py-6 sm:py-8">
              <p className="text-sm sm:text-base">Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-48 sm:max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="bg-white bg-opacity-15 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight pr-2">{item.title}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-300 hover:text-red-100 p-1 -m-1 flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="bg-white bg-opacity-20 text-white w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-sm font-semibold"
                        >
                          -
                        </button>
                        <span className="text-white text-sm sm:text-base w-6 sm:w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="bg-white bg-opacity-20 text-white w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-sm font-semibold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-white font-bold text-sm sm:text-base">${item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <h3 className="text-white font-semibold text-base sm:text-lg">Información de contacto</h3>
                
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Número de teléfono"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1 p-3 sm:p-3 text-sm sm:text-base rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:border-opacity-60 focus:outline-none transition-all"
                  />
                  <GreenButton 
                    onClick={handleVerifyPhone}
                    disabled={!customerInfo.phone}
                  />
                </div>

                {isVerified && (
                  <>
                    <div className="text-white text-sm text-center p-2">
                      {isNewCustomer ? (
                        <>
                          <p className="mb-2">¡Bienvenido a La Juanita! Por favor ingresa tu nombre:</p>
                          <input
                            type="text"
                            placeholder="Nombre completo"
                            value={customerInfo.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full p-3 sm:p-3 text-sm sm:text-base rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:border-opacity-60 focus:outline-none transition-all"
                          />
                        </>
                      ) : (
                        <p className="text-green-300">
                          Este es tu pedido número {orderCount}, ¡gracias por tu preferencia!
                        </p>
                      )}
                    </div>

                    {/* Delivery Type Selection */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold text-sm">¿Cómo recibirás tu pedido?</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => setDeliveryType('pickup')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            deliveryType === 'pickup'
                              ? 'bg-white bg-opacity-25 border-white text-white'
                              : 'bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-opacity-20'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg">🏪</span>
                            <span className="font-medium">Recoger en tienda</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setDeliveryType('delivery')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            deliveryType === 'delivery'
                              ? 'bg-white bg-opacity-25 border-white text-white'
                              : 'bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-opacity-20'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg">🚗</span>
                            <span className="font-medium">Entrega a domicilio</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setDeliveryType('someone_else')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            deliveryType === 'someone_else'
                              ? 'bg-white bg-opacity-25 border-white text-white'
                              : 'bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-opacity-20'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg">👥</span>
                            <span className="font-medium">Para alguien más</span>
                          </div>
                        </button>
                      </div>

                      {/* Location/Address Input */}
                      {deliveryType === 'delivery' && (
                        <div className="space-y-2">
                          <button
                            onClick={getLocation}
                            disabled={isLoadingLocation}
                            className="w-full p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                          >
                            {isLoadingLocation ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Obteniendo ubicación...</span>
                              </>
                            ) : (
                              <>
                                <span>📍</span>
                                <span>Usar mi ubicación actual</span>
                              </>
                            )}
                          </button>
                          {location && (
                            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                              <p className="text-white text-sm">
                                <strong>Ubicación obtenida:</strong>
                              </p>
                              <a 
                                href={location} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-300 hover:text-blue-200 underline text-sm break-all"
                              >
                                Ver en Google Maps
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {deliveryType === 'someone_else' && (
                        <div className="space-y-2">
                          <label className="text-white text-sm font-medium block">Dirección completa:</label>
                          <textarea
                            placeholder="Ingresa la dirección completa (calle, número, colonia, referencias)"
                            value={customAddress}
                            onChange={(e) => setCustomAddress(e.target.value)}
                            rows={3}
                            className="w-full p-3 text-sm rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:border-opacity-60 focus:outline-none transition-all resize-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Time Selection - Only show after delivery type is selected */}
                    {deliveryType && (
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium block">
                          {deliveryType === 'pickup' ? 'Recogeré a las:' : 'Entregar a las:'}
                        </label>
                        <div className="text-xs text-white opacity-75 mb-2">
                          Horario disponible: {BUSINESS_START_HOUR}:00 - {BUSINESS_END_HOUR}:00
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-white text-xs mb-1 block opacity-80">Hora (24h)</label>
                            <div className="flex items-center justify-center space-x-2">
                              <input
                                type="text"
                                placeholder="12"
                                value={customerInfo.hour}
                                onChange={(e) => handleHourChange(e.target.value)}
                                className="w-16 p-3 text-sm sm:text-base text-center rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:border-opacity-60 focus:outline-none transition-all"
                                maxLength={2}
                              />
                              <span className="text-white text-lg font-bold">:</span>
                              <input
                                type="text"
                                placeholder="00"
                                value={customerInfo.minute}
                                onChange={(e) => handleMinuteChange(e.target.value)}
                                className="w-16 p-3 text-sm sm:text-base text-center rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:border-opacity-60 focus:outline-none transition-all"
                                maxLength={2}
                              />
                            </div>
                            <div className="text-xs text-white opacity-60 mt-1 text-center">
                              Ejemplo: 12:00, 13:30, 14:45
                            </div>
                          </div>
                        </div>

                        {/* Display selected time if valid */}
                        {customerInfo.hour && customerInfo.minute && validateSelectedTime() && (
                          <div className="text-center mt-2">
                            <div className="inline-block bg-white bg-opacity-20 rounded-lg px-3 py-1 text-white text-sm font-medium">
                              Hora seleccionada: {(() => {
                                const hours = parseInt(customerInfo.hour, 10);
                                const minutes = parseInt(customerInfo.minute, 10);
                                return formatDisplayTime(hours, minutes);
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Total */}
              <div className="bg-white text-red-900 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
                <div className="text-xl sm:text-2xl font-bold">Total: ${getTotalPrice()}</div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <WhiteButtonIcon
                  text="Enviar Pedido por WhatsApp"
                  onClick={handleSendOrder}
                  disabled={!isOrderValid()}
                  className={`w-full justify-center font-bold py-3 sm:py-3 text-sm sm:text-base rounded-full min-h-[48px] sm:min-h-auto ${!isOrderValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  iconPath="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
                />
                
                <WhiteButtonTrans
                  text="Seguir comprando"
                  onClick={onClose}
                  className="w-full justify-center font-semibold text-sm sm:text-base py-3 min-h-[48px] sm:min-h-auto"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalBilling;