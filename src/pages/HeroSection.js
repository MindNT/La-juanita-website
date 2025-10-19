import React, { useState } from 'react';
import WhiteButton from '../utils/WhiteButton';
import WhiteTagsTrans from '../utils/WhiteTagsTrans';
import WhiteButtonTrans from '../utils/WhiteButtonTrans';
import { assetUrl, handleImgError } from '../utils/imageHelpers';

const HeroSection = () => {
  const [activeCategory, setActiveCategory] = useState('platos fuertes');

  const categories = [
    { name: 'platos fuertes', image: assetUrl('/images/chilesrellenos.png') },
    { name: 'Guarniciones', image: assetUrl('/images/chilesrellenos.png') },
    { name: 'Caldos', image: assetUrl('/images/chilesrellenos.png') },
    { name: 'Ensaladas', image: assetUrl('/images/chilesrellenos.png') },
    { name: 'Bebidas', image: assetUrl('/images/chilesrellenos.png') },
    { name: 'Postres', image: assetUrl('/images/chilesrellenos.png') }
  ];

  const getCurrentImage = () => {
    const category = categories.find(cat => cat.name === activeCategory);
    return category ? category.image : assetUrl('/images/chilesrellenos.jpg');
  };

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 pt-24 sm:pt-28 md:pt-8">
      {/* Main content */}
      <div className="flex w-full items-center min-h-screen flex-col">
        <div className="flex w-full items-center flex-1 flex-col md:flex-row">
          {/* Left content */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-4 md:space-y-6 mb-8 md:mb-0">
            {/* Main heading */}
            {/* <h1 className="text-white text-3xl md:text-6xl font-bold" style={{ fontFamily: 'Intel, sans-serif' }}>
              El verdadero sabor casero
            </h1>*/}

            {/* Main heading */}
            <h1 className="text-white text-3xl md:text-6xl font-bold" style={{ fontFamily: 'Intel, sans-serif' }}>
              En la Juanita iniciamos pruebas y queremos invitarte
            </h1>
            
            {/* Tags */}
            <div className="flex gap-2 md:gap-4 flex-wrap justify-center md:justify-start">
              {/*<WhiteTagsTrans text="Pick Up" />*/}
              <WhiteTagsTrans text="Lunes - viernes" />
              <WhiteTagsTrans text="12:00 PM - 3:00 PM" />
            </div>
            
            {/* Description */}
            <p className="text-white text-base md:text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
              Por darnos tu confianza en este inicio, queremos recompensarte
            </p>
            
            {/* Button */}
            <div onClick={scrollToMenu} className="flex justify-center md:justify-start">
              <WhiteButton text="Quiero ordenar" className="mt-4 md:mt-6" />
            </div>
          </div>
          
          {/* Right image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img 
              src={getCurrentImage()}
              alt="Comida casera" 
              className="max-w-full h-auto object-cover md:max-h-none w-full max-w-md md:max-w-full"
              onError={handleImgError}
            />
          </div>
        </div>

        {/* Category buttons - Hidden on mobile */}
        <div className="hidden md:flex justify-center md:justify-between gap-2 md:gap-4 flex-wrap w-full mt-8 md:mt-0">
          {categories.map((category) => (
            <WhiteButtonTrans
              key={category.name}
              text={category.name}
              isActive={activeCategory === category.name}
              onClick={() => setActiveCategory(category.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
