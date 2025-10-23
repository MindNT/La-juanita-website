import React, { useState, useEffect } from 'react';
import { assetUrl, handleImgError } from '../utils/imageHelpers';

const SelectorClock = ({ onTimeChange, selectedHour, selectedMinute }) => {
  const [timeOptions, setTimeOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Business hours configuration
  const BUSINESS_START_HOUR = 12; // 9 PM
  const BUSINESS_END_HOUR = 15;   // 12 AM (midnight)

  useEffect(() => {
    generateTimeOptions();
  }, []);

  useEffect(() => {
    // Set first available time as default if no time is selected
    if (timeOptions.length > 0 && !selectedHour && !selectedMinute) {
      const availableOptions = timeOptions.filter(option => option.available);
      if (availableOptions.length > 0) {
        const firstAvailable = availableOptions[0];
        onTimeChange(firstAvailable.hour.toString(), firstAvailable.minute.toString());
      }
    }
  }, [timeOptions, selectedHour, selectedMinute, onTimeChange]);

  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Generate all possible time slots (21:00 to 24:00 in 15-minute intervals)
    for (let hour = BUSINESS_START_HOUR; hour <= BUSINESS_END_HOUR; hour++) {
      const minutes = hour === BUSINESS_END_HOUR ? [0] : [0, 15, 30, 45]; // Only 24:00 for end hour
      
      minutes.forEach(minute => {
        const timeSlotHour = hour === 24 ? 0 : hour; // Convert 24 to 0 for display
        const timeSlotMinute = minute;
        
        // Check if this time slot is available (not in the past)
        // Special handling for midnight crossing
        const isAvailable = hour === 24 ? 
          (currentHour < 1 || currentHour >= 21) : // Available if current time is before 1 AM or after 9 PM
          (hour > currentHour) || (hour === currentHour && minute > currentMinute);

        const displayTime = formatDisplayTime(timeSlotHour, timeSlotMinute);
        
        options.push({
          hour: timeSlotHour,
          minute: timeSlotMinute,
          display: displayTime,
          available: isAvailable,
          value: `${timeSlotHour}:${timeSlotMinute.toString().padStart(2, '0')}`
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
    if (!selectedHour || !selectedMinute) return 'Seleccionar hora';
    
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
