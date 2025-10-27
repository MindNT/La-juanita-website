import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';

const ModalSuccess = ({ isOpen, onClose, orderData, orderCode }) => {
  const modalRef = useRef(null);
  const ticketVisualRef = useRef(null);
  
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

  const downloadAsImage = async () => {
    try {
      // Try to dynamically import html2canvas
      let html2canvas;
      try {
        html2canvas = (await import('html2canvas')).default;
      } catch (importError) {
        console.log('html2canvas not available, using fallback method');
        // Fallback: prompt user to take screenshot
        alert('Para descargar el comprobante:\n\n1. Toma una captura de pantalla de esta ventana\n2. O haz clic derecho sobre el ticket y selecciona "Guardar imagen como"\n\nEn dispositivos móviles: Toma una captura de pantalla usando los botones de tu teléfono.');
        return;
      }
      
  // En PC, capturar solo el ticket visual
  const isMobile = window.innerWidth < 768;
  const targetElement = isMobile ? document.body : ticketVisualRef.current;
      
      if (targetElement && html2canvas) {
        // Show loading state
        const originalText = document.querySelector('[data-download-btn] span')?.textContent;
        const downloadBtn = document.querySelector('[data-download-btn]');
        if (downloadBtn) {
          downloadBtn.innerHTML = `
            <svg class="w-5 h-5 animate-spin lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Generando...</span>
          `;
        }

        // Wait a bit for the UI to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Determine if mobile and get screen dimensions
        const isMobile = window.innerWidth < 768;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Calculate optimal dimensions for mobile
        const ticketWidth = isMobile ? Math.min(340, screenWidth - 40) : 384;
        const scale = isMobile ? 3 : 3; // Higher scale for mobile to avoid blurriness
        
        // Enhanced canvas options optimized for mobile
        const canvasOptions = {
          backgroundColor: '#059669', // Green background
          scale: scale,
          useCORS: true,
          allowTaint: true,
          width: ticketWidth,
          height: 'auto', // Let height be calculated automatically
          scrollX: 0,
          scrollY: 0,
          logging: false,
          imageTimeout: 20000,
          // Mobile-specific optimizations
          ...(isMobile && {
            foreignObjectRendering: true,
            removeContainer: false,
            pixelRatio: window.devicePixelRatio || 1,
            onclone: (clonedDoc, element) => {
              // Ensure proper styling in the cloned element
              // Si necesitas manipular el DOM clonado, hazlo aquí
            }
          })
        };

        // Create canvas with proper error handling
        let canvas;
        try {
          canvas = await html2canvas(targetElement, canvasOptions);
        } catch (canvasError) {
          console.error('Canvas generation error:', canvasError);
          throw new Error('Error al generar la imagen del ticket');
        }
        
        // Enhanced download approach with better error handling
        const dataUrl = canvas.toDataURL('image/png', isMobile ? 0.92 : 0.98);
        
        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error('No se pudo generar la imagen');
        }
        
        // Create and trigger download
        const link = document.createElement('a');
        link.download = `la-juanita-orden-${orderCode}.png`;
        link.href = dataUrl;
        
        // Different download approach for mobile vs desktop
        if (isMobile) {
          // For mobile: try direct download first, fallback to opening in new tab
          document.body.appendChild(link);
          try {
            link.click();
          } catch (clickError) {
            // Fallback: open in new tab for manual save
            window.open(dataUrl, '_blank');
          }
          document.body.removeChild(link);
        } else {
          // Desktop: standard download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Restore button text
        if (downloadBtn && originalText) {
          downloadBtn.innerHTML = `
            <svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>${originalText}</span>
          `;
        }
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      
      // Restore button if there was an error
      const downloadBtn = document.querySelector('[data-download-btn]');
      if (downloadBtn) {
        downloadBtn.innerHTML = `
          <svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Descargar Comprobante</span>
        `;
      }
      
      // Enhanced error message with mobile considerations
      const isMobile = window.innerWidth < 768;
      const errorMessage = isMobile 
        ? 'Error al generar la imagen.\n\nPuedes:\n1. Tomar una captura de pantalla (botón encendido + volumen)\n2. Intentar descargar nuevamente\n3. Usar el navegador en modo escritorio'
        : 'Error al generar la imagen.\n\nPuedes:\n1. Tomar una captura de pantalla de este comprobante\n2. Intentar descargar nuevamente\n3. Usar Ctrl+P para imprimir';
      
      alert(errorMessage);
    }
  };

  const deliveryInfo = getDeliveryInfo();

  // Helper para mostrar la fecha y hora de entrega
  const formatDeliveryDatetime = (deliveryDatetime) => {
    if (!deliveryDatetime) return '';
    // Espera formato 'YYYY-MM-DD HH:mm'
    const [date, time] = deliveryDatetime.split(' ');
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    // Formato bonito: DD/MM/YYYY HH:mm AM/PM
    const ampm = parseInt(hour, 10) >= 12 ? 'PM' : 'AM';
    const displayHour = parseInt(hour, 10) > 12 ? parseInt(hour, 10) - 12 : parseInt(hour, 10) === 0 ? 12 : parseInt(hour, 10);
    return `${day}/${month}/${year} ${displayHour}:${minute} ${ampm}`;
  };

  return (
  <div className="fixed inset-0 z-50 overflow-hidden" ref={modalRef}>
      {/* Animated Green Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800"
        initial={{ 
          clipPath: "circle(0% at 0% 100%)" 
        }}
        animate={{ 
          clipPath: "circle(150% at 0% 100%)" 
        }}
        transition={{ 
          duration: 1.2, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Eliminado ticketRef y el bloque oculto del ticket para evitar error y duplicidad */}
      
      {/* Content Container - Responsive */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 lg:p-8">
        {/* Modal Content - Mobile: Full width with scroll, Desktop: Constrained */}
        <motion.div 
          className="relative w-full max-w-sm lg:max-w-2xl xl:max-w-3xl max-h-[95vh] lg:max-h-none overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: 0.6,
            duration: 0.6, 
            ease: "easeOut" 
          }}
        >
          {/* Close button - Responsive positioning */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-all duration-200 z-20 p-2 hover:bg-white/10 rounded-full lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-300/10 rounded-2xl lg:rounded-3xl blur-xl scale-105 opacity-30"></div>
          
          {/* Content - Responsive padding and layout with scroll */}
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 max-h-[95vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
            
            {/* Mobile Layout - Scrollable */}
            <div className="lg:hidden p-6">
              {/* Header */}
              <div className="text-center mb-6">
                {/* Success Icon */}
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 1.0,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <img 
                    src={assetUrl('/assets/check-circle.svg')} 
                    alt="Éxito" 
                    className="w-8 h-8 brightness-200" 
                    onError={handleImgError} 
                  />
                </motion.div>
                
                <motion.h2 
                  className="text-xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  ¡Gracias por tu pedido!
                </motion.h2>
                <motion.p 
                  className="text-white/90 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                >
                  Hemos recibido tu orden exitosamente. Te esperamos pronto en La Juanita
                </motion.p>
              </div>

              {/* Essential Info Ticket - Visual display only */}
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                {/* Ticket Header */}
                <div className="text-center mb-4 pb-3 border-b border-white/20">
                  <h3 className="text-white font-bold text-base mb-1">LA JUANITA</h3>
                  <p className="text-white/70 text-xs">Comprobante de Orden</p>
                  <p className="text-white/60 text-xs mt-1">
                    {new Date().toLocaleDateString('es-MX')} - {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Order Code in ticket */}
                <div className="mb-4 text-center">
                  <p className="text-white/70 text-xs mb-1">Código de Orden:</p>
                  <p className="text-white font-bold text-lg tracking-wider bg-white/20 rounded py-2">
                    {orderCode}
                  </p>
                </div>

                {/* Customer & Delivery Info */}
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
                      <p className="text-white text-xs font-medium">{getDeliveryInfo().type}</p>
                      <p className="text-white/60 text-xs mt-0.5 break-words">{getDeliveryInfo().address}</p>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">TOTAL PAGADO:</span>
                    <span className="text-white font-bold text-lg">
                      ${orderData.totalPrice} MXN
                    </span>
                  </div>
                  {orderData.hasPromotions && (
                    <p className="text-green-300/90 text-sm font-medium mt-1">
                      ¡Promoción aplicada! Ahorro: ${(orderData.originalTotal - orderData.totalPrice).toFixed(0)} MXN
                    </p>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-4 pt-3 border-t border-white/20">
                  <p className="text-white/80 text-xs text-center">
                    Presenta este comprobante al momento de {orderData.deliveryType === 'pickup' ? 'recoger' : 'recibir'} tu pedido
                  </p>
                </div>
              </motion.div>

              {/* Status Indicator */}
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
              >
                <p className="text-white/90 text-sm mb-3">Estado del pedido</p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </motion.div>
              
              {/* Mobile: No action buttons - only close button (X) available */}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block p-10">
              <div className="grid grid-cols-2 gap-12 items-start">
                
                {/* Left Column - Header and Status */}
                <div>
                  {/* Header */}
                  <div className="text-center mb-8">
                    {/* Success Icon */}
                    <motion.div 
                      className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 1.0,
                        duration: 0.6,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <img 
                        src={assetUrl('/assets/check-circle.svg')} 
                        alt="Éxito" 
                        className="w-12 h-12 brightness-200" 
                        onError={handleImgError} 
                      />
                    </motion.div>
                    
                    <motion.h2 
                      className="text-3xl font-bold text-white mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      ¡Gracias por tu pedido!
                    </motion.h2>
                    <motion.p 
                      className="text-white/90 text-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.5 }}
                    >
                      Hemos recibido tu orden exitosamente. Te esperamos pronto en La Juanita
                    </motion.p>
                  </div>

                  {/* Status Indicator */}
                  <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                  >
                    <p className="text-white/90 text-lg mb-4">Estado del pedido</p>
                    <div className="flex justify-center space-x-3">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.5 }}
                  >
                    {/* Download Button */}
                    <button
                      onClick={downloadAsImage}
                      data-download-btn
                      className="w-full bg-white/20 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base flex items-center justify-center space-x-3 border border-white/30"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Descargar Comprobante</span>
                    </button>

                    {/* Continue Button */}
                    <button
                      onClick={onClose}
                      className="w-full bg-white text-green-700 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
                    >
                      Continuar Navegando
                    </button>
                  </motion.div>
                </div>

                {/* Right Column - Visual Ticket Display */}
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  ref={ticketVisualRef}
                >
                  {/* Desktop ticket display content */}
                  <div className="text-center mb-6 pb-4 border-b border-white/20">
                    <h3 className="text-white font-bold text-xl mb-2">LA JUANITA</h3>
                    <p className="text-white/70 text-sm">Comprobante de Orden</p>
                    <p className="text-white/60 text-sm mt-1">
                      {new Date().toLocaleDateString('es-MX')} - {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="mb-6 text-center">
                    <p className="text-white/70 text-sm mb-2">Código de Orden:</p>
                    <p className="text-white font-bold text-2xl tracking-wider bg-white/20 rounded py-3">
                      {orderCode}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Cliente:</span>
                      <span className="text-white text-sm font-medium">
                        {orderData.customerInfo.name || 'Cliente registrado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Teléfono:</span>
                      <span className="text-white text-sm font-medium">
                        {orderData.customerInfo.phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Fecha:</span>
                      <span className="text-white text-sm font-medium">
                        {orderData.customerInfo.date}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Hora:</span>
                      <span className="text-white text-sm font-medium">
                        {formatDisplayTime(orderData.customerInfo.hour, orderData.customerInfo.minute)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 pb-4 border-b border-white/20">
                    <div className="flex justify-between items-start">
                      <span className="text-white/70 text-sm">Entrega:</span>
                      <div className="text-right flex-1 ml-3">
                        <p className="text-white text-sm font-medium">{getDeliveryInfo().type}</p>
                        <p className="text-white/60 text-sm mt-1 break-words">{getDeliveryInfo().address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-base">TOTAL PAGADO:</span>
                      <span className="text-white font-bold text-xl">
                        ${orderData.totalPrice} MXN
                      </span>
                    </div>
                    {orderData.hasPromotions && (
                      <p className="text-green-300/90 text-sm font-medium mt-2">
                        ¡Promoción aplicada! Ahorro: ${(orderData.originalTotal - orderData.totalPrice).toFixed(0)} MXN
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/20">
                    <p className="text-white/80 text-sm text-center">
                      Presenta este comprobante al momento de {orderData.deliveryType === 'pickup' ? 'recoger' : 'recibir'} tu pedido
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Bottom accent */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModalSuccess;
