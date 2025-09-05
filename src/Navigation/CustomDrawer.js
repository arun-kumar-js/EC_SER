import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CustomDrawer = ({ navigation }) => {
  const menuItems = [
    {
      icon: 'home-outline',
      title: 'Home',
      onPress: () => navigation.navigate('Home'),
    },
    {
      icon: 'grid-outline',
      title: 'Categories',
      onPress: () => navigation.navigate('Category'),
    },
    {
      icon: 'heart-outline',
      title: 'Wishlist',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      icon: 'cart-outline',
      title: 'Cart',
      onPress: () => navigation.navigate('Cart'),
    },
    {
      icon: 'person-outline',
      title: 'Profile',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      icon: 'location-outline',
      title: 'My Addresses',
      onPress: () => navigation.navigate('AddressPage'),
    },
    {
      icon: 'document-text-outline',
      title: 'My Orders',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => navigation.navigate('Support'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About Us',
      onPress: () => navigation.navigate('About'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={wp('8%')} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Welcome User</Text>
            <Text style={styles.userEmail}>user@example.com</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemContent}>
              <Icon name={item.icon} size={wp('5%')} color="#333" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Icon name="chevron-forward" size={wp('4%')} color="#ccc" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={wp('5%')} color="#e60023" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#e60023',
    paddingTop: hp('8%'),
    paddingBottom: hp('4%'),
    paddingHorizontal: wp('4%'),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginBottom: hp('0.5%'),
    fontFamily: 'Montserrat-Bold',
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: wp('3%'),
  },
  menuContainer: {
    flex: 1,
    paddingTop: hp('2%'),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: wp('3.5%'),
    color: '#333',
    marginLeft: wp('3%'),
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  footer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('3%'),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
    backgroundColor: '#f8f8f8',
    borderRadius: wp('2%'),
  },
  logoutText: {
    fontSize: wp('3.5%'),
    color: '#e60023',
    fontWeight: '600',
    marginLeft: wp('2%'),
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default CustomDrawer;
