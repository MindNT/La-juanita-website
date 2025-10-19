import React, { createContext, useContext, useReducer } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (item) => {
    const existingItem = state.items.find(existingItem => existingItem.id === item.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    // Check if we can add more items based on availability
    if (currentQuantity >= item.availability) {
      toast.error(`No hay más ${item.title} disponibles`, {
        description: `Solo quedan ${item.availability} en stock`,
        duration: 3000,
      });
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', payload: item });
    
    // Show toast notification
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      const remaining = item.availability - newQuantity;
      toast.success(`Se agregó otro ${item.title} al carrito`, {
        description: `Cantidad: ${newQuantity}${remaining > 0 ? ` (quedan ${remaining})` : ' (último disponible)'}`,
        duration: 3000,
      });
    } else {
      const remaining = item.availability - 1;
      toast.success(`${item.title} agregado al carrito`, {
        description: `$${item.price}${remaining > 0 ? ` (quedan ${remaining})` : ' (último disponible)'}`,
        duration: 3000,
      });
    }
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
