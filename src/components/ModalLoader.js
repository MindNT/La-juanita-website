import React from 'react';

const ModalLoader = ({ isOpen, progress }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-900/95 via-red-800/95 to-red-950/95 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="text-center p-8 max-w-md w-full bg-black/20 rounded-2xl border border-white/10">
        {/* Processing Icon */}
        <div className="w-24 h-24 mx-auto mb-8 relative">
          <div className="w-24 h-24 border-4 border-white/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 border-2 border-white/70 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Processing Text */}
        <h3 className="text-white text-2xl font-bold mb-3">
          Procesando tu orden
        </h3>
        <p className="text-white/80 text-base mb-8">
          Estamos preparando todo para ti...
        </p>
        
        {/* Progress Bar */}
        <div className="w-full max-w-sm mx-auto mb-8">
          <div className="flex justify-between text-sm text-white/70 mb-3">
            <span>Procesando</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-transparent border border-white/30 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
              }}
            ></div>
          </div>
        </div>
        
        {/* Processing Steps */}
        <div className="space-y-3">
          <div className={`flex items-center justify-center space-x-3 text-base transition-all duration-500 ${
            progress >= 20 ? 'text-white scale-105' : 'text-white/40'
          }`}>
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
              progress >= 20 ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/30'
            }`}></div>
            <span>Validando información</span>
            {progress >= 20 && (
              <div className="text-white animate-bounce">✓</div>
            )}
          </div>
          <div className={`flex items-center justify-center space-x-3 text-base transition-all duration-500 ${
            progress >= 40 ? 'text-white scale-105' : 'text-white/40'
          }`}>
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
              progress >= 40 ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/30'
            }`}></div>
            <span>Registrando cliente</span>
            {progress >= 40 && (
              <div className="text-white animate-bounce">✓</div>
            )}
          </div>
          <div className={`flex items-center justify-center space-x-3 text-base transition-all duration-500 ${
            progress >= 60 ? 'text-white scale-105' : 'text-white/40'
          }`}>
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
              progress >= 60 ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/30'
            }`}></div>
            <span>Guardando pedido</span>
            {progress >= 60 && (
              <div className="text-white animate-bounce">✓</div>
            )}
          </div>
          <div className={`flex items-center justify-center space-x-3 text-base transition-all duration-500 ${
            progress >= 80 ? 'text-white scale-105' : 'text-white/40'
          }`}>
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
              progress >= 80 ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/30'
            }`}></div>
            <span>Preparando WhatsApp</span>
            {progress >= 80 && (
              <div className="text-white animate-bounce">✓</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalLoader;
