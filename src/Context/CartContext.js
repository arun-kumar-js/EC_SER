import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCartItems, getCartSummary } from '../Fuctions/CartService';
import { onCartUpdated, offCartUpdated } from '../Fuctions/cartEvents';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadCartData = useCallback(async () => {
    try {
      setIsLoading(true);
      const summary = await getCartSummary();
      const items = await fetchCartItems();
      
      setCartItems(items);
      setCartCount(summary.totalItems);
      setTotalQuantity(summary.totalQuantity);
      
      console.log('🛒 Cart data loaded:', {
        items: summary.totalItems,
        quantity: summary.totalQuantity,
        cartItems: items.length
      });
    } catch (error) {
      console.error('Error loading cart data:', error);
      setCartItems([]);
      setCartCount(0);
      setTotalQuantity(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCart = useCallback(() => {
    loadCartData();
  }, [loadCartData]);

  const getProductQuantity = useCallback((productId) => {
    const item = cartItems.find(
      i => i.id === productId || i.product_id === productId
    );
    return item ? item.quantity : 0;
  }, [cartItems]);

  const isProductInCart = useCallback((productId) => {
    return getProductQuantity(productId) > 0;
  }, [getProductQuantity]);

  useEffect(() => {
    // Load initial cart data
    loadCartData();

    // Listen for cart updates
    const listener = () => {
      console.log('🛒 Cart update event received, refreshing...');
      loadCartData();
    };
    
    onCartUpdated(listener);

    return () => {
      offCartUpdated(listener);
    };
  }, [loadCartData]);

  const value = {
    cartItems,
    cartCount,
    totalQuantity,
    isLoading,
    refreshCart,
    getProductQuantity,
    isProductInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

