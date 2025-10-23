import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import WhiteButtonMenu from '../utils/WhiteButtonMenu';
import { useCart } from '../context/CartContext';


//const API_URL = "http://143.110.239.79:5010"; // tu base URL del backend
const API_URL = "https://lajuanita.mindnt.com.mx";
//const API_URL = "http://localhost:5010"; // tu base URL del backend


const MenuSection = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]); // 🔹 productos del día
  const { addItem } = useCart();

  // 🔹 1. Obtener fecha actual en formato YYYY-MM-DD (horario de México)
  const getTodayDate = () => {
    const today = new Date();
    // Convertir a horario de México (UTC-6 o UTC-5 dependiendo del horario de verano)
    const mexicoDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
    const year = mexicoDate.getFullYear();
    const month = String(mexicoDate.getMonth() + 1).padStart(2, '0');
    const day = String(mexicoDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 🔹 2. Cargar categorías desde el backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/items/categories`);
        const json = await res.json();
        if (json.status === "success") {
          const activeCats = json.data.filter(cat => cat.is_active === 1);
          setCategories(activeCats);
          setActiveCategory(activeCats[0]?.id || null); // usar id como clave
        }
      } catch (error) {
        console.error("❌ Error al obtener categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  // Add this function to format Google Drive URLs
  const formatGoogleDriveUrl = (url) => {
    if (!url) return '';
    
    // Extract the file ID from various Google Drive URL formats
    let fileId = '';
    
    // Format 1: https://drive.google.com/file/d/FILEID/view...
    const fileIdMatch = url.match(/\/d\/(.*?)(\/|$|\?)/);
    if (fileIdMatch) {
      fileId = fileIdMatch[1];
    }
    
    // Format 2: Already has the ID in uc?export=view format
    const ucMatch = url.match(/id=(.*?)($|&)/);
    if (ucMatch) {
      fileId = ucMatch[1];
    }

    if (!fileId) return url;
    
    // Use the direct download URL format
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };

  // 🔹 3. Cargar productos del día según fecha actual
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const today = getTodayDate();
        const res = await fetch(`${API_URL}/items/get-items-day?day=${today}`);
        const json = await res.json();
        if (json.status === "success") {
          // Format the image URLs before setting the products
          const formattedProducts = json.data.map(product => ({
            ...product,
            img_item: formatGoogleDriveUrl(product.img_item)
          }));
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("❌ Error al obtener productos:", error);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 4. Agregar producto al carrito
  const handleAddClick = (product) => addItem(product);

  // 🔹 5. Cambiar categoría activa
  const handleCategoryClick = (categoryId) => setActiveCategory(categoryId);

  // 🔹 6. Filtrar productos por categoría activa
  const filteredProducts = products.filter(p => p.category_id === activeCategory);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const categoryButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const productGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const productCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <section className="w-full py-6 sm:py-16 px-4 md:px-6">
      <div className="container mx-auto">
        {/* Título */}
        <motion.h2 
          className="text-white text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Descubre nuestro menú del día
        </motion.h2>

        {/* Botones de categorías */}
        <motion.div 
          className="flex flex-wrap justify-center sm:justify-between lg:justify-start gap-2 sm:gap-4 lg:gap-8 xl:gap-12 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={categoryButtonVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <WhiteButtonMenu
                  text={category.name}
                  isActive={activeCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              </motion.div>
            ))
          ) : (
            <motion.p 
              className="text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              Cargando categorías...
            </motion.p>
          )}
        </motion.div>

        {/* Grid de productos */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div 
              key={activeCategory}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 justify-items-center"
              variants={productGridVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {filteredProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={productCardVariants}
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.2 }
                  }}
                  layout
                >
                  <ProductCard
                    id={item.id}
                    image={item.img_item}
                    title={item.Nombre}
                    description={item.description || 'Sin descripción'}
                    price={item.price}
                    availability={item.product_counter || 0}
                    applyPromotions={item.apply_promotions}
                    onAddClick={() => handleAddClick(item)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p 
              key="no-products"
              className="text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              No hay productos disponibles para esta categoría hoy.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuSection;
