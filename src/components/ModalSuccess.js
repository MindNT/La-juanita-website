import React from 'react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';

const ModalSuccess = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-green-700/95 via-green-600/95 to-green-800/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden border border-white/20">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-300/10 rounded-2xl blur-xl scale-105 opacity-30"></div>
        
        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <img 
              src={assetUrl('/assets/check-circle.svg')} 
              alt="Éxito" 
              className="w-10 h-10 brightness-200" 
              onError={handleImgError} 
            />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            ¡Gracias por ordenar en La Juanita!
          </h2>
          
          {/* Message */}
          <p className="text-white/90 text-base mb-6 leading-relaxed">
            Tu orden ha sido enviada exitosamente a nuestra plataforma.
          </p>
          
          {/* Success indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full bg-white text-green-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continuar
          </button>
          
          {/* Bottom accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ModalSuccess;
