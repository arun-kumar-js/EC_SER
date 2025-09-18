import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Modal,
} from 'react-native';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  increaseProductQuantity,
  decreaseCartItemQuantity,
  removeProductFromCart,
} from '../Fuctions/CartService';
import { useCart } from '../Context/CartContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Cart = ({ navigation }) => {
  const { cartItems, refreshCart } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useFocusEffect(
    useCallback(() => {
      // Refresh cart data when screen comes into focus
      refreshCart();
    }, [refreshCart])
  );

  const increaseQuantity = async item => {
    try {
      await increaseProductQuantity(item);
      // The context will automatically update and trigger re-renders
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const decreaseQuantity = async item => {
    try {
      await decreaseCartItemQuantity(item);
      // The context will automatically update and trigger re-renders
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const removeItem = async (item) => {
    console.log('Remove button pressed for item:', item);
    try {
      await removeProductFromCart(item);
      // The context will automatically update and trigger re-renders
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
    }
  };

  const renderItem = ({ item }) => {
    const name =
      item.variants && item.variants.length > 0
        ? item.variants[0].product_name || item.name
        : item.name;
    const measurementUnit =
      item.variants && item.variants.length > 0
        ? item.variants[0].measurement_unit_name || '-'
        : '-';
    const unitPrice = item.variants[0].product_price || 0;
    const quantity = item.quantity || 0;
    const calculatedPrice = unitPrice * quantity;

    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{name}</Text>
          <Text>Qty: {measurementUnit}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.rmText}>RM</Text>
            <Text style={styles.priceText}>{calculatedPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => decreaseQuantity(item)}
              >
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNumber}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => increaseQuantity(item)}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item)}
            >
              <Text style={styles.removeText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.quantity || 0) *
        (item.variants[0].product_price || 0),
    0,
  );

  const itemCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  return (
    <>
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: hp('1%'),
              }}
            >
              <Text style={styles.modalTitle}>X</Text>
              <Text style={styles.modalHeaderText}> Remove Product</Text>
            </View>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this product from cart?
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    console.log('Removing item from cart:', itemToRemove);
                    await removeProductFromCart(itemToRemove);
                    const updatedItems = cartItems.filter(
                      cartItem =>
                        cartItem.id !== itemToRemove.id &&
                        cartItem.product_id !== itemToRemove.product_id,
                    );
                    console.log('Updated cart items:', updatedItems);
                    setCartItems(updatedItems);
                    console.log('Item removed successfully');
                  } catch (error) {
                    console.error('Failed to remove cart item:', error);
                    Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
                  }
                  setModalVisible(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalConfirmText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ImageBackground
        source={require('../Assets/Images/Cart.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={[
            styles.container,
            { flex: 1, backgroundColor: 'transparent', paddingTop: 0 },
          ]}
        >
          {/* Custom Header */}
          <View style={styles.customHeader}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => {
                if (navigation && navigation.goBack) {
                  navigation.goBack();
                }
              }}
            >
              <Image 
                source={require('../Assets/Images/Arrow.png')} 
                style={styles.backArrow} 
                resizeMode="contain" 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cart</Text>
            <View style={{ width: wp('9%') }} />
            {/* Placeholder for symmetry, must not contain raw text */}
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item, index) =>
              item.id?.toString() ?? index.toString()
            }
            renderItem={renderItem}
            removeClippedSubviews={false}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Your cart is empty.</Text>
            }
            contentContainerStyle={{
              paddingTop: hp('2%'),
              paddingBottom: hp('10%'),
            }}
          />
          <View style={styles.bottomContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalValue}>
                RM{totalPrice ? totalPrice.toFixed(2) : '0.00'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                cartItems.length === 0 && styles.disabledButton
              ]}
              onPress={() => {
                if (cartItems.length === 0) {
                  Alert.alert(
                    'Empty Cart',
                    'Please add items to your cart before proceeding to checkout.',
                    [{ text: 'OK' }]
                  );
                  return;
                }
                navigation.dispatch(CommonActions.navigate('AddressPage'));
              }}
              disabled={cartItems.length === 0}
            >
              <View style={styles.checkoutLeftSection}>
                <Text style={styles.checkoutTotalText}>
                  Total {itemCount} Item{itemCount !== 1 ? 's' : ''} RM {totalPrice ? totalPrice.toFixed(2) : '0.00'}
                </Text>
              </View>
              <View style={styles.checkoutRightSection}>
                <Text style={styles.checkoutButtonText}>CHECKOUT</Text>
                <View style={styles.checkoutIcon}>
                  <Text style={styles.checkoutArrow}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: wp('4%'),
  },
  header: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F70D24',
    paddingTop: hp('1%'),
    paddingBottom: hp('1%'),

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Montserrat-Bold',
  },
  headerBackButton: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('1%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('9%'),
    height: hp('5%'),
  },
  backArrow: {
    width: wp('5%'),
    height: hp('2.5%'),
    tintColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
    position: 'relative',
  },
  productImage: {
    width: wp('25%'),
    height: hp('12.5%'),
    borderRadius: wp('2%'),
    marginRight: wp('4%'),
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: wp('4.5%'),
    fontWeight: '600',
    marginBottom: hp('1%'),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: hp('1%'),
  },
  rmText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: wp('3.5%'),
    color: 'green',
    marginRight: wp('1%'),
  },
  priceText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: 'green',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    backgroundColor: '#F70D24',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('.9%'),
    borderRadius: wp('1%'),
  },
  qtyText: {
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
  },
  qtyNumber: {
    fontFamily: 'Montserrat-Regular',
    marginHorizontal: wp('3%'),
    fontSize: wp('4%'),
  },
  removeButton: {
    backgroundColor: '#ffebee',
    padding: wp('2%'),
    borderRadius: wp('2%'),
    minWidth: wp('8%'),
    minHeight: wp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  removeText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-Bold',
  },
  emptyText: {
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    color: '#888',
    fontSize: wp('4%'),
    marginTop: hp('7%'),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    position: 'absolute',
    bottom: hp('10%'),
    left: 0,
    right: 0,
  },
  footerText: {
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginRight: wp('4%'),
  },
  totalPriceContainer: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  totalPriceText: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F70D24',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    marginHorizontal: wp('2%'),
    borderRadius: wp('3%'),
    marginTop: hp('1%'),
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('1%'),
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#a7a4a4ff',
  },
  totalLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
    paddingVertical: hp('1%'),
  },
  checkoutLeftSection: {
    flex: 1,
  },
  checkoutTotalText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#fff',
  },
  checkoutRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  checkoutButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  checkoutIcon: {
    backgroundColor: '#fff',
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutArrow: {
    color: '#F70D24',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: wp('5%'),
    borderRadius: wp('2%'),
    width: '80%',
  },
  modalTitle: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'red',
  },
  modalHeaderText: {
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    fontSize: 16,
    color: '#000',
    marginLeft: wp('2%'),
  },
  modalMessage: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: hp('2%'),
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: wp('3%'),
  },
  modalCancelText: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    fontSize: 14,
    color: '#888',
  },
  modalConfirmText: {
    fontFamily: 'Montserrat-Regular',
    fontWeight: '400',
    fontSize: 14,
    color: 'red',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: hp('3%'),
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#ccc',
  },
});

export default Cart;
