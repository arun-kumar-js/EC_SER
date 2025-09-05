import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CartIcon from './CartIcon';

const TabHeader = ({ 
  title, 
  onMenuPress, 
  onCartPress, 
  showLocation = true, 
  showCart = true,
  showMenu = true 
}) => {
  return (
    <SafeAreaView edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', gap: wp('3.5%') }}>
          {showMenu && (
            <TouchableOpacity
              onPress={onMenuPress}
              activeOpacity={1}
              style={{ padding: wp('2%') }}
            >
              <Icon name="menu" size={wp('6%')} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.centerSection}>
          {showLocation ? (
            <View style={styles.locationContainer}>
              <Image
                source={require('../Assets/Images/Edit.png')}
                style={{ width: wp('4%'), height: hp('2%'), tintColor: '#fff' }}
              />
              <Text style={styles.locationText}>Choose Location</Text>
            </View>
          ) : (
            <Text style={styles.titleText}>{title}</Text>
          )}
        </View>
        
        {showCart && (
          <TouchableOpacity
            onPress={onCartPress}
            activeOpacity={1}
          >
            <CartIcon size={wp('6%')} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = {
  header: {
    backgroundColor: '#e60023',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1000,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2.5%'),
  },
  locationText: {
    color: '#fff',
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    fontSize: wp('3.5%'),
    lineHeight: wp('5.1%'),
    letterSpacing: 0,
  },
  titleText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: wp('4.5%'),
    textAlign: 'center',
  },
};

export default TabHeader;
