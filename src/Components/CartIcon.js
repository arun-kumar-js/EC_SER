import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../Context/CartContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CartIcon = ({ size = wp('6%'), color = '#fff', style = {} }) => {
  const { totalQuantity } = useCart();

  return (
    <View style={[styles.container, style]}>
      <Icon name="cart-outline" size={size} color={color} />
      {totalQuantity > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalQuantity > 99 ? '99+' : totalQuantity}
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
