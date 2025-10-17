import React, { useState } from 'react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';
import GreenButton from '../utils/GreenButton';
import WhiteButtonTrans from '../utils/WhiteButtonTrans';

const ModalPermissions = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: intro, 2: popup permission, 3: location permission, 4: complete
  const [permissions, setPermissions] = useState({
    popup: null, // null, 'granted', 'denied'
    location: null // null, 'granted', 'denied'
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPopupPermission = async () => {
    setIsRequesting(true);
    try {
      // Try to open a popup window to test permission
      const testWindow = window.open('', '_blank', 'width=1,height=1');
      if (testWindow) {
        testWindow.close();
        setPermissions(prev => ({ ...prev, popup: 'granted' }));
        setStep(3); // Move to location permission
      } else {
        setPermissions(prev => ({ ...prev, popup: 'denied' }));
        // Still continue to location permission
        setStep(3);
      }
    } catch (error) {
      console.error('Popup permission error:', error);
      setPermissions(prev => ({ ...prev, popup: 'denied' }));
      setStep(3);
    }
    setIsRequesting(false);
  };

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    try {
      if (!navigator.geolocation) {
        setPermissions(prev => ({ ...prev, location: 'denied' }));
        setStep(4);
        setIsRequesting(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissions(prev => ({ ...prev, location: 'granted' }));
          setStep(4);
          setIsRequesting(false);
        },
        (error) => {
          console.error('Location permission error:', error);
          setPermissions(prev => ({ ...prev, location: 'denied' }));
          setStep(4);
          setIsRequesting(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } catch (error) {
      console.error('Location permission error:', error);
      setPermissions(prev => ({ ...prev, location: 'denied' }));
      setStep(4);
      setIsRequesting(false);
    }
  };

  const handleSkipPermissions = () => {
    setStep(4);
  };

  const handleFinish = () => {
    // Store permissions in sessionStorage for this session
    sessionStorage.setItem('permissions_requested', 'true');
    sessionStorage.setItem('popup_permission', permissions.popup || 'denied');
    sessionStorage.setItem('location_permission', permissions.location || 'denied');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className="relative bg-gradient-to-br from-red-900/95 via-red-800/95 to-red-950/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-white/20">
        
        <div className="relative p-6">
          {step === 1 && (
            <div className="text-center">
              {/* Logo */}
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <img 
                  src={assetUrl('/images/logonavbar.png')} 
                  alt="La Juanita" 
                  className="w-12 h-12 object-contain"
                  onError={handleImgError}
                />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                ¡Bienvenido a La Juanita!
              </h2>
              
              <p className="text-white/80 text-base mb-6 leading-relaxed">
                Para brindarte la mejor experiencia de pedido, necesitamos algunos permisos que nos ayudarán a:
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3 text-left">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <img src={assetUrl('/assets/phone.svg')} alt="Pop-up" className="w-3 h-3" onError={handleImgError} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Abrir WhatsApp</p>
                    <p className="text-white/70 text-xs">Para enviar tu pedido directamente</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-left">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <img src={assetUrl('/assets/map-pin.svg')} alt="Ubicación" className="w-3 h-3" onError={handleImgError} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Usar tu ubicación</p>
                    <p className="text-white/70 text-xs">Para entregas a domicilio más rápidas</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <GreenButton
                  text="Configurar permisos"
                  onClick={() => setStep(2)}
                  className="w-full justify-center"
                />
                <WhiteButtonTrans
                  text="Continuar sin permisos"
                  onClick={handleSkipPermissions}
                  className="w-full justify-center text-sm"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <img src={assetUrl('/assets/phone.svg')} alt="Pop-up" className="w-8 h-8" onError={handleImgError} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                Permitir ventanas emergentes
              </h3>
              
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Esto nos permitirá abrir WhatsApp automáticamente cuando hagas tu pedido, para una experiencia más fluida.
              </p>
              
              <div className="space-y-3">
                <GreenButton
                  text={isRequesting ? "Verificando..." : "Permitir pop-ups"}
                  onClick={requestPopupPermission}
                  disabled={isRequesting}
                  className="w-full justify-center"
                />
                <WhiteButtonTrans
                  text="Omitir este paso"
                  onClick={() => setStep(3)}
                  disabled={isRequesting}
                  className="w-full justify-center text-sm"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                <img src={assetUrl('/assets/map-pin.svg')} alt="Ubicación" className="w-8 h-8" onError={handleImgError} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                Acceso a tu ubicación
              </h3>
              
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Esto nos ayudará a calcular tiempos de entrega y ubicar tu dirección más fácilmente para pedidos a domicilio.
              </p>
              
              <div className="space-y-3">
                <GreenButton
                  text={isRequesting ? "Solicitando..." : "Permitir ubicación"}
                  onClick={requestLocationPermission}
                  disabled={isRequesting}
                  className="w-full justify-center"
                />
                <WhiteButtonTrans
                  text="Omitir este paso"
                  onClick={() => setStep(4)}
                  disabled={isRequesting}
                  className="w-full justify-center text-sm"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <img src={assetUrl('/assets/check-circle.svg')} alt="Listo" className="w-8 h-8" onError={handleImgError} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                ¡Configuración completa!
              </h3>
              
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Ya estás listo para disfrutar de la mejor comida casera de Montemorelos.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  permissions.popup === 'granted' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <div className="flex items-center space-x-2">
                    <img src={assetUrl('/assets/phone.svg')} alt="Pop-up" className="w-4 h-4" onError={handleImgError} />
                    <span className="text-white text-sm">Pop-ups</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    permissions.popup === 'granted' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {permissions.popup === 'granted' ? 'Permitido' : 'No permitido'}
                  </span>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  permissions.location === 'granted' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <div className="flex items-center space-x-2">
                    <img src={assetUrl('/assets/map-pin.svg')} alt="Ubicación" className="w-4 h-4" onError={handleImgError} />
                    <span className="text-white text-sm">Ubicación</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    permissions.location === 'granted' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {permissions.location === 'granted' ? 'Permitido' : 'No permitido'}
                  </span>
                </div>
              </div>
              
              <GreenButton
                text="¡Empezar a ordenar!"
                onClick={handleFinish}
                className="w-full justify-center"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPermissions;
