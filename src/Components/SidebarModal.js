import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getUserData, getWalletBalance } from '../Fuctions/UserDataService';

const SidebarModal = ({ 
  visible, 
  onClose, 
  navigation 
}) => {
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadUserData();
      // Animate in
      Animated.timing(drawerAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Load user data
  const loadUserData = async () => {
    try {
      // Get user data from AsyncStorage (same approach as other screens)
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserData(userObj);
        console.log('User data loaded in sidebar:', userObj);

        // Get wallet balance from API using user ID
        const userId = userObj.user_id || userObj.id;
        if (userId) {
          const balanceResult = await getWalletBalance(userId);
          if (balanceResult.success) {
            setWalletBalance(balanceResult.balance);
            console.log('Wallet balance loaded in sidebar:', balanceResult.balance);
          }
        }
      } else {
        setUserData(null);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error loading user data in sidebar:', error);
      setUserData(null);
      setWalletBalance(0);
    }
  };

  const handleClose = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleMenuPress = (screenName) => {
    handleClose();
    navigation.navigate(screenName);
  };

  const handleUserPress = () => {
    handleClose();
    if (userData) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Login');
    }
  };

  const handleLogout = () => {
    handleClose();
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => {
        // Clear user data and navigate to login
        navigation.navigate('Login');
      }}
    ]);
  };

  return (
    <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [{
                  translateX: drawerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-wp('60%'), 0],
                  }),
                }],
              },
            ]}
          >
            {/* Red Header Section */}
            <View style={styles.drawerHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userIconContainer}>
                  <Image 
                                         source={require('../Assets/Images/logo.png')} 
                    style={styles.userLogo}
                    resizeMode="contain"
                  />
                </View>
                
                {userData ? (
                  <>
                    <Text style={styles.userName}>
                      {userData?.name || userData?.username}
                    </Text>
                    <Text style={styles.userPhone}>
                      {userData?.mobile ? `+60-${userData.mobile}` : ''}
                    </Text>
                    
                    <View style={styles.walletSection}>
                      <View style={styles.walletInfo}>
                        <Icon name="wallet" size={wp('5%')} color="#fff" />
                        <Text style={styles.walletText}>Wallet Balance</Text>
                        <Text style={styles.walletAmount}>₹ {walletBalance.toFixed(2)}</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => {
                      onClose();
                      navigation.navigate('Login');
                    }}
                  >
                    <Text style={styles.loginButtonText}>Login</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Icon name="close" size={wp('6%')} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* White Menu Section */}
            <View style={styles.drawerContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.drawerScrollContent}
              >
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Home');
                  }}
                >
                  <Icon name="home-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Cart');
                  }}
                >
                  <Icon name="cart-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Cart</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    // Add notification navigation
                  }}
                >
                  <Icon name="notifications-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Notifications</Text>
                </TouchableOpacity>
                
                <View style={styles.separator} />
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('MyOrders');
                  }}
                >
                  <Icon name="car-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Track Order</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Profile');
                  }}
                >
                  <Icon name="person-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    // Add refer & earn navigation
                  }}
                >
                  <Icon name="people-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Refer & Earn</Text>
                </TouchableOpacity>
                
                <View style={styles.separator} />
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Support');
                  }}
                >
                  <Icon name="call-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Contact Us</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('About');
                  }}
                >
                  <Icon name="information-circle-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>About Us</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Rating');
                  }}
                >
                  <Icon name="star-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Rate Us</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    // Add share app functionality
                  }}
                >
                  <Icon name="share-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Share App</Text>
                </TouchableOpacity>
                
                <View style={styles.separator} />
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Faq');
                  }}
                >
                  <Icon name="help-circle-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>FAQ</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('TermsAndCondition');
                  }}
                >
                  <Icon name="document-text-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Terms & Conditions</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    onClose();
                    navigation.navigate('PrivacyPolicy');
                  }}
                >
                  <Icon name="shield-checkmark-outline" size={wp('5%')} color="#333" />
                  <Text style={styles.drawerItemText}>Privacy Policy</Text>
                </TouchableOpacity>
                
                <View style={styles.separator} />
                
                {userData ? (
                  <TouchableOpacity
                    style={styles.drawerItem}
                    onPress={handleLogout}
                  >
                    <Icon name="log-out-outline" size={wp('5%')} color="#333" />
                    <Text style={styles.drawerItemText}>Log Out</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.drawerItem}
                    onPress={() => {
                      onClose();
                      navigation.navigate('Login');
                    }}
                  >
                    <Icon name="log-in-outline" size={wp('5%')} color="#333" />
                    <Text style={styles.drawerItemText}>Login</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  drawerContainer: {
    width: wp('70%'),
    height: '70%',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderTopRightRadius: wp('6%'),
    borderBottomRightRadius: wp('6%'),
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    //paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: wp('2%'),
  },
  drawerContent: {
    flex: 1,
  },
  userSection: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('4%'),
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('0.5%'),
  },
  userEmail: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('0.5%'),
  },
  walletText: {
    fontSize: wp('3%'),
    color: '#F70D24',
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
  },
  menuSection: {
    paddingVertical: hp('2%'),
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2.5%'),
    marginHorizontal: wp('3%'),
    marginVertical: hp('0.5%'),
    borderRadius: wp('3%'),
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  drawerItemText: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Montserrat-Medium',
    marginLeft: wp('4%'),
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: wp('6%'),
    marginVertical: hp('1%'),
  },// Modal Drawer Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawerContainer: {
    width: wp('75%'),
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: hp('6%'),
    position: 'absolute',
    left: 0,
    top: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderTopRightRadius: wp('6%'),
    borderBottomRightRadius: wp('6%'),
  },
  drawerHeader: {
    backgroundColor: '#EF3340',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    paddingTop: hp('3%'),
    position: 'relative',
    borderTopRightRadius: wp('6%'),
    borderBottomLeftRadius: wp('4%'),
    borderBottomRightRadius: wp('4%'),
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  userIconContainer: {
    marginBottom: hp('0.5%'),
  },
  userLogo: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('6%'),
  },
  customerText: {
    fontSize: wp('4%'),
    color: '#fff',
    fontFamily: 'Montserrat-Medium',
    marginBottom: hp('0.5%'),
  },
  userName: {
    fontSize: wp('5%'),
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('0.5%'),
  },
  userPhone: {
    fontSize: wp('4%'),
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
    marginBottom: hp('2%'),
  },
  walletSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: hp('2%'),
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletText: {
    fontSize: wp('4%'),
    color: '#fff',
    fontFamily: 'Montserrat-Medium',
    flex: 1,
    marginLeft: wp('3%'),
  },
  walletAmount: {
    fontSize: wp('4%'),
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
  closeButton: {
    position: 'absolute',
    top: hp('2%'),
    right: wp('5%'),
    padding: wp('2%'),
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerScrollContent: {
    flexGrow: 1,
    paddingBottom: hp('2%'),
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2.5%'),
    marginHorizontal: wp('3%'),
    marginVertical: hp('0.5%'),
    borderRadius: wp('3%'),
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  drawerItemText: {
    fontSize: wp('4.2%'),
    color: '#333',
    marginLeft: wp('4%'),
    fontFamily: 'Montserrat-Medium',
    flex: 1,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: wp('6%'),
    marginVertical: hp('1%'),
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    marginTop: hp('2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loginButtonText: {
    color: '#EF3340',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
};

export default SidebarModal;
