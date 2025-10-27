import React, { useState, useEffect } from 'react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';

const SelectorClock = ({ onTimeChange, selectedHour, selectedMinute }) => {
  const [timeOptions, setTimeOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Business hours configuration
  const BUSINESS_START_HOUR = 12; // 12 PM
  const BUSINESS_END_HOUR = 15;   // 3 PM

  useEffect(() => {
    generateTimeOptions();
  }, []);

  // Eliminada la selección automática de la primera hora disponible. El usuario debe seleccionar manualmente.

  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Determinar lógica de visibilidad y disponibilidad
    // Entre 12:00 y 15:00, solo mostrar horarios futuros
    // Fuera de ese horario, mostrar todos los horarios
    let showAllSlots = false;
    if (currentHour >= 12 && currentHour < 15) {
      showAllSlots = false;
    } else {
      showAllSlots = true;
    }

    for (let hour = BUSINESS_START_HOUR; hour <= BUSINESS_END_HOUR; hour++) {
      const minutes = hour === BUSINESS_END_HOUR ? [0] : [0, 15, 30, 45];
      minutes.forEach(minute => {
        let isAvailable = true;
        if (!showAllSlots) {
          // Solo mostrar horarios futuros
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            isAvailable = false;
          }
        }
        const displayTime = formatDisplayTime(hour, minute);
        options.push({
          hour,
          minute,
          display: displayTime,
          available: isAvailable,
          value: `${hour}:${minute.toString().padStart(2, '0')}`
        });
      });
    }
    setTimeOptions(options);
  };

  const formatDisplayTime = (hour, minute) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleTimeSelect = (option) => {
    if (option.available) {
      onTimeChange(option.hour.toString(), option.minute.toString());
      setIsOpen(false);
    }
  };

  const getCurrentSelection = () => {
  if (!selectedHour || !selectedMinute) return 'Seleccionar hora de entrega';
    
    const hour = parseInt(selectedHour, 10);
    const minute = parseInt(selectedMinute, 10);
    return formatDisplayTime(hour, minute);
  };

  const isSelectedTimeAvailable = () => {
    if (!selectedHour || !selectedMinute) return true;
    
    const selectedOption = timeOptions.find(
      option => option.hour === parseInt(selectedHour, 10) && 
                option.minute === parseInt(selectedMinute, 10)
    );
    
    return selectedOption?.available ?? false;
  };

  return (
    <div className="relative">
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 text-sm rounded-xl bg-white/10 backdrop-blur-sm border transition-all duration-200 flex items-center justify-between ${
          isSelectedTimeAvailable() 
            ? 'text-white border-white/20 hover:border-white/40 focus:border-white/40' 
            : 'text-red-300 border-red-400/50'
        } focus:outline-none focus:ring-2 focus:ring-white/20`}
      >
        <span className={selectedHour && selectedMinute ? 'text-white' : 'text-white/50'}>
          {getCurrentSelection()}
        </span>
        <img 
          src={assetUrl('/assets/clock.svg')} 
          alt="Reloj" 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          onError={handleImgError} 
        />
      </button>

      {/* Time warning if selected time is not available */}
      {selectedHour && selectedMinute && !isSelectedTimeAvailable() && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-400/30 rounded-lg">
          <p className="text-red-300 text-xs text-center">
            Esta hora ya no está disponible. Por favor selecciona otra.
          </p>
        </div>
      )}

      {/* Dropdown menu - ONLY show available options */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl max-h-48 overflow-y-auto">
          <div className="p-2">
            {timeOptions.filter(option => option.available).map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTimeSelect(option)}
                className={`w-full p-3 text-left text-sm rounded-lg transition-all duration-200 flex items-center justify-between hover:bg-red-100 text-gray-800 cursor-pointer ${
                  selectedHour == option.hour && selectedMinute == option.minute
                    ? 'bg-red-200 text-red-800 font-medium'
                    : ''
                }`}
              >
                <span>{option.display}</span>
                {selectedHour == option.hour && selectedMinute == option.minute && (
                  <img 
                    src={assetUrl('/assets/check-circle.svg')} 
                    alt="Seleccionado" 
                    className="w-4 h-4 text-green-600" 
                    onError={handleImgError} 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Business hours info */}
      <div className="mt-2 text-xs text-white/60 text-center">
        Horario disponible: {BUSINESS_START_HOUR}:00 - {BUSINESS_END_HOUR}:00
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SelectorClock;
