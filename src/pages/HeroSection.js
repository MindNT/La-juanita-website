import React, { useState } from 'react';
import { motion } from 'motion/react';
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const categoryButtonVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.8 + (index * 0.1)
      }
    }),
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 md:px-6 py-8 md:py-16 pt-24 sm:pt-28 md:pt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main content */}
      <div className="flex w-full items-center min-h-screen flex-col">
        <div className="flex w-full items-center flex-1 flex-col md:flex-row">
          {/* Left content */}
          <motion.div 
            className="w-full md:w-1/2 text-center md:text-left space-y-4 md:space-y-6 mb-8 md:mb-0"
            variants={textVariants}
          >
            {/* Main heading */}
            <motion.h1 
              className="text-white text-3xl md:text-6xl font-bold" 
              style={{ fontFamily: 'Intel, sans-serif' }}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              En la Juanita iniciamos pruebas y queremos invitarte
            </motion.h1>
            
            {/* Tags */}
            <motion.div 
              className="flex gap-2 md:gap-4 flex-wrap justify-center md:justify-start"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <WhiteTagsTrans text="Lunes - viernes" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <WhiteTagsTrans text="12:00 PM - 3:00 PM" />
              </motion.div>
            </motion.div>
            
            {/* Description */}
            <motion.p 
              className="text-white text-base md:text-lg leading-relaxed max-w-lg mx-auto md:mx-0"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Por darnos tu confianza en este inicio, queremos recompensarte
            </motion.p>
            
            {/* Button */}
            <motion.div 
              onClick={scrollToMenu} 
              className="flex justify-center md:justify-start"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <WhiteButton text="Quiero ordenar" className="mt-4 md:mt-6" />
            </motion.div>
          </motion.div>
          
          {/* Right image */}
          <motion.div 
            className="w-full md:w-1/2 flex justify-center md:justify-end"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.img 
              src={getCurrentImage()}
              alt="Comida casera" 
              className="max-w-full h-auto object-cover md:max-h-none w-full max-w-md md:max-w-full"
              onError={handleImgError}
              key={activeCategory} // Re-animate when image changes
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
              whileHover={{
                scale: 1.02,
                rotate: 1,
                transition: { duration: 0.3 }
              }}
            />
          </motion.div>
        </div>

        {/* Category buttons - Hidden on mobile */}
        <motion.div 
          className="hidden md:flex justify-center md:justify-between gap-2 md:gap-4 flex-wrap w-full mt-8 md:mt-0"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 1.0
              }
            }
          }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              custom={index}
              variants={categoryButtonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <WhiteButtonTrans
                text={category.name}
                isActive={activeCategory === category.name}
                onClick={() => setActiveCategory(category.name)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
