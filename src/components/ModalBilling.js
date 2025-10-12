import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import WhiteButtonIcon from '../utils/WhiteButtonIcon';
import WhiteButtonTrans from '../utils/WhiteButtonTrans';
import GreenButton from '../utils/GreenButton';

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
    message += `🛒 *PEDIDO:*\n`;
    
    items.forEach(item => {
      message += `• ${item.quantity}x ${item.title} - $${item.price * item.quantity}\n`;
    });
    
    message += `\n💰 *Total: $${getTotalPrice()}*\n\n`;
    message += `¡Gracias por elegir La Juanita! 🙏`;
    
    return encodeURIComponent(message);
  };

  const handleSendOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Por favor completa nombre y teléfono');
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
    
    const whatsappNumber = '525659105865'; // Replace with actual number
    const message = formatOrderForWhatsApp();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
  };

  // Fake API call function
  const verifyPhoneNumber = async (phone) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate random response (0 or 1)
        const response = Math.round(Math.random());
        if (response === 1) {
          // Simulate random order count for returning customers
          setOrderCount(Math.floor(Math.random() * 20) + 1);
        }
        resolve(response);
      }, 1000);
    });
  };

  const handleVerifyPhone = async () => {
    if (!customerInfo.phone) {
      alert('Por favor ingresa un número de teléfono');
      return;
    }

    const response = await verifyPhoneNumber(customerInfo.phone);
    setIsVerified(true);
    setIsNewCustomer(response === 0);
  };

  const isOrderValid = () => {
    if (!isVerified) return false;
    if (isNewCustomer && !customerInfo.name) return false;
    return customerInfo.phone && validateSelectedTime();
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
                )}

                <div className="space-y-2">
                  <label className="text-white text-sm font-medium block">Recogeré a las:</label>
                  <div className="text-xs text-white opacity-75 mb-2">
                    Horario disponible: {BUSINESS_START_HOUR}:00 - {BUSINESS_END_HOUR}:00
                  </div>
                  
                  <div className="space-y-3">
                    {/* Time Inputs */}
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