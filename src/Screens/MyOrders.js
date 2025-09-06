import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
// Vector icons replaced with image assets
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserOrders } from '../Fuctions/OrderService';
import { API_BASE_URL } from '../config/config';

const MyOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterTabs = ['All', 'In-Process', 'Shipped', 'Delivered', 'Cancelled'];

  const fetchUserOrders = async () => {
    try {
      setLoading(true);

      // Get user data from AsyncStorage
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUser(userObj);

        const userId = userObj.user_id || userObj.id;
        console.log('Fetching orders for user ID:', userId);

        if (userId) {
          const result = await getUserOrders(userId);
          console.log('Orders API result:', result);

          if (result.success) {
            // Group orders with their products
            const groupedOrders = [];

            result.orders.forEach(order => {
              console.log('=== ORDER DATA ===');
              console.log('Order:', order);

              const orderData = {
                orderId: order.id,
                orderDate: order.date_added || new Date().toISOString().split('T')[0],
                orderStatus: getOrderStatus(order.active_status || order.status || 'received'),
                orderTotal: parseFloat(order.final_total || order.total || 0),
                paymentMethod: order.payment_method || 'N/A',
                deliveryMethod: order.delivery_method || 'Standard',
                address: order.address || 'N/A',
                mobile: order.mobile || 'N/A',
                deliveryTime: order.delivery_time || 'N/A',
                rawOrderData: order,
                products: []
              };

              // Add products to this order
              if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                  console.log('=== ITEM DATA ===');
                  console.log('Item:', item);
                  console.log('Item Image:', item.image);
                  orderData.products.push({
                    productId: item.product_id || item.id,
                    productName: item.name || 'Unknown Product',
                    productImage: item.image || null,
                    quantity: parseInt(item.quantity || 1),
                    variant: `${item.measurement || ''} ${item.unit || ''}`.trim(),
                    price: parseFloat(item.discounted_price || item.price || 0),
                    rawItemData: item,
                  });
                });
              } else {
                // If no products array, create a single item for the order
                orderData.products.push({
                  productId: 'general',
                  productName: 'Order Items',
                  productImage: null,
                  quantity: parseInt(order.total_items || 1),
                  variant: '',
                  price: parseFloat(order.final_total || order.total || 0),
                  rawItemData: null,
                });
              }

              groupedOrders.push(orderData);
            });

            setOrders(groupedOrders);
          } else {
            console.error('Failed to fetch orders:', result.message);
            // For demo purposes, add sample data if API fails
            const sampleOrders = [
              {
                orderId: '402',
                orderDate: '05-09-2025',
                orderStatus: 'Processing',
                orderTotal: 150.0,
                paymentMethod: 'Cash on Delivery',
                deliveryMethod: 'Standard',
                address: 'Sample Address',
                mobile: '1234567890',
                products: [
                  {
                    productId: 'sample1',
                    productName: 'MALLIGAI GARLAND 2FT',
                    productImage: 'https://via.placeholder.com/150x150/FFFFFF/000000?text=Garland',
                    quantity: 1,
                    variant: '1 pc',
                    price: 50.0,
                  },
                  {
                    productId: 'sample2',
                    productName: 'LIMAU FRUIT',
                    productImage: 'https://via.placeholder.com/150x150/90EE90/000000?text=Fruit',
                    quantity: 1,
                    variant: '5 pc',
                    price: 60.0,
                  },
                  {
                    productId: 'sample3',
                    productName: 'MULLAI',
                    productImage: 'https://via.placeholder.com/150x150/98FB98/000000?text=Flower',
                    quantity: 1,
                    variant: '2 m',
                    price: 40.0,
                  },
                ],
              },
              {
                orderId: '401',
                orderDate: '05-09-2025',
                orderStatus: 'Shipped',
                orderTotal: 50.0,
                paymentMethod: 'Online Payment',
                deliveryMethod: 'Express',
                address: 'Sample Address 2',
                mobile: '9876543210',
                products: [
                  {
                    productId: 'sample4',
                    productName: 'MALLIGAI GARLAND 2FT',
                    productImage: 'https://via.placeholder.com/150x150/FFFFFF/000000?text=Garland',
                    quantity: 1,
                    variant: '1 pc',
                    price: 50.0,
                  },
                ],
              },
            ];
            setOrders(sampleOrders);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = statusCode => {
    // Map status codes to readable status based on your API
    switch (statusCode?.toLowerCase()) {
      case 'received':
        return 'Processing';
      case 'confirmed':
      case 'confirm':
        return 'Confirmed';
      case 'shipped':
      case 'out_for_delivery':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
      case 'cancel':
        return 'Cancelled';
      case 'pending':
        return 'Processing';
      default:
        return 'Processing';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Delivered':
        return '#4CAF50';
      case 'In Transit':
        return '#FF9800';
      case 'Confirmed':
        return '#2196F3';
      case 'Processing':
        return '#FF5722';
      case 'Cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserOrders();
    setRefreshing(false);
  };

  const formatImageUrl = imageUrl => {
    if (!imageUrl) return null;

    // If it's already a complete URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it's a relative path, you might need to prepend your base URL
    // Replace 'YOUR_BASE_URL' with your actual image server URL
    if (
      imageUrl.startsWith('/') ||
      imageUrl.startsWith('images/') ||
      imageUrl.startsWith('uploads/')
    ) {
      return `${API_BASE_URL}${
        imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl
      }`;
    }

    return imageUrl;
  };

  const getFilteredOrders = () => {
    if (selectedFilter === 'All') {
      return orders;
    }

    return orders.filter(item => {
      switch (selectedFilter) {
        case 'In-Process':
          return (
            item.orderStatus === 'Processing' ||
            item.orderStatus === 'Confirmed'
          );
        case 'Shipped':
          return item.orderStatus === 'In Transit';
        case 'Delivered':
          return item.orderStatus === 'Delivered';
        case 'Cancelled':
          return item.orderStatus === 'Cancelled';
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const handleViewDetails = order => {
    console.log('Navigating to OrderDatials with data:', order);

    // Navigate to OrderDetails screen with order data
    navigation.navigate('OrderDatials', {
      orderData: {
        // Order information
        order_id: order.orderId,
        order_date: order.orderDate,
        date_added: order.orderDate,
        active_status: order.orderStatus,
        id: order.orderId,
        
        // Order total and pricing
        items_amount: order.orderTotal.toString(),
        delivery_charge: '0.0',
        tax: '0.0',
        total: order.orderTotal.toString(),
        grand_total: order.orderTotal.toString(),
        
        // Customer details
        customer_details: {
          name: 'Customer',
          mobile: order.mobile || 'N/A',
          address: order.address || 'N/A',
          email: 'customer@example.com',
        },
        
        // Delivery information
        delivery_time: order.deliveryTime || 'N/A',
        delivery_method: order.deliveryMethod || 'Standard',
        payment_method: order.paymentMethod || 'N/A',
        
        // Status
        status: [[order.orderStatus, order.orderDate]],
        rating: '0',
        rating_desc: '',
        
        // Additional fields
        discount: '0',
        user_id: '1',
        
        // Products array for the order
        products: order.products.map(product => ({
          product_id: product.productId,
          name: product.productName,
          image: product.productImage,
          quantity: product.quantity.toString(),
          price: product.price.toString(),
          sub_total: product.price.toString(),
          measurement: product.variant ? product.variant.split(' ')[0] : '1',
          unit: product.variant ? product.variant.split(' ').slice(1).join(' ') : 'unit',
          product_variant_id: product.productId,
          discounted_price: product.price.toString(),
        })),
      },
    });
  };

  const renderFilterTab = tab => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.filterTab,
        selectedFilter === tab && styles.activeFilterTab,
      ]}
      onPress={() => setSelectedFilter(tab)}
    >
      <Text
        style={[
          styles.filterTabText,
          selectedFilter === tab && styles.activeFilterTabText,
        ]}
      >
        {tab}
      </Text>
    </TouchableOpacity>
  );

  const renderOrderItem = order => (
    <View key={order.orderId} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Ordered ID: {order.orderId}</Text>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(order)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.orderDate}>Order Date: {order.orderDate}</Text>
      <View style={styles.dateDivider} />

      {/* Render all products in this order */}
      {order.products.map((product, index) => (
        <View key={`${order.orderId}-${product.productId}-${index}`} style={[
          styles.productItem,
          index === order.products.length - 1 && styles.lastProductItem
        ]}>
          <View style={styles.productImageContainer}>
            {formatImageUrl(product.productImage) ? (
              <Image
                source={{ uri: formatImageUrl(product.productImage) }}
                style={styles.productImage}
                resizeMode="contain"
                onError={error => {
                  console.log('Image load error:', error.nativeEvent.error);
                  console.log(
                    'Failed image URL:',
                    formatImageUrl(product.productImage),
                  );
                }}
                onLoad={() => {
                  console.log(
                    'Image loaded successfully:',
                    formatImageUrl(product.productImage),
                  );
                }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderIconText}>📷</Text>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>

          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.productName}</Text>
            <Text style={styles.productQuantity}>Qty. {product.quantity}</Text>
            {product.variant && (
              <Text style={styles.productVariant}>{product.variant}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../Assets/Images/Arrow.png')} 
            style={styles.backArrow} 
            resizeMode="contain" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My orders</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContainer}
        >
          {filterTabs.map(tab => renderFilterTab(tab))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#EE2737']}
            tintColor="#EE2737"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EE2737" />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(order => renderOrderItem(order))
        ) : (
          <View style={styles.emptyState}>
            <Image 
              source={require('../Assets/Images/order.png')} 
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'All'
                ? 'No Orders Yet'
                : `No ${selectedFilter} Orders`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'All'
                ? 'Start shopping to see your orders here'
                : `You don't have any ${selectedFilter.toLowerCase()} orders`}
            </Text>
            {selectedFilter === 'All' && (
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#EE2737',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backArrow: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
  filterContainer: {
    backgroundColor: '#EE2737',
    paddingBottom: 16,
  },
  filterTabsContainer: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterTab: {
    backgroundColor: '#fff',
  },
  filterTabText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  activeFilterTabText: {
    color: '#EE2737',
    fontFamily: 'Montserrat-SemiBold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastProductItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  viewDetailsButton: {
    backgroundColor: '#EE2737',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Montserrat-Regular',
  },
  dateDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
    width: '100%',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeholderIconText: {
    fontSize: 40,
    color: '#ccc',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat-SemiBold',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Montserrat-Medium',
  },
  productVariant: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: '#ccc',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Montserrat-Regular',
  },
  shopButton: {
    backgroundColor: '#EE2737',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
});

export default MyOrders;