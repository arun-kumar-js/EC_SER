import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchCartItems } from '../Fuctions/CartService';
import { onCartUpdated, offCartUpdated } from '../Fuctions/cartEvents';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CartIcon = ({ size = wp('6%'), color = '#fff', style = {} }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCartCount();
    
    // Listen for cart updates
    const listener = () => loadCartCount();
    onCartUpdated(listener);
    
    return () => {
      offCartUpdated(listener);
    };
  }, []);

  const loadCartCount = async () => {
    try {
      const cartItems = await fetchCartItems();
      const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalCount);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Icon name="cart-outline" size={size} color={color} />
      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartCount > 99 ? '99+' : cartCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -hp('1%'),
    right: -wp('2%'),
    backgroundColor: '#FF4444',
    borderRadius: wp('3%'),
    minWidth: wp('5%'),
    height: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
});

export default CartIcon;
