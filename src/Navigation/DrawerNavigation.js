import React from 'react';
import { createDrawerNavigator, useDrawerStatus } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Import your existing screens
import BottomTap from './BottomTap';
import ReferAndEarn from '../Screens/ReferAndEarn';
import { deleteAccount } from '../Fuctions/DeleteAccountService';
import { useUserProfile } from '../Context/UserProfileContext';

const Drawer = createDrawerNavigator();

// Custom Drawer Content Component
const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const { userData, isLoading, clearUserData } = useUserProfile();
  const drawerStatus = useDrawerStatus();



  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear user data using context
              await clearUserData();
              
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              
              Alert.alert('Success', 'You have been logged out successfully');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get user ID from user data
              const userId = userData?.user_id || userData?.id;
              
              if (!userId) {
                Alert.alert('Error', 'User ID not found. Please try logging in again.');
                return;
              }

              // Show loading alert
              Alert.alert('Deleting Account', 'Please wait while we delete your account...');

              // Call delete account API
              const result = await deleteAccount(userId);
              
              if (result.success) {
                // Clear user data using context
                await clearUserData();
                
                // Navigate to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
                
                Alert.alert('Account Deleted', result.message || 'Your account has been deleted successfully');
              } else {
                Alert.alert('Error', result.message || 'Failed to delete account. Please try again.');
              }
            } catch (error) {
              console.error('Error during account deletion:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuGroups = [
    {
      title: 'Main',
      items: [
        { name: 'Home', icon: 'home-outline', screen: 'Home' },
        { name: 'Cart', icon: 'cart-outline', screen: 'Cart' },
        { name: 'Notifications', icon: 'notifications-outline', screen: 'Notification' },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Track Order', icon: 'car-outline', screen: 'MyOrders' },
        { name: 'Profile', icon: 'person-outline', screen: 'Profile' },
        { name: 'Refer & Earn', icon: 'people-outline', screen: 'ReferEarn' },
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Contact Us', icon: 'call-outline', screen: 'ContactUs' },
        { name: 'About Us', icon: 'information-circle-outline', screen: 'About' },
        { name: 'Rate Us', icon: 'star-outline', screen: 'Rating' },
        { name: 'Share App', icon: 'share-outline', screen: 'ShareApp' },
      ]
    },
    {
      title: 'Legal',
      items: [
        { name: 'FAQ', icon: 'help-circle-outline', screen: 'Faq' },
        { name: 'Terms & Conditions', icon: 'document-text-outline', screen: 'TermsAndCondition' },
        { name: 'Privacy Policy', icon: 'shield-outline', screen: 'PrivacyPolicy' },
      ]
    }
  ];

  // Filter menu groups based on user login status
  const filteredMenuGroups = React.useMemo(() => {
    return menuGroups;
  }, [userData]);

  return (
    <SafeAreaView style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.userIconContainer}>
          <Image
            source={require('../Assets/Images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {isLoading ? (
          <Text style={styles.userTitle}>Loading...</Text>
        ) : userData ? (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userTitle}>
              {userData.name || userData.username || 'Customer'}
            </Text>
            <Text style={styles.userPhone}>
              +60{userData.mobile || userData.phone || ''}
            </Text>
          </View>
        ) : (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userTitle}>Customer</Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Login ?</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>


      {/* Scrollable Menu Items */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.menuContainer}>
          {filteredMenuGroups.map((group, groupIndex) => (
            <View key={groupIndex}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={`${groupIndex}-${itemIndex}`}
                  style={styles.menuItem}
                  onPress={() => {
                    console.log('Navigating to screen:', item.screen);
                    if (item.name === 'Rate Us') {
                      // Open App Store for EC Services app
                      const appStoreUrl = 'https://apps.apple.com/in/app/ec-services/id6751712659';
                      Linking.openURL(appStoreUrl).catch(err => {
                        console.error('Error opening App Store:', err);
                        Alert.alert('Error', 'Unable to open App Store');
                      });
                      navigation.closeDrawer();
                    } else if (item.screen === 'Home') {
                      navigation.replace('MainDrawer');
                    } else {
                      navigation.navigate(item.screen);
                    }
                    navigation.closeDrawer();
                  }}
                >
                  <Icon name={item.icon} size={24} color="#333" />
                  <Text style={styles.menuText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
              {groupIndex < filteredMenuGroups.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions - Logout/Delete Account */}
      {userData && (
        <View style={styles.bottomActions}>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.bottomMenuItem}
            onPress={() => {
              navigation.closeDrawer();
              handleLogout();
            }}
          >
            <Icon name="log-out-outline" size={24} color="#EF3340" />
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.bottomMenuItem}
            onPress={() => {
              navigation.closeDrawer();
              handleDeleteAccount();
            }}
          >
            <Icon name="trash-outline" size={24} color="#FF4444" />
            <Text style={[styles.menuText, styles.deleteText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
};

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: wp('60%'),
        },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEnabled: true,
        swipeEdgeWidth: 50,
        gestureHandlerProps: {
          enableTrackpadTwoFingerGesture: true,
        },
      }}
    >
      <Drawer.Screen
        name="MainApp"
        component={BottomTap}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="ReferEarn"
        component={ReferAndEarn}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#EF3340',
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    alignItems: 'center',
  },
  userIconContainer: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  logoImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('0.5%'),
  },
  userPhone: {
    fontSize: wp('3.5%'),
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
    opacity: 0.9,
  },
  loginButton: {
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('3%'),
  },
  loginText: {
    fontSize: wp('3.5%'),
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
  },
  scrollContainer: {
    flex: 1,
  },
  menuContainer: {
    paddingTop: hp('2%'),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('5%'),
  },
  menuText: {
    fontSize: wp('4%'),
    marginLeft: wp('4%'),
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp('5%'),
    marginVertical: hp('1%'),
  },
  bottomActions: {
    paddingBottom: hp('2%'),
  },
  bottomMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('5%'),
  },
  logoutText: {
    color: '#EF3340',
    fontFamily: 'Montserrat-Medium',
  },
  deleteText: {
    color: '#FF4444',
    fontFamily: 'Montserrat-Medium',
  },
});

export default DrawerNavigation;
