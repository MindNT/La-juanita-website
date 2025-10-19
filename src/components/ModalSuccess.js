import React from 'react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';

const ModalSuccess = ({ isOpen, onClose, orderData, orderCode }) => {
  if (!isOpen || !orderData) return null;

  const formatDisplayTime = (hour, minute) => {
    const numHour = parseInt(hour, 10);
    const numMinute = parseInt(minute, 10);
    const ampm = numHour >= 12 ? 'PM' : 'AM';
    const displayHour = numHour > 12 ? numHour - 12 : numHour === 0 ? 12 : numHour;
    return `${displayHour}:${numMinute.toString().padStart(2, '0')} ${ampm}`;
  };

  const getDeliveryInfo = () => {
    if (orderData.deliveryType === 'pickup') {
      return {
        type: 'Recoger en tienda',
        address: 'La Juanita - Montemorelos, NL'
      };
    } else if (orderData.deliveryType === 'delivery') {
      return {
        type: 'Entrega a domicilio',
        address: 'Tu ubicación actual'
      };
    } else if (orderData.deliveryType === 'someone_else') {
      const fullAddress = `${orderData.customAddress.street.trim()} ${orderData.customAddress.number.trim()}, ${orderData.customAddress.neighborhood.trim()}, Montemorelos, NL`;
      return {
        type: 'Entrega a otra ubicación',
        address: fullAddress
      };
    }
  };

  const deliveryInfo = getDeliveryInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-green-700/95 via-green-600/95 to-green-800/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-all duration-200 z-10 p-2 hover:bg-white/10 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-300/10 rounded-2xl blur-xl scale-105 opacity-30"></div>
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="text-center mb-6">
            {/* Success Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <img 
                src={assetUrl('/assets/check-circle.svg')} 
                alt="Éxito" 
                className="w-8 h-8 brightness-200" 
                onError={handleImgError} 
              />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">
              ¡Orden Confirmada!
            </h2>
            <p className="text-white/90 text-sm">
              Tu pedido ha sido registrado exitosamente
            </p>
          </div>

          {/* Order Code - Highlighted */}
          <div className="mb-6 p-4 bg-white/20 rounded-xl border-2 border-white/40 text-center">
            <p className="text-white/80 text-xs mb-2 font-medium">CÓDIGO DE ORDEN</p>
            <div className="bg-white/90 rounded-lg py-3 px-4 mb-3">
              <p className="text-green-800 text-2xl font-bold tracking-widest">
                {orderCode}
              </p>
            </div>
            <p className="text-white/90 text-xs font-medium">
              Te recomendamos tomar una captura de pantalla de este código para dar seguimiento a tu pedido.
            </p>
          </div>

          {/* Ticket */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 mb-6">
            {/* Ticket Header */}
            <div className="text-center mb-4 pb-3 border-b border-white/20">
              <h3 className="text-white font-bold text-base mb-1">LA JUANITA</h3>
              <p className="text-white/70 text-xs">Resumen de Orden</p>
              <p className="text-white/60 text-xs mt-1">
                {new Date().toLocaleDateString('es-MX')} - {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Cliente:</span>
                <span className="text-white text-xs font-medium">
                  {orderData.customerInfo.name || 'Cliente registrado'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Teléfono:</span>
                <span className="text-white text-xs font-medium">
                  {orderData.customerInfo.phone}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Fecha:</span>
                <span className="text-white text-xs font-medium">
                  {orderData.customerInfo.date}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">Hora:</span>
                <span className="text-white text-xs font-medium">
                  {formatDisplayTime(orderData.customerInfo.hour, orderData.customerInfo.minute)}
                </span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-4 pb-3 border-b border-white/20">
              <div className="flex justify-between items-start">
                <span className="text-white/70 text-xs">Entrega:</span>
                <div className="text-right flex-1 ml-2">
                  <p className="text-white text-xs font-medium">{deliveryInfo.type}</p>
                  <p className="text-white/60 text-xs mt-0.5 break-words">{deliveryInfo.address}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 mb-4">
              <h4 className="text-white font-semibold text-xs border-b border-white/20 pb-1">
                Resumen del Pedido
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-xs">
                  {orderData.items.length} artículo{orderData.items.length !== 1 ? 's' : ''}
                </span>
                <span className="text-white font-semibold text-sm">
                  ${orderData.totalPrice} MXN
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-sm">TOTAL:</span>
                <span className="text-white font-bold text-lg">
                  ${orderData.totalPrice} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                <img src={assetUrl('/assets/alert-circle.svg')} alt="Importante" className="w-5 h-5" onError={handleImgError} />
              </div>
              <div>
                <p className="text-yellow-100 font-medium text-xs mb-1">¡IMPORTANTE!</p>
                <p className="text-yellow-100/90 text-xs leading-relaxed">
                  Usa el código <span className="font-bold">{orderCode}</span> y tu número de teléfono para cualquier duda o aclaración.
                </p>
              </div>
            </div>
          </div>

          {/* Success indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full bg-white text-green-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
          >
            Continuar Navegando
          </button>
          
          {/* Bottom accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ModalSuccess;
