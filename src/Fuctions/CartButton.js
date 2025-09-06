import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from 'react-native';
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
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');

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

  const handleQuantityPress = () => {
    setCustomQuantity(quantity.toString());
    setShowQuantityModal(true);
  };

  const handleCustomQuantitySubmit = async () => {
    const newQty = parseInt(customQuantity);
    
    if (isNaN(newQty) || newQty < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity (minimum 1)');
      return;
    }

    if (newQty > 999) {
      Alert.alert('Invalid Quantity', 'Maximum quantity allowed is 999');
      return;
    }

    try {
      await updateQuantity(newQty);
      setShowQuantityModal(false);
      setCustomQuantity('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    }
  };

  const handleCustomQuantityCancel = () => {
    setShowQuantityModal(false);
    setCustomQuantity('');
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
          <TouchableOpacity style={styles.countBox} onPress={handleQuantityPress}>
            <Text style={styles.countText}>{quantity}</Text>
          </TouchableOpacity>
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

      {/* Custom Quantity Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCustomQuantityCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Quantity</Text>
            <Text style={styles.modalSubtitle}>How many would you like?</Text>
            
            <TextInput
              style={styles.quantityInput}
              value={customQuantity}
              onChangeText={setCustomQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
              maxLength={3}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCustomQuantityCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCustomQuantitySubmit}
              >
                <Text style={styles.confirmButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: wp('30%'),
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
    width: wp('30%'),
    height: hp('6%'),
  },
  addButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: wp('4%'),
    padding: wp('6%'),
    width: wp('80%'),
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  modalSubtitle: {
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    fontSize: wp('5%'),
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: hp('3%'),
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    marginHorizontal: wp('2%'),
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#F70D24',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
});

export default CartButton;
