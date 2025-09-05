import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HOMEPAGE_ENDPOINT, API_ACCESS_KEY } from '../../config/config';
import {
  updateCartItem,
  getProductQuantity,
  fetchCartItems,
  increaseProductQuantity,
  decreaseProductQuantity,
} from '../../Fuctions/CartService';
import { getUserData, getWalletBalance } from '../../Fuctions/UserDataService';
import CartIcon from '../../Components/CartIcon';
import SidebarModal from '../../Components/SidebarModal';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cartItems, setCartItems] = useState({}); // Track cart items and their quantities
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const promotion = data?.section;
  
  // Banner auto-slide state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);

  // Load cart data and user data when component mounts
  useEffect(() => {
    loadCartData();
    loadUserData();
  }, []);

  // Auto-slide banner functionality
  useEffect(() => {
    if (data?.slider?.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.slider.length;
          if (bannerScrollRef.current) {
            bannerScrollRef.current.scrollTo({
              x: nextIndex * screenWidth,
              animated: true,
            });
          }
          return nextIndex;
        });
      }, 3000); // Auto-slide every 3 seconds

      return () => clearInterval(interval);
    }
  }, [data?.slider]);

  // Handle navigation params for selected address
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = navigation.getState()?.routes?.find(route => route.name === 'MainApp')?.params;
      if (params?.selectedAddress) {
        setSelectedAddress(params.selectedAddress);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Load user data from AsyncStorage and API
  const loadUserData = async () => {
    try {
      // Get user data from AsyncStorage
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUserData(userObj);
        console.log('User data loaded:', userObj);

        // Get wallet balance from API
        const userId = userObj.user_id || userObj.id;
        if (userId) {
          const balanceResult = await getWalletBalance(userId);
          if (balanceResult.success) {
            setWalletBalance(balanceResult.balance);
            console.log('Wallet balance loaded:', balanceResult.balance);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Drawer animation functions
  const openDrawer = () => {
    setDrawerVisible(true);
    // Refresh user data when opening drawer
    loadUserData();
    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  // Logout function
  const handleLogout = async () => {
    try {
      // Clear all user data from AsyncStorage
      await AsyncStorage.multiRemove(['userData', 'userToken']);
      console.log('User logged out successfully');
      
      // Reset user data state
      setUserData(null);
      setWalletBalance(0);
      
      // Close drawer
      closeDrawer();
      
      // Navigate to login screen
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const loadCartData = async () => {
    try {
      const cartItems = await fetchCartItems();
      const cartState = {};
      cartItems.forEach(item => {
        const itemId = item.id || item.product_id;
        cartState[itemId] = item.quantity || 0;
      });
      setCartItems(cartState);
    } catch (error) {
      console.error('Error loading cart data:', error);
    }
  };

  // Cart functions
  const addToCart = async item => {
    try {
      const newQuantity = await increaseProductQuantity(item);
      // Update local state to reflect the change
      setCartItems(prev => ({
        ...prev,
        [item.id || item.product_id]: newQuantity,
      }));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async item => {
    try {
      const newQuantity = await decreaseProductQuantity(item);
      // Update local state to reflect the change
      setCartItems(prev => ({
        ...prev,
        [item.id || item.product_id]: newQuantity,
      }));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getItemQuantity = async item => {
    try {
      const quantity = await getProductQuantity(item.id || item.product_id);
      return quantity;
    } catch (error) {
      console.error('Error getting item quantity:', error);
      return 0;
    }
  };

  // Cart Button Component
  const CartButton = ({ item }) => {
    const quantity = cartItems[item.id || item.product_id] || 0;

    if (quantity === 0) {
      return (
        <TouchableOpacity
          style={{
            backgroundColor: '#EF3340',
            paddingVertical: hp('1.2%'),
            paddingHorizontal: wp('4%'),
            borderRadius: wp('2%'),
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: hp('1%'),
            marginBottom: hp('1%'),
            marginHorizontal: wp('2%'),
            width: wp('12%'),
            height: hp('6%'),
            alignSelf: 'center',
          }}
          onPress={() => addToCart(item)}
          activeOpacity={1}
        >
          <Text
            style={{ 
              color: '#fff', 
              fontWeight: 'bold', 
              fontSize: wp('4%'),
              fontFamily: 'Montserrat-Bold'
            }}
          >
            Add 
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: hp('1%'),
          marginBottom: hp('1%'),
          gap: wp('2%'),
          height: hp('6%'),
          width: wp('85%'),
          alignSelf: 'center',
          marginHorizontal: wp('2%'),
          backgroundColor: '#EF3340',
          borderRadius: wp('2%'),
          paddingHorizontal: wp('1%'),
        }}
      >
        <TouchableOpacity
          onPress={() => removeFromCart(item)}
          style={{
            width: wp('12%'),
            height: hp('6%'),
            backgroundColor: '#EF3340',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: wp('2%'),
          }}
          activeOpacity={1}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: wp('6%'), fontFamily: 'Montserrat-Bold' }}>-</Text>
        </TouchableOpacity>

          <View
            style={{
              backgroundColor: '#fff',
            borderRadius: wp('1%'),
            paddingHorizontal: wp('4%'),
            paddingVertical: hp('1.5%'),
            marginHorizontal: wp('2%'),
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: wp('12%'),
            minHeight: hp('6%'),
          }}
        >
        <Text
          style={{
              color: '#EF3340',
            fontWeight: 'bold',
              fontSize: wp('5%'),
            textAlign: 'center',
            fontFamily: 'Montserrat-Bold',
          }}
        >
          {quantity}
        </Text>
        </View>

        <TouchableOpacity
          onPress={() => addToCart(item)}
          style={{
            width: wp('12%'),
            height: hp('6%'),
            backgroundColor: '#EF3340',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: wp('2%'),
          }}
          activeOpacity={1}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: wp('6%'), fontFamily: 'Montserrat-Bold' }}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Promotion Cart Button Component (Larger size)
  const PromotionCartButton = ({ item }) => {
    const quantity = cartItems[item.id || item.product_id] || 0;

    if (quantity === 0) {
      return (
        <TouchableOpacity
          style={{
            backgroundColor: '#EF3340',
            paddingVertical: hp('1.5%'),
            paddingHorizontal: wp('4%'),
            borderRadius: wp('2%'),
            alignItems: 'center',
            marginTop: hp('1%'),
            marginBottom: hp('1%'),
            marginHorizontal: wp('2%'),
            height: hp('5.5%'),
            width: wp('35%'),
            alignSelf: 'center',
           
          }}
          onPress={() => addToCart(item)}
          activeOpacity={1}
        >
          <Text
            style={{ 
              color: '#fff', 
              fontWeight: 'bold', 
              fontSize: wp('4%'),
              fontFamily: 'Montserrat-Bold'
            }}
          >
            Add
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: hp('1%'),
          marginBottom: hp('1%'),
          gap: wp('4%'),
          height: hp('5.5%'),
          width: wp('80%'),
          alignSelf: 'center',
          marginHorizontal: wp('2%'),
        }}
      >
        <TouchableOpacity
          onPress={() => removeFromCart(item)}
          style={{
            width: wp('10%'),
            height: wp('10%'),
            backgroundColor: '#EF3340',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: wp('1%'),
          }}
          activeOpacity={1}
        >
          <View
            style={{
              width: wp('5%'),
              height: wp('0.5%'),
              backgroundColor: '#fff',
            }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: '#333',
            fontWeight: 'bold',
            fontSize: wp('3.5%'),
            minWidth: wp('8%'),
            textAlign: 'center',
            fontFamily: 'Montserrat-Bold',
          }}
        >
          {quantity}
        </Text>

        <TouchableOpacity
          onPress={() => addToCart(item)}
          style={{
            width: wp('10%'),
            height: wp('10%'),
            backgroundColor: '#EF3340',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: wp('1%'),
          }}
          activeOpacity={1}
        >
          <View
            style={{
              width: wp('5%'),
              height: wp('0.5%'),
              backgroundColor: '#fff',
            }}
          />
          <View
            style={{
              width: wp('0.5%'),
              height: wp('5%'),
              backgroundColor: '#fff',
              position: 'absolute',
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const fetchHomePageData = async () => {
    try {
      const formData = new FormData();
      formData.append('accesskey', API_ACCESS_KEY);
      const response = await axios.post(HOMEPAGE_ENDPOINT, formData);
      if (response.data && response.data.error === 'false') {
        return response.data.data;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const res = await fetchHomePageData();
    if (res) {
      setData(res);
      setCategories(res.category || []);
      const prod =
        res.section?.[0]?.products?.map(p => ({
          name: p.name,
          size: p.variants?.[0]?.measurement_unit_name || '',
          price: `₹${p.variants?.[0]?.product_price || ''}`,
          image: { uri: p.image },
        })) || [];
      setProducts(prod);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const res = await fetchHomePageData();
      if (res) {
        setData(res);
        setCategories(res.category || []);
        const prod =
          res.section?.[0]?.products?.map(p => ({
            name: p.name,
            size: p.variants?.[0]?.measurement_unit_name || '',
            price: `₹${p.variants?.[0]?.product_price || ''}`,
            image: { uri: p.image },
          })) || [];
        setProducts(prod);
      }
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa', }} edges={['top', 'left', 'right']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', gap: wp('3.5%') }}>
          <TouchableOpacity
            onPress={openDrawer}
            activeOpacity={1}
            style={{ padding: wp('2%') }}
          >
            <Icon name="menu" size={wp('6%')} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp('2.5%'),
          }}
          onPress={() => navigation.navigate('AddressPage')}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../Assets/Images/Edit.png')}
            style={{ width: wp('4%'), height: hp('2%'), tintColor: '#fff' }}
          />
          <Text style={styles.locationText}>
            {selectedAddress ? selectedAddress.address : 'Choose Location'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={1}
        >
          <CartIcon size={wp('6%')} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Fixed Search Bar */}
      <TouchableOpacity 
        style={styles.searchWrapper}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.8}
      >
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={wp('5%')}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products.."
            placeholderTextColor="#888"
            editable={false}
            pointerEvents="none"
          />
        </View>
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
      >

        {/* Banner with Auto-slide */}
        {data?.slider?.length > 0 && (
          <View style={styles.bannerContainer}>
          <ScrollView
              ref={bannerScrollRef}
            horizontal
              pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setCurrentBannerIndex(index);
              }}
              style={styles.bannerScrollView}
          >
            {data.slider.map((item, index) => (
                <TouchableOpacity
                key={index}
                  style={styles.bannerItem}
                  activeOpacity={0.9}
                >
                  <Image
                source={{ uri: item.image }}
                style={styles.banner}
                resizeMode="cover"
              />
                  <View style={styles.bannerOverlay} />
                </TouchableOpacity>
            ))}
          </ScrollView>
            
            {/* Banner Indicators */}
            {data.slider.length > 1 && (
              <View style={styles.bannerIndicators}>
                {data.slider.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentBannerIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Promotion Section */}
        {data?.section.map(promo => (
            <View
              key={promo.id}
              style={{
                marginHorizontal: wp('4%'),
                marginVertical: hp('1%'),
                padding: wp('3%'),
                backgroundColor: '#fff',
                borderRadius: wp('2%'),
                borderWidth: 1,
                borderColor: '#C0C0C0',
              }}
            >
              <Text
                style={{
                  fontSize: wp('4%'),
                  fontWeight: '600',
                  marginBottom: hp('0.5%'),
                  fontFamily: 'Montserrat-SemiBold',
                }}
              >
                {promo.title}
              </Text>
              {promo.products?.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: wp('2%') }}
                >
                  {promo.products.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() =>
                        navigation.navigate('ProductDetails', { product: item })
                      }
                      activeOpacity={1}
                    >
                      <View
                        style={{
                          width: wp('40%'),
                          marginRight: wp('3%'),
                          backgroundColor: '#edececff',
                          borderRadius: wp('2%'),
                          overflow: 'hidden',
                          elevation: 2,
                        }}
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={{
                            width: '100%',
                            height: hp('20%'),
                            resizeMode: 'cover',
                          }}
                        />
                        <Text
                          style={{ padding: wp('2%'), fontWeight: '500', fontFamily: 'Montserrat-Medium' }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: wp('2%'),
                            marginBottom: hp('0.5%'),
                          }}
                        >
                          <Text
                            style={{
                              color: '#888',
                              fontSize: wp('3%'),
                              flex: 1,
                              fontFamily: 'Montserrat-Regular',
                            }}
                          >
                            1 Pc
                          </Text>
                          <Text
                            style={{
                              color: 'green',
                              fontWeight: 'bold',
                              fontSize: wp('3.5%'),
                              textAlign: 'right',
                              fontFamily: 'Montserrat-Bold',
                            }}
                          >
                            RM{item?.variants?.[0]?.product_price || ''}
                          </Text>
                        </View>
                        <PromotionCartButton item={item} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ))}

        {/* Category Section */}
        <View>
          <Text style={styles.sectionTitle}>Category</Text>
          {categories?.length > 0 && (
            <FlatList
              data={categories}
              numColumns={2}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={null}
              disableVirtualization={true}
              contentContainerStyle={{
                paddingHorizontal: wp('4%'),
                paddingBottom: hp('2%'),
              }}
              columnWrapperStyle={{
                justifyContent: 'space-between',
                marginBottom: hp('2%'),
                gap: wp('2%'),
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cardContainer}
                  onPress={() =>
                    navigation.navigate('SubCategory', {
                      category_id: item.id,
                      subcategory_id:
                        data?.section?.[0]?.products?.[0]?.subcategory_id,
                      category_name: item.name,
                    })
                  }
                  activeOpacity={1}
                >
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImage}
                    />
                  ) : (
                    <View style={styles.placeholderCircle} />
                  )}
                  <Text style={styles.cardText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* New Arrival Products Section */}
        <View>
          <Text style={styles.sectionTitle}>New arrival products</Text>
          {products?.length > 0 && (
            <FlatList
              data={products}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(item, index) => index.toString()}
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={null}
              disableVirtualization={true}
              contentContainerStyle={{
                paddingHorizontal: wp('4%'),
                paddingBottom: hp('2%'),
              }}
              columnWrapperStyle={{
                justifyContent: 'space-between',
                marginBottom: hp('2%'),
                gap: wp('2%'),
              }}
              renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                  <Image source={item.image} style={styles.cardImage} />
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productSize}>{item.size}</Text>
                  <Text style={styles.productPrice}>
                    {item.price.replace('RM', 'RM')}
                  </Text>
                  <CartButton item={item} />
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

             {/* Sidebar Modal */}
       <SidebarModal
        visible={drawerVisible}
         onClose={closeDrawer}
         navigation={navigation}
       />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
   backgroundColor: '#f8f9fa',
  },
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
  locationText: {
    color: '#fff',
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    fontSize: wp('3.5%'),
    lineHeight: wp('5.1%'),
    letterSpacing: 0,
    textAlign: 'center',
  },
  searchWrapper: {
    backgroundColor: '#F70D24',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('1%'),
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2.2%'),
   // paddingVertical: hp('1.2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  searchInput: {
    flex: 1,
    height: hp('5%'),
    fontSize: wp('3.8%'),
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  searchIcon: {
    marginRight: wp('3%'),
    marginLeft: wp('1%'),
  },
  banner: {
    width: '100%',
    height: '100%',
    borderRadius: wp('4%'),
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bannerContainer: {
    position: 'relative',
    marginVertical: hp('2%'),
    marginHorizontal: wp('3%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bannerScrollView: {
    height: hp('22%'),
  },
  bannerItem: {
    width: screenWidth,   // full screen width
    height: hp('22%'),
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('1.5%'),
    gap: wp('1.5%'),
    paddingHorizontal: wp('4%'),
  },
  indicator: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  activeIndicator: {
    backgroundColor: '#e60023',
    width: wp('6%'),
    borderColor: '#e60023',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: wp('4%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  cardContainer: {
    width: wp('46%'),
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    alignItems: 'center',
    paddingBottom: hp('2%'),
    marginBottom: hp('1%'),
    alignSelf: 'flex-start',
  },
  cardImage: {
    width: '100%',
    height: hp('24%'),
    resizeMode: 'cover',
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
  },
  placeholderCircle: {
    width: wp('15%'),
    height: wp('15%'),
    backgroundColor: '#ccc',
    borderRadius: wp('7.5%'),
  },
  cardText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
    fontFamily: 'Montserrat-SemiBold',
  },
  productName: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
    fontFamily: 'Montserrat-SemiBold',
  },
  productSize: {
    fontSize: wp('3%'),
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
    fontFamily: 'Montserrat-Regular',
  },
  productPrice: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
    marginTop: hp('0.5%'),
    fontFamily: 'Montserrat-Bold',
  },
  addButton: {
    backgroundColor: '#e60023',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    marginTop: hp('1%'),
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('3%'),
    width: '100%',
    height: '10%',
    fontFamily: 'Montserrat-Bold',
  },
  // Modal Drawer Styles
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
    paddingVertical: hp('4%'),
    paddingTop: hp('6%'),
    position: 'relative',
    borderTopRightRadius: wp('6%'),
    borderBottomLeftRadius: wp('4%'),
    borderBottomRightRadius: wp('4%'),
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  userIconContainer: {
    marginBottom: hp('1%'),
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
});

export default HomeScreen;
