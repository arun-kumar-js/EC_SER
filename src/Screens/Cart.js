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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { onCartUpdated, offCartUpdated } from '../Fuctions/cartEvents';
import {
  fetchCartItems,
  increaseProductQuantity,
  decreaseCartItemQuantity,
  removeProductFromCart,
} from '../Fuctions/CartService';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Cart = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          const items = await fetchCartItems();
          setCartItems(items);
        } catch (error) {
          console.error('Failed to fetch cart items:', error);
        }
      };
      fetchItems();
      const subscription = onCartUpdated(fetchItems);
      return () => {
        offCartUpdated(subscription);
      };
    }, []),
  );

  const increaseQuantity = async item => {
    try {
      const newQty = await increaseProductQuantity(item);
      const updatedItems = cartItems.map(cartItem => {
        if (
          cartItem.id === item.id ||
          cartItem.product_id === item.product_id
        ) {
          return { ...cartItem, quantity: newQty };
        }
        return cartItem;
      });
      setCartItems(updatedItems);
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const decreaseQuantity = async item => {
    try {
      const newQty = await decreaseCartItemQuantity(item);
      const updatedItems = cartItems.map(cartItem => {
        if (
          cartItem.id === item.id ||
          cartItem.product_id === item.product_id
        ) {
          return { ...cartItem, quantity: newQty };
        }
        return cartItem;
      });
      setCartItems(updatedItems);
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const removeItem = async (item) => {
    console.log('Remove button pressed for item:', item);
    try {
      await removeProductFromCart(item);
      const updatedItems = cartItems.filter(
        cartItem =>
          cartItem.id !== item.id &&
          cartItem.product_id !== item.product_id,
      );
      console.log('Updated cart items:', updatedItems);
      setCartItems(updatedItems);
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
    const price = item.price || item.variants[0].product_price || '0.00';
    const quantity = item.quantity || 0;

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
            <Text style={styles.priceText}>{price}</Text>
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
        (item.price || item.variants[0].product_price || 0),
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
              <Text style={styles.headerBackText}>{'\u2190'}</Text>
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
            <View style={styles.checkoutFooter}>
              <Text style={styles.checkoutText}>
                Total {itemCount} Items RM
                {totalPrice ? totalPrice.toFixed(2) : '0.00'}
              </Text>
              
              <TouchableOpacity
                style={[styles.checkoutButton, {flexDirection: "row",gap:20}]}
                onPress={() => navigation.navigate('AddressPage')}
              >
                <Text style={styles.checkoutText}>Checkout</Text>
                <View style={styles.checkoutCircle}>
                  <Text style={styles.checkoutArrow}>{'>'}</Text>
                </View>
              </TouchableOpacity>
            </View>
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
  headerBackText: {
    color: '#fff',
    fontSize: wp('6%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
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
  checkoutFooter: {
    flexDirection: 'row',
    //justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    //paddingHorizontal: wp('5%'),
    marginHorizontal: hp('1%'),
    borderRadius: wp('4%'),
    backgroundColor: 'red',
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
  },
  checkoutText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#F70D24',
    
    paddingTop: hp('1%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('1%'),
    textAlign: 'center',
  },
  checkoutCircle: {
    backgroundColor: '#fff',
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('3.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp('2%'),
  },

  checkoutArrow: {
    color: 'red',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
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
});

export default Cart;
