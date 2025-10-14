import React, { useState, useEffect } from 'react';
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

  return (
    <section className="w-full py-6 sm:py-16 px-3 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <h2 className="text-white text-2xl sm:text-4xl lg:text-5xl font-bold mb-8 text-left">
          Descubre nuestro menú del día
        </h2>

        {/* Botones de categorías */}
        <div className="grid grid-cols-3 sm:flex sm:justify-start gap-2 sm:gap-4 mb-12">
          {categories.length > 0 ? (
            categories.map((category) => (
              <WhiteButtonMenu
                key={category.id}
                text={category.name}
                isActive={activeCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))
          ) : (
            <p className="text-white">Cargando categorías...</p>
          )}
        </div>

        {/* Grid de productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                image={item.img_item}
                title={item.Nombre}
                description={item.description || 'Sin descripción'}
                price={item.price}
                onAddClick={() => handleAddClick(item)}
              />
            ))}
          </div>
        ) : (
          <p className="text-white text-center">
            No hay productos disponibles para esta categoría hoy.
          </p>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
