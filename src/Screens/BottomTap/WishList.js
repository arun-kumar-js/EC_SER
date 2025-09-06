import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { fetchWishlistItems, removeFromWishlistItem } from '../../Fuctions/WishlistService';
import TabHeader from '../../Components/TabHeader';
import SidebarModal from '../../Components/SidebarModal';

const WishList = () => {
  const navigation = useNavigation();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Load wishlist items when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWishlistItems();
    }, [])
  );

  // Drawer functions
  const openDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const loadWishlistItems = async () => {
    try {
      setLoading(true);
      const items = await fetchWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      Alert.alert('Error', 'Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWishlistItems();
    setRefreshing(false);
  };

  const handleRemoveFromWishlist = async (productId, productName) => {
    Alert.alert(
      'Remove from Wishlist',
      `Are you sure you want to remove "${productName}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await removeFromWishlistItem(productId);
              if (result.success) {
                // Remove from local state
                setWishlistItems(prev => 
                  prev.filter(item => item.productId !== productId)
                );
                Alert.alert('Success', 'Removed from wishlist');
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error removing from wishlist:', error);
              Alert.alert('Error', 'Failed to remove from wishlist');
            }
          },
        },
      ]
    );
  };

  const handleProductPress = (item) => {
    // Navigate to product details
    navigation.navigate('ProductDetails', { 
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        variants: [{ price: item.price, discounted_price: item.price }],
        rating: 0,
        ratingCount: 0,
      }
    });
  };

  const handleMenuPress = () => {
    // Navigate to home screen to access the drawer
    navigation.navigate('Home');
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const renderWishlistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleProductPress(item)}
    >
      <Image
        source={{
          uri: item.image || 'https://placehold.co/150x150/000000/FFFFFF',
        }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>RM {item.price}</Text>
        <Text style={styles.addedDate}>
          Added: {new Date(item.addedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromWishlist(item.productId, item.name)}
      >
        <Icon name="heart" size={wp('6%')} color="#F70D24" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart-outline" size={wp('20%')} color="#ccc" />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Save products you love to your wishlist and they'll appear here
      </Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopNowButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <TabHeader 
        title="Wishlist"
        onMenuPress={openDrawer}
        onCartPress={() => navigation.navigate('Cart')}
        showLocation={false}
      />
      {wishlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.productId.toString()}
          renderItem={renderWishlistItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#F70D24']}
              tintColor="#F70D24"
            />
          }
        />
      )}

      {/* Sidebar Modal */}
      <SidebarModal
        visible={drawerVisible}
        onClose={closeDrawer}
        navigation={navigation}
      />
    </View>
  );
};

export default WishList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: wp('4%'),
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    padding: wp('3%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('2%'),
  },
  itemDetails: {
    flex: 1,
    marginLeft: wp('3%'),
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('1%'),
  },
  productPrice: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#F70D24',
    fontFamily: 'Montserrat-Bold',
    marginBottom: hp('0.5%'),
  },
  addedDate: {
    fontSize: wp('3%'),
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  removeButton: {
    padding: wp('2%'),
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
  },
  emptyTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
    marginTop: hp('3%'),
    marginBottom: hp('1%'),
    fontFamily: 'Montserrat-Bold',
  },
  emptySubtitle: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    lineHeight: hp('2.5%'),
    marginBottom: hp('4%'),
    fontFamily: 'Montserrat-Regular',
  },
  shopNowButton: {
    backgroundColor: '#F70D24',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
  },
  shopNowButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});