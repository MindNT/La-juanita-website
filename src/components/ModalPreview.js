import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';
import WhiteButtonIcon from '../utils/WhiteButtonIcon';
import WhiteButtonTrans from '../utils/WhiteButtonTrans';

const ModalPreview = ({ isOpen, onClose, onConfirm, orderData }) => {
  
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

  const handleConfirmOrder = () => {
    // Prepare final order data with promotions and discounted price
    const finalOrderData = {
      customerInfo: orderData.customerInfo,
      deliveryType: orderData.deliveryType,
      location: orderData.location,
      customAddress: orderData.customAddress,
      items: orderData.items,
      promotions: orderData.promotions || {},
      originalTotal: orderData.originalTotal,
      totalPrice: orderData.totalPrice,
      discountPercentage: orderData.discountPercentage,
      hasPromotions: orderData.hasPromotions,
      isNewCustomer: orderData.isNewCustomer
    };

    onConfirm(finalOrderData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="relative bg-gradient-to-br from-red-900/95 via-red-800/95 to-red-950/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.4 
            }}
          >
            
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
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-300/10 rounded-2xl blur-xl scale-105 opacity-30"></div>

            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <img 
                    src={assetUrl('/assets/check-circle.svg')} 
                    alt="Revisar" 
                    className="w-8 h-8 brightness-200" 
                    onError={handleImgError} 
                  />
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2">
                  Revisar Pedido
                </h2>
                <p className="text-white/90 text-sm">
                  Verifica que todo esté correcto antes de confirmar
                </p>
              </div>

              {/* Order Preview Ticket */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 mb-6">
                
                {/* Items Detail */}
                <div className="mb-4 pb-3 border-b border-white/20">
                  <h4 className="text-white font-semibold text-xs mb-3 border-b border-white/20 pb-1">
                    Artículos del Pedido
                  </h4>
                  <div className="space-y-2">
                    {orderData.items.map((item, index) => (
                      <div key={item.id || index} className="flex justify-between items-start text-xs">
                        <div className="flex-1">
                          <p className="text-white/90 leading-tight">
                            {item.quantity}x {item.title}
                          </p>
                          <p className="text-white/60 text-[10px]">
                            ${item.price} c/u
                          </p>
                        </div>
                        <span className="text-white font-medium ml-2">
                          ${item.price * item.quantity}
                        </span>
                      </div>
                    ))}
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

                {/* Time Info */}
                <div className="mb-4 pb-3 border-b border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs">Hora:</span>
                    <span className="text-white text-xs font-medium">
                      {formatDisplayTime(orderData.customerInfo.hour, orderData.customerInfo.minute)}
                    </span>
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
                      ${orderData.originalTotal || orderData.totalPrice} MXN
                    </span>
                  </div>
                  
                  {/* Show discount if available */}
                  {orderData.hasPromotions && orderData.discountPercentage > 0 && (
                    <div className="flex justify-between items-center text-green-300">
                      <span className="text-xs">
                        Descuento ({orderData.discountPercentage}%)
                      </span>
                      <span className="text-sm font-semibold">
                        -${(orderData.originalTotal - orderData.totalPrice).toFixed(0)} MXN
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">TOTAL:</span>
                    <span className="text-white font-bold text-lg">
                      ${orderData.totalPrice} MXN
                    </span>
                  </div>
                  {orderData.hasPromotions && (
                    <p className="text-green-300/90 text-xs font-medium">
                      ¡Promoción aplicada!
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <WhiteButtonIcon
                  text="Levantar Pedido"
                  onClick={handleConfirmOrder}
                  className="justify-center font-bold text-sm rounded-xl transition-all duration-200 h-10 hover:scale-[1.02] shadow-lg"
                  iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                
                <WhiteButtonTrans
                  text="Regresar"
                  onClick={onClose}
                  className="justify-center font-semibold text-sm rounded-xl transition-all duration-200 hover:bg-white/10 h-10"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalPreview;
