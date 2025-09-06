import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CartButton from '../Fuctions/CartButton';
import { toggleWishlistItem, checkWishlistStatus } from '../Fuctions/WishlistService';
import CartIcon from '../Components/CartIcon';
const renderHtmlToText = html => {
  // Simple parser to remove HTML tags and render as plain text with line breaks
  const regex = /<\/?[^>]+(>|$)/g;
  const text = html.replace(regex, '');
  // Split by line breaks or paragraphs if needed
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines.map((line, index) => (
    <Text key={index} style={styles.productDescription}>
      {line}
    </Text>
  ));
};

const ProductDescription = ({ html }) => {
  if (!html) return null;
  return <View>{renderHtmlToText(html)}</View>;
};

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  console.log(product);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const originalPrice = product.variants[0].price;
  const discountedPrice = product.variants[0].discounted_price;
  let discountPercentage = 0;
  if (originalPrice && discountedPrice && originalPrice > discountedPrice) {
    discountPercentage = Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
  }

  // Check if product is in wishlist when component mounts
  useEffect(() => {
    checkInitialWishlistStatus();
  }, []);

  const checkInitialWishlistStatus = async () => {
    try {
      const inWishlist = await checkWishlistStatus(product.id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await toggleWishlistItem(product);
      if (result.success) {
        setIsInWishlist(result.action === 'added');
        // Show toast or alert
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const productUrl = `https://spiderekart.in/product/${product.id}`;
      const shareMessage = `Check out this amazing product: ${product.name}\n\nPrice: ₹${discountedPrice || originalPrice}\n\n${productUrl}`;
      
      const result = await Share.share({
        message: shareMessage,
        title: product.name,
        url: productUrl,
      });

      if (result.action === Share.sharedAction) {
        console.log('Product shared successfully');
      }
    } catch (error) {
      console.error('Error sharing product:', error);
      Alert.alert('Error', 'Failed to share product. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#F70D24" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp('6%')} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <CartIcon size={wp('7%')} color="white" />
          </TouchableOpacity>
        </View>

        <View contentContainerStyle={styles.scrollContentContainer}>
          <Image
            source={{
              uri:
                product.image || 'https://placehold.co/600x400/000000/FFFFFF',
            }}
            style={styles.productImage}
          />

          <View style={styles.detailsContainer}>
            <View style={styles.titleRow}>
              <View style={styles.titleAndRating}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>
                      {product.rating ? Number(product.rating).toFixed(2) : '0.00'}
                    </Text>
                    <Text style={styles.star}> ★ </Text>
                  </View>
                  <Text style={styles.ratingCountText}>
                    {product.ratingCount || 0} ratings
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.shareIconContainer}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="share-social-outline"
                  size={wp('6%')}
                  color="#F70D24"
                />
              </TouchableOpacity>
            </View>
            {/* <Text>Category ID: {product.category_id}</Text> */}
            {/* <Text>Price Type: {product.price_type}</Text> */}
          </View>
          {/* Price display with original price struck through and centered if discounted */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.discountedPrice}>RM {discountedPrice}</Text>
              {originalPrice > discountedPrice && (
                <Text style={styles.originalPrice}>RM {originalPrice}</Text>
              )}
              {discountPercentage > 0 && (
                <View style={styles.offerBadge}>
                  <Text
                    style={styles.offerBadgeText}
                  >{`${discountPercentage}% OFF`}</Text>
                </View>
              )}
              {product.pre_order_sts === 'yes' && (
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>Pre Order</Text>
                </View>
              )}
            </View>
          </View>
          {/* Quantity box and Add button row */}
          <View style={styles.cartRow}>
            <View style={[styles.quantityBox]}>
              <Text style={styles.quantity}>
                Qty: {product?.variants?.[0]?.measurement_unit_name || 'N/A'}
              </Text>
            </View>
            <View style={[styles.cartButtonContainer]}>
              <CartButton
                product={product}
                initialQuantity={0}
                onChange={qty => {
                  console.log('Quantity changed:', qty);
                }}
              />
            </View>
          </View>

          <View style={styles.productDetailsSection}>
            {product.description ? (
              <>
                <Text style={styles.productDetailsTitle}>Product Details</Text>
                <ProductDescription html={product.description} />
              </>
            ) : null}

            {product.stock !== undefined ? (
              <Text style={styles.productDescription}>
                Stock: {product.stock}
              </Text>
            ) : null}

            {product.serve_for ? (
              <Text style={styles.productDescription}>
                Serve For: {product.serve_for}
              </Text>
            ) : null}

            {product.measurement ? (
              <Text style={styles.productDescription}>
                Measurement: {product.measurement}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, isInWishlist && styles.saveButtonActive]}
            onPress={handleToggleWishlist}
            disabled={isLoading}
          >
            <Ionicons 
              name={isInWishlist ? "heart" : "heart-outline"} 
              size={wp('6%')} 
              color={isInWishlist ? "#fff" : "#F70D24"} 
            />
            <Text style={[
              styles.saveButtonText,
              isInWishlist && styles.saveButtonTextActive
            ]}>
              {isInWishlist ? 'Saved' : 'Save for later'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
           
            <Text style={{ color: 'white', fontFamily: 'Montserrat-Bold' }}>Go to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
   // backgroundColor: 'red',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F70D24',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  headerTitle: {
    color: 'white',
    fontSize: wp('4.5%'),
    fontFamily: 'Montserrat-Bold',
  },
  scrollContentContainer: {
    paddingBottom: hp('3%'), // Space for the fixed footer
  },
  productImage: {
    width: '100%',
    height: hp('40%'),
    resizeMode: 'cover',
    marginLeft: wp('1%'),
    marginTop: hp('1%'),
    marginRight: wp('41%'),
    borderRadius: wp('2%'),
  },
  detailsContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1.5%'),
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('3%'),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleAndRating: {
    flex: 1,
  },
  productName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#D32F2F',
    fontFamily: 'Montserrat-Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.7%'),
  },
  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: '#ffcccc',
    paddingHorizontal: wp('1.5%'),
    paddingVertical: hp('0.2%'),
    borderRadius: wp('1%'),
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  ratingCountText: {
    fontSize: wp('3.2%'),
    color: '#757575',
  },
  ratingText: {
    fontSize: wp('3.2%'),
    color: '#cc0000',
  },
  star: {
    color: '#cc0000',
    fontSize: wp('3.2%'),
  },
  shareIconContainer: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'),
    backgroundColor: '#FEEBEE',
    justifyContent: 'center',
    alignItems: 'center',
   marginLeft: wp('2.5%'),
  },
  priceSection: {
    alignItems: 'center',
    marginTop: hp('1.5%'),
    marginHorizontal: wp('3%'),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  currentPrice: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#004D40',
    fontFamily: 'Montserrat-Bold',
  },
  originalPrice: {
    fontSize: wp('3%'),
    color: '#757575',
    textDecorationLine: 'line-through',
    marginLeft: wp('2.5%'),
    fontFamily: 'Montserrat-Regular',
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: wp('1.3%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    marginLeft: wp('3%'),
  },
  discountText: {
    color: '#4CAF50',
    fontSize: wp('3%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: hp('2.5%'),
    marginBottom: hp('2.5%'),
  },
  quantitySelector: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    marginRight: wp('2.5%'),
  },
  quantityText: {
    fontSize: wp('2%'),
    color: '#616161',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#F70D24',
    borderRadius: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('8%'),
  },
  addButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    alignItems: 'center',
  },
  productDetailsSection: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2.5%'),
    borderTopWidth: hp('0.8%'),
    borderTopColor: '#F5F5F5',
    marginHorizontal: wp('3%'),
  },
  productDetailsTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: hp('1.5%'),
  },
  productDetailsSubtitle: {
    fontSize: wp('3.5%'),
    color: '#424242',
    marginBottom: hp('0.5%'),
    fontWeight: '500',
  },
  productDescription: {
    fontSize: wp('3.5%'),
    color: '#616161',
    lineHeight: hp('2.8%'),
    fontFamily: 'Montserrat-Regular',
  },
  discountedPrice: {
    fontSize: wp('5.5%'),
    color: 'green',
    lineHeight: hp('2.8%'),
    marginLeft: wp('2%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 0,
    borderTopColor: '#EEEEEE',
    height: hp('9%'),
  },
  saveButton: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: wp('4%'),
    borderWidth: 1,
    borderColor: '#F70D24',
    borderRadius: wp('2%'),
  },
  saveButtonText: {
    color: '#F70D24',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  saveButtonActive: {
    backgroundColor: '#F70D24',
    borderColor: '#F70D24',
  },
  saveButtonTextActive: {
    color: '#fff',
  },
  cartButton: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: wp('4%'),
    backgroundColor: '#F70D24',
    borderRadius: wp('2%'),
  },
  cartButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
    fontFamily: 'Montserrat-Bold',
  },
  offerBadge: {
    backgroundColor: 'green',
    borderRadius: wp('1%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.7%'),
    marginHorizontal: wp('2%'),
  },
  offerBadgeText: {
    color: 'white',
    fontSize: wp('3%'),
    fontWeight: 'bold',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    justifyContent: 'space-between',
    marginHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
  },
  quantityBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    height: hp('6%'),
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    marginRight: wp('3%'),
  },
  cartButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: '#555',
  },
});
