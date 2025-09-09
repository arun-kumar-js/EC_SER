import { API_ACCESS_KEY, SUB_CATEGORIES_ENDPOINT } from '../config/config';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CartIcon from '../Components/CartIcon';
import {
  increaseProductQuantity,
  decreaseProductQuantity,
} from '../Fuctions/CartService';
import { toggleWishlistItem, checkWishlistStatus } from '../Fuctions/WishlistService';
import { useCart } from '../Context/CartContext';

const SubCategory = ({ route, navigation }) => {
  const { category_id, subcategory_id, category_name } = route.params;
  const { getProductQuantity } = useCart();
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [wishlistStatus, setWishlistStatus] = useState({});

  console.log('SubCategory Params:', {
    category_id,
    subcategory_id,
    category_name,
  });


  // Fetch wishlist status for all products
  const fetchWishlistStatus = async () => {
    try {
      const status = {};
      for (const product of products) {
        const productId = product.id ?? product.product_id;
        if (productId) {
          const inWishlist = await checkWishlistStatus(productId);
          status[productId] = inWishlist;
        }
      }
      setWishlistStatus(status);
    } catch (error) {
      console.error('Error fetching wishlist status:', error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const formData = new FormData();
        formData.append('subcategory_id', subcategory_id);
        formData.append('accesskey', API_ACCESS_KEY);
        formData.append('limit', '10');
        formData.append('category_id', category_id);
        const response = await axios.post(SUB_CATEGORIES_ENDPOINT, formData);
        setProducts(response.data.data);
        console.log('SubCategory Products:', response.data.data);
        const firstProductPrice = products[0]?.variants?.[0]?.product_price;
        console.log('First product price:', firstProductPrice);

        console.log('Products fetched:', response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [category_id, subcategory_id]);

  // Fetch wishlist status when products change
  useEffect(() => {
    if (products.length > 0) {
      fetchWishlistStatus();
    }
  }, [products]);

  const toggleFavorite = async (product) => {
    try {
      const productId = product.id ?? product.product_id;
      const result = await toggleWishlistItem(product);
      
      if (result.success) {
        setWishlistStatus(prev => ({
          ...prev,
          [productId]: result.action === 'added',
        }));
        console.log(result.message);
      } else {
        console.error('Failed to toggle wishlist:', result.message);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const increaseQuantity = async item => {
    try {
      await increaseProductQuantity(item);
      // The context will automatically update and trigger re-renders
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  const decreaseQuantity = async item => {
    try {
      await decreaseProductQuantity(item);
      // The context will automatically update and trigger re-renders
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  };

  // Assume single column for now; if you add numColumns, adjust width accordingly.
  const numColumns = 1;
  const renderProduct = ({ item }) => {
    const originalPrice = Number(item.price);
    const salePrice = Number(item.variants?.[0]?.product_price ?? item.price);
    const hasDiscount = originalPrice !== salePrice;
    const discountPercent = hasDiscount
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={[styles.card, { width: numColumns === 1 ? '100%' : '48%' }]}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        {hasDiscount && (
          <View
            style={{
              position: 'absolute',
              top: hp('1.8%'),
              left: wp('4%'),
              backgroundColor: 'green',
              paddingHorizontal: wp('2%'),
              paddingVertical: hp('0.3%'),
              borderRadius: wp('1%'),
              zIndex: 10,
            }}
          >
            <Text
              style={{ color: '#fff', fontWeight: 'bold', fontSize: wp('3%'), fontFamily: 'Montserrat-Bold' }}
            >
              {item.pre_order_sts === 'yes'
                ? 'Pre Order'
                : `${discountPercent}% OFF`}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.heartIcon, { borderRadius: wp('3%') }]}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons
            name={wishlistStatus[item.id] ? 'heart' : 'heart-outline'}
            size={24}
            color={wishlistStatus[item.id] ? '#F70D24' : '#999'}
          />
        </TouchableOpacity>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.rating || '0'}</Text>
              <Text style={styles.star}>★</Text>
            </View>
            <Text
              style={[
                styles.ratingText,
                { color: '#000', marginLeft: wp('2%') },
              ]}
            >
              {item.rating_count || 'N/A'} Ratings
            </Text>
          </View>
          <View style={styles.quantityBox}>
            <Text style={styles.quantity}>
              Qty: {item?.variants?.[0]?.measurement_unit_name || 'N/A'}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View
              style={{
                paddingVertical: hp('0.5%'),
                paddingHorizontal: wp('1%'),
              }}
            >
              {hasDiscount && (
                <Text
                  style={{
                    textDecorationLine: 'line-through',
                    color: '#000',
                    fontSize: wp('2.5%'),
                    paddingVertical: hp('0.5%'),
                  }}
                >
                  RM {item.price}
                </Text>
              )}
              <Text style={styles.price}>
                RM {item.variants?.[0]?.product_price ?? item.price}
              </Text>
            </View>
            {getProductQuantity(item.id) > 0 ? (
              <View style={styles.cartContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => decreaseQuantity(item)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <View style={styles.countBox}>
                  <Text style={styles.countText}>
                    {getProductQuantity(item.id)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => increaseQuantity(item)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => increaseQuantity(item)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{ color: '#fff', fontSize: wp('4.5%'), fontWeight: 'bold', fontFamily: 'Montserrat-Bold' }}
        >
          {category_name}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            width: wp('20%'),
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity onPress={() => alert('Search pressed')}>
            <Ionicons name="search" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <CartIcon size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      ) : (
        <Text style={styles.emptyText}>No products found</Text>
      )}
    </SafeAreaView>
  );
};

export default SubCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //padding: wp('3%'),
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#e60023',
    width: '100%',
    fontSize: wp('5%'),
  },
  // row style not needed for single column FlatList
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('1%'),
    marginHorizontal: wp('4%'),
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    position: 'relative',
  },
  heartIcon: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('3%'),
    zIndex: 10,
    padding: wp('1%'),
  },
  productImage: {
    width: wp('34%'),
    height: hp('23%'),
    borderRadius: wp('2%'),
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    marginLeft: wp('3%'),
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: '700',
    fontSize: wp('4.5%'),
    marginBottom: hp('0.8%'),
    textAlign: 'left',
    paddingTop: hp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  price: {
    fontWeight: 'bold',
    fontSize: wp('4%'),
    color: '#039809',
    marginBottom: hp('1%'),
    textAlign: 'left',
    fontFamily: 'Montserrat-Bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: '#f16774ff',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('1%'),
    alignItems: 'center',
  },
  ratingText: {
    fontSize: wp('3%'),
    color: '#fff',
    marginRight: wp('0.5%'),
    fontFamily: 'Montserrat-Regular',
  },
  star: {
    fontSize: wp('3%'),
    color: '#fff', // white star color for contrast on red background
  },
  quantityBox: {
    borderWidth: 1,
    borderColor: '#f5f5f5',
    borderRadius: wp('2%'),
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: wp('2%'),
    backgroundColor: '#f5f5f5',
  },
  quantity: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
    textAlign: 'left',
    fontFamily: 'Montserrat-Regular',
  },
  cutPrice: {
    fontSize: wp('3.5%'),
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: hp('0.5%'),
    fontFamily: 'Montserrat-Regular',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    width: wp('28%'),
    height: hp('4.5%'),
    opacity: 1,
    paddingTop: hp('1%'),
    paddingRight: wp('6%'),
    paddingBottom: hp('1%'),
    paddingLeft: wp('6%'),
    marginRight: wp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F70D24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: wp('4%'),
    fontFamily: 'Montserrat-SemiBold',
    borderRadius: wp('2%'),
  },
  description: {
    fontSize: wp('3.5%'),
    color: '#444',
    marginBottom: hp('1%'),
    textAlign: 'left',
    fontFamily: 'Montserrat-Regular',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  detailText: {
    fontSize: wp('3%'),
    color: '#666',
    flex: 1,
    textAlign: 'left',
    fontFamily: 'Montserrat-Regular',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F70D24',
    borderRadius: wp('2%'),
    width: wp('28%'),
    height: hp('4.5%'),
    paddingHorizontal: wp('1%'),
    marginRight: wp('2%'),
  },
  quantityButton: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    minWidth: wp('5%'),
    minHeight: hp('3.2%'),
    justifyContent: 'center',
    alignItems: 'center',
    MarginVertical: hp('1.5%'),
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('3%'),
    fontFamily: 'Montserrat-Bold',
  },
  countBox: {
    backgroundColor: '#fff',
      borderRadius: wp('%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.7%'),
    marginLeft: wp('1%'),
    marginRight: wp('2%'),
    //marginVertical: hp('0.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#F70D24',
    fontWeight: 'bold',
    fontSize: wp('3%'),
    textAlign: 'center',
   paddingBottom: hp('1.5%'),
   // MarginVertical: hp('2.5%'),
  },
});
