import React from 'react';
import WhiteButton from '../utils/WhiteButton';
import { useCart } from '../context/CartContext';

const ProductCard = ({ image, title, description, price, id, availability, applyPromotions }) => {
  const { addItem } = useCart();

  const handleAddClick = () => {
    addItem({
      id,
      image,
      title,
      description,
      price,
      availability,
      applyPromotions
    });
  };

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (availability <= 0) return { color: 'bg-[#A41262]', text: 'Agotado temporalmente', textColor: 'text-[#ffffff]' };
    return { color: 'bg-[#008F24]', text: `Aún hay ${availability} disponibles`, textColor: 'text-[#ffffff]' };
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="bg-white bg-opacity-15 p-2 sm:p-4 rounded-lg aspect-square flex flex-col max-w-sm mx-auto w-full relative">
      {/* Promotion Badge - Left Side */}
      {applyPromotions === 1 && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-1 rounded-md shadow-md">
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Promo
            </span>
          </div>
        </div>
      )}

      {/* Availability Badge - Right Side */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`${availabilityStatus.color} px-2 py-1 rounded-md shadow-md`}>
          <span className={`text-xs font-semibold ${availabilityStatus.textColor} uppercase tracking-wide`}>
            {availability <= 0 ? 'Agotado' : `${availability} Disp.`}
          </span>
        </div>
      </div>

      {/* Imagen centrada - moved down to avoid badge overlap */}
      <div className="flex justify-center mb-1 sm:mb-3 mt-6 sm:mt-8">
        <img 
          src={image} 
          alt={title} 
          className="max-w-full h-auto max-h-12 sm:max-h-24 md:max-h-28 object-contain"
        />
      </div>
      
      {/* Título alineado a la izquierda */}
      <h3 className="text-left font-bold mb-1 sm:mb-2 text-xs sm:text-base md:text-lg text-white leading-tight">
        {title}
      </h3>
      
      {/* Descripción alineada a la izquierda */}
      <p className="text-left text-xs sm:text-sm mb-auto text-white leading-snug">
        {description}
      </p>
      
      {/* Precio y botón en la parte inferior */}
      <div className="flex justify-between items-center mt-1 sm:mt-3">
        <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
          ${price}
        </span>
        <WhiteButton 
          text={availability <= 0 ? "Agotado" : "Agregar"}
          onClick={availability <= 0 ? undefined : handleAddClick}
          className={`text-xs sm:text-sm px-1 sm:px-3 py-1 sm:py-1 min-h-[28px] sm:min-h-auto ${
            availability <= 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={availability <= 0}
        />
      </div>
    </div>
  );
};

export default ProductCard;
