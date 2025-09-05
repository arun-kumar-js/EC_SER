import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  updateCartItem,
  getProductQuantity,
  increaseProductQuantity,
  decreaseProductQuantity,
} from './CartService';
import { onCartUpdated, offCartUpdated } from './cartEvents';

const CartButton = ({ product, initialQuantity = 0, onChange, tax = 0 }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    const fetchQuantity = async () => {
      try {
        const productId = product.id ?? product.product_id;
        if (!productId) {
          console.warn('Invalid product id:', product);
          return;
        }
        const currentQuantity = await getProductQuantity(productId);
        setQuantity(currentQuantity);
        onChange?.(currentQuantity);
      } catch (error) {
        console.error('Error fetching product quantity:', error);
      }
    };

    fetchQuantity();

    // Listen for cart updates
    const listener = () => fetchQuantity();
    onCartUpdated(listener);

    return () => {
      offCartUpdated(listener);
    };
  }, [product, onChange]);

  const updateQuantity = async newQty => {
    try {
      // Ensure quantity never goes below 1
      if (newQty < 1) {
        newQty = 1;
      }

      const updatedQty = await updateCartItem(product, newQty);
      setQuantity(updatedQty);
      onChange?.(updatedQty);
    } catch (error) {
      console.warn('Failed to update cart item:', error);
    }
  };

  const handleIncrease = async () => {
    try {
      const newQty = await increaseProductQuantity(product);
      setQuantity(newQty);
      onChange?.(newQty);
    } catch (error) {
      console.warn('Failed to increase quantity:', error);
    }
  };

  const handleDecrease = async () => {
    try {
      const newQty = await decreaseProductQuantity(product);
      setQuantity(newQty);
      onChange?.(newQty);
    } catch (error) {
      console.warn('Failed to decrease quantity:', error);
    }
  };

  return (
    <View style={styles.cartButtonWrapper}>
      {quantity > 0 ? (
        <View style={styles.cartContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrease}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.countBox}>
            <Text style={styles.countText}>{quantity}</Text>
          </View>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrease}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => updateQuantity(1)}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cartButtonWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: hp('6%'),
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F70D24',
    borderRadius: wp('2%'),
    height: hp('6%'),
    paddingHorizontal: wp('1%'),
  },
  quantityButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    width: wp('12%'),
    height: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('6%'),
    fontFamily: 'Montserrat-Bold',
  },
  countBox: {
    backgroundColor: '#fff',
    borderRadius: wp('1%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    marginHorizontal: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: wp('12%'),
    minHeight: hp('6%'),
  },
  countText: {
    color: '#F70D24',
    fontWeight: 'bold',
    fontSize: wp('5%'),
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#F70D24',
    borderRadius: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    width: wp('12%'),
    height: hp('6%'),
  },
  addButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});

export default CartButton;
