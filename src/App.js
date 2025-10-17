import './App.css';
import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import { assetUrl, handleImgError } from './utils/imageHelpers';
import Navbar from './components/Navbar';
import HeroSection from './pages/HeroSection';
import TopSection from './pages/TopSection';
import MenuSection from './pages/MenuSection';
import ComboSection from './pages/ComboSection';
import ClientesSection from './pages/ClientesSection';
import GallerySection from './pages/GallerySection';
import ContactoSection from './pages/ContactoSection';
import Footer from './pages/Footer';
import ModalBeta from './components/ModalBeta';
import ModalBilling from './components/ModalBilling';
import ModalPermissions from './components/ModalPermissions';
import ModalLoader from './components/ModalLoader';

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);

  //const API_URL = "http://143.110.239.79:5010"; // tu base URL del backend
  const API_URL = "https://lajuanita.mindnt.com.mx";
  //const API_URL = "http://localhost:5010"; // tu base URL del backend

  useEffect(() => {
    // Check if permissions have already been requested in this session
    const permissionsRequested = sessionStorage.getItem('permissions_requested');
    
    if (!permissionsRequested) {
      // Show permissions modal first
      const timer = setTimeout(() => {
        setShowPermissionsModal(true);
      }, 1000); // Slightly longer delay for better UX

      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
  };

  const handleClosePermissions = () => {
    setShowPermissionsModal(false);
  };

  const handleCartClick = () => {
    setShowBillingModal(true);
  };

  const handleCloseBilling = () => {
    setShowBillingModal(false);
    // Force a complete reset - this ensures everything returns to initial state
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleStartProcessing = async (orderData, onComplete) => {
    setShowLoader(true);
    setLoaderProgress(0);

    try {
      // Simulate progress updates over 5 seconds
      const progressInterval = setInterval(() => {
        setLoaderProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5; // Slower increment for 5 second duration
        });
      }, 250); // 250ms intervals for smoother animation

      // Process order logic here (moved from ModalBilling)
      // If it's a new customer, add them to the database first
      if (orderData.isNewCustomer) {
        await addCustomer(orderData.customerInfo.name, orderData.customerInfo.phone);
      }

      // Prepare order data for saving
      const saveData = {
        phone: orderData.customerInfo.phone,
        items: {},
        total_amount: parseFloat(orderData.totalPrice),
        maps_url: '',
        promotions: {}
      };

      // Convert cart items to the required format
      orderData.items.forEach(item => {
        saveData.items[item.id] = item.quantity;
      });

      // Set maps_url based on delivery type
      if (orderData.deliveryType === 'delivery' && orderData.location) {
        saveData.maps_url = orderData.location;
      } else if (orderData.deliveryType === 'someone_else' && orderData.customAddress.street.trim()) {
        const fullAddress = `${orderData.customAddress.street.trim()} ${orderData.customAddress.number.trim()}, ${orderData.customAddress.neighborhood.trim()}, Montemorelos, Nuevo León`;
        saveData.maps_url = fullAddress;
      }

      // Save the order to the database
      const saveResult = await saveOrder(saveData);
      
      // Complete progress
      clearInterval(progressInterval);
      setLoaderProgress(100);

      // Wait for user to see the completion (3 seconds)
      setTimeout(() => {
        // Hide loader
        setShowLoader(false);
        setLoaderProgress(0);
        
        // Open WhatsApp
        const whatsappNumber = '525659105865';
        const message = formatOrderForWhatsApp(orderData);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        try {
          window.open(whatsappUrl, '_blank');
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          alert(`Error al abrir WhatsApp automáticamente. Puedes copiar este enlace y abrirlo manualmente: ${whatsappUrl}`);
        }
        
        // Show success modal
        setTimeout(() => {
          onComplete();
        }, 800);
      }, 3000);

    } catch (error) {
      console.error('Error processing order:', error);
      setShowLoader(false);
      setLoaderProgress(0);
      alert('Error al procesar el pedido. Por favor intenta de nuevo.');
    }
  };

  // Helper functions (moved from ModalBilling)
  const addCustomer = async (name, phone) => {
    try {
      const response = await fetch(`${API_URL}/customers/add-customer?name=${encodeURIComponent(name)}&phone=${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error al registrar el cliente. El pedido se enviará de todas formas.');
      return null;
    }
  };

  const saveOrder = async (orderData) => {
    try {
      // Create query parameters
      const params = new URLSearchParams();
      params.append('phone', orderData.phone);
      params.append('total_amount', orderData.total_amount);
      params.append('items', JSON.stringify(orderData.items));
      params.append('maps_url', orderData.maps_url || '');
      params.append('promotions', JSON.stringify(orderData.promotions));
      
      const response = await fetch(`${API_URL}/orders/save-order?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar el pedido. El pedido se enviará por WhatsApp de todas formas.');
      return null;
    }
  };

  const formatOrderForWhatsApp = (orderData) => {
    let message = `🍽️ *NUEVA ORDEN - LA JUANITA*\n\n`;
    message += `👤 *Cliente:* ${orderData.customerInfo.name}\n`;
    message += `📱 *Teléfono:* ${orderData.customerInfo.phone}\n`;
    message += `📅 *Fecha:* ${orderData.customerInfo.date}\n`;
    message += `⏰ *Hora:* ${orderData.customerInfo.hour}:${orderData.customerInfo.minute}\n\n`;
    
    // Add delivery information
    if (orderData.deliveryType === 'pickup') {
      message += `🏪 *Tipo:* Recoger en tienda\n\n`;
    } else if (orderData.deliveryType === 'delivery') {
      message += `🚗 *Tipo:* Entrega a domicilio\n`;
      message += `📍 *Ubicación:* ${orderData.location}\n\n`;
    } else if (orderData.deliveryType === 'someone_else') {
      const fullAddress = `${orderData.customAddress.street.trim()} ${orderData.customAddress.number.trim()}, ${orderData.customAddress.neighborhood.trim()}, Montemorelos, Nuevo León`;
      message += `👥 *Tipo:* Para alguien más\n`;
      message += `📍 *Dirección:* ${fullAddress}\n\n`;
    }
    
    message += `🛒 *PEDIDO:*\n`;
    
    orderData.items.forEach(item => {
      message += `• ${item.quantity}x ${item.title} - $${item.price * item.quantity}\n`;
    });
    
    message += `\n💰 *Total: $${orderData.totalPrice}*\n\n`;
    message += `¡Gracias por elegir La Juanita! 🙏`;
    
    return encodeURIComponent(message);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-950 relative overflow-hidden" 
           style={{background: 'linear-gradient(180deg, #820000 0%, #860000 50%, #200000 100%)'}}>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: '#fff',
              color: '#000',
              border: '1px solid #e5e7eb',
            },
          }}
        />
        
        {/* Modal de permisos */}
        <ModalPermissions isOpen={showPermissionsModal} onClose={handleClosePermissions} />
        
        {/* Modal de loader */}
        <ModalLoader isOpen={showLoader} progress={loaderProgress} />
        
        {/* Modal de facturación */}
        <ModalBilling 
          isOpen={showBillingModal} 
          onClose={handleCloseBilling} 
          onStartProcessing={handleStartProcessing}
        />
        
        {/* Navbar */}
        <Navbar onCartClick={handleCartClick} />
        
        {/* Watermark logo pattern - hidden on mobile */}
        <div className="absolute inset-0 pointer-events-none z-0 h-full hidden lg:block">
          {/* Primera fila */}
          <img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-70 h-auto top-[5%] right-[0%] rotate-[15deg]"
               onError={handleImgError} />
          
          {/* Segunda fila */}
          {/*<img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-72 h-auto top-[15%] left-[10%] -rotate-[12deg]"
               onError={handleImgError} />*/}
          
          {/* Tercera fila */}
          {/*<img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-76 h-auto top-[25%] right-[12%] rotate-[-30deg]"
               onError={handleImgError} />*/}
          
          {/* Cuarta fila */}
          {/*<img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-72 h-auto top-[35%] left-[18%] -rotate-[-45deg]"
               onError={handleImgError} />*/}
          
          {/* Quinta fila */}
          {/*<img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-60 h-auto top-[45%] right-[50%] rotate-[0deg]"
               onError={handleImgError} />*/}
          
          {/* Sexta fila */}
          {/*<img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-76 h-auto top-[55%] left-[15%] -rotate-[15deg]"
               onError={handleImgError} />*/}
          
          {/* Séptima fila */}
          {/*<img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-80 h-auto top-[65%] right-[18%] rotate-[10deg]"
               onError={handleImgError} />*/}
          
          {/* Octava fila */}
          <img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-70 h-auto top-[75%] left-[12%] -rotate-[22deg]"
               onError={handleImgError} />
          
          {/* Novena fila */}
          {/*<img src={assetUrl('/images/logo.png')} alt="" 
               className="absolute w-78 h-auto top-[85%] right-[14%] rotate-[16deg]"
               onError={handleImgError} />*/}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div id="hero">
            <HeroSection />
          </div>
          {/*<div id="destacados">
            <TopSection />
          </div>*/}
          <div id="menu">
            <MenuSection />
          </div>
          {/*<ComboSection />*/}
          {/*<div id="opiniones">
            <ClientesSection />
          </div>*/}
          {/*<div id="galeria">
            <GallerySection />
          </div>*/}
          {/*<div id="contacto">
            <ContactoSection />
          </div>*/}
          {/*<div id="footer">
            <Footer />
          </div>*/}
        </div>
      </div>
    </CartProvider>
  );
}

export default App;