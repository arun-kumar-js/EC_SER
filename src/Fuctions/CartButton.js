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
import { useCart } from '../Context/CartContext';
import { CART_BUTTON_CONFIG } from '../config/CartButtonConfig';

const CartButton = ({ product, initialQuantity = 0, onChange, tax = 0, size = 'medium' }) => {
  // Ensure size is valid
  const validSizes = ['small', 'medium', 'large'];
  const currentSize = validSizes.includes(size) ? size : 'medium';
  
  // Safety check for product
  if (!product) {
    return null;
  }
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');
  const { getProductQuantity, refreshCart } = useCart();
  
  const productId = product?.id ?? product?.product_id;
  const quantity = productId ? getProductQuantity(productId) : 0;

  // Get size-specific styles
  const getSizeStyles = () => {
    return CART_BUTTON_CONFIG.sizes[currentSize] || CART_BUTTON_CONFIG.sizes.medium;
  };

  const getTypographyStyles = () => {
    return CART_BUTTON_CONFIG.typography[currentSize] || CART_BUTTON_CONFIG.typography.medium;
  };

  const sizeStyles = getSizeStyles();
  const typographyStyles = getTypographyStyles();

  useEffect(() => {
    // Notify parent component of quantity changes
    onChange?.(quantity);
  }, [quantity, onChange]);

  const updateQuantity = async newQty => {
    try {
      // Ensure quantity never goes below 1
      if (newQty < 1) {
        newQty = 1;
      }

      await updateCartItem(product, newQty);
      // The context will automatically update and trigger re-renders
    } catch (error) {
      console.warn('Failed to update cart item:', error);
    }
  };

  const handleIncrease = async () => {
    try {
      await increaseProductQuantity(product);
      // The context will automatically update and trigger re-renders
    } catch (error) {
      console.warn('Failed to increase quantity:', error);
    }
  };

  const handleDecrease = async () => {
    try {
      await decreaseProductQuantity(product);
      // The context will automatically update and trigger re-renders
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
        <View style={[
          styles.cartContainer,
          {
            borderRadius: wp(sizeStyles.cartContainer.borderRadius),
            height: hp(sizeStyles.cartContainer.height),
            width: wp(sizeStyles.cartContainer.width),
            paddingHorizontal: wp(sizeStyles.cartContainer.paddingHorizontal),
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              {
                paddingHorizontal: wp(sizeStyles.quantityButton.paddingHorizontal),
                paddingVertical: hp(sizeStyles.quantityButton.paddingVertical),
                minWidth: wp(sizeStyles.quantityButton.minWidth),
                minHeight: hp(sizeStyles.quantityButton.minHeight),
              }
            ]}
            onPress={handleDecrease}
          >
            <Text style={[
              styles.quantityButtonText,
              {
                fontSize: wp(typographyStyles.quantityButtonText.fontSize),
              }
            ]}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.countBox,
              {
                borderRadius: wp(sizeStyles.countBox.borderRadius),
                paddingHorizontal: wp(sizeStyles.countBox.paddingHorizontal),
                paddingVertical: hp(sizeStyles.countBox.paddingVertical),
                marginLeft: wp(sizeStyles.countBox.marginHorizontal),
                marginRight: wp(sizeStyles.countBox.marginHorizontal),
                minWidth: wp(sizeStyles.countBox.minWidth),
              }
            ]} 
            onPress={handleQuantityPress}
          >
            <Text style={[
              styles.countText,
              {
                fontSize: wp(typographyStyles.countText.fontSize),
              }
            ]}>{quantity}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              {
                paddingHorizontal: wp(sizeStyles.quantityButton.paddingHorizontal),
                paddingVertical: hp(sizeStyles.quantityButton.paddingVertical),
                minWidth: wp(sizeStyles.quantityButton.minWidth),
                minHeight: hp(sizeStyles.quantityButton.minHeight),
              }
            ]}
            onPress={handleIncrease}
          >
            <Text style={[
              styles.quantityButtonText,
              {
                fontSize: wp(typographyStyles.quantityButtonText.fontSize),
              }
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              borderRadius: wp(sizeStyles.addButton.borderRadius),
              paddingVertical: hp(sizeStyles.addButton.paddingVertical),
              paddingHorizontal: wp(sizeStyles.addButton.paddingHorizontal),
              width: wp(sizeStyles.addButton.width),
              height: hp(sizeStyles.addButton.height),
              minHeight: hp(sizeStyles.addButton.minHeight),
              minWidth: wp(sizeStyles.addButton.minWidth),
            }
          ]}
          onPress={() => updateQuantity(1)}
        >
          <Text style={[
            styles.addButtonText,
            {
              fontSize: wp(typographyStyles.addButtonText.fontSize),
              textAlign: 'center',
              includeFontPadding: false,
              textAlignVertical: 'center',
              letterSpacing: 0.5,
            }
          ]}>ADD</Text>
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
    minHeight: hp(CART_BUTTON_CONFIG.spacing.wrapper.minHeight),
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CART_BUTTON_CONFIG.colors.primary,
    marginLeft: wp(CART_BUTTON_CONFIG.spacing.container.marginLeft),
    marginRight: wp(CART_BUTTON_CONFIG.spacing.container.marginRight),
  },
  quantityButton: {
    backgroundColor: CART_BUTTON_CONFIG.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: CART_BUTTON_CONFIG.colors.white,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  countBox: {
    backgroundColor: CART_BUTTON_CONFIG.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: CART_BUTTON_CONFIG.colors.text,
    fontWeight: 'bold',
    fontFamily: 'System',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: CART_BUTTON_CONFIG.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(CART_BUTTON_CONFIG.spacing.container.marginLeft),
    marginRight: wp(CART_BUTTON_CONFIG.spacing.container.marginRight),
  },
  addButtonText: {
    color: CART_BUTTON_CONFIG.colors.white,
    fontWeight: 'bold',
    fontFamily: 'System',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    letterSpacing: 0.5,
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
