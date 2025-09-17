import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrderDetails } from '../Fuctions/OrderService';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderDatials = ({ route, navigation }) => {
  const { orderId, orderData: paramsOrderData } = route.params || {};
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  
  console.log("=== ORDER DETAILS DEBUG ===");
  console.log("orderData:", orderData);
  console.log("user_name:", orderData?.user_name);
  console.log("email:", orderData?.email);
  console.log("mobile:", orderData?.mobile);
  console.log("address:", orderData?.address);
  console.log("delivery_method:", orderData?.delivery_method);
  console.log("payment_method:", orderData?.payment_method);
  console.log("customer_details:", orderData?.customer_details);
  // Handle both direct orderData and orderId cases
  useEffect(() => {
    const hydrateFromService = async () => {
      try {
        console.log('=== ORDER DETAILS FETCH DEBUG ===');
        console.log('Order ID from params:', orderId);
        console.log('Order Data from params:', paramsOrderData);
        
        // If orderData is passed directly, use it
        if (paramsOrderData) {
          console.log('Using passed order data directly');
          // Ensure individual fields are extracted for easier access
          const processedOrderData = {
            ...paramsOrderData,
            user_name: paramsOrderData.user_name || paramsOrderData.customer_details?.name ,
            mobile: paramsOrderData.mobile || paramsOrderData.customer_details?.mobile,
            address: paramsOrderData.address || paramsOrderData.customer_details?.address,
            email: paramsOrderData.email || paramsOrderData.customer_details?.email,
          };
          setOrderData(processedOrderData);
          setLoading(false);
          return;
        }
        
        // Otherwise, fetch from API using orderId
        if (orderId) {
          setLoading(true);
          const storedUser = await AsyncStorage.getItem('userData');
          const user = storedUser ? JSON.parse(storedUser) : null;
          const userId = user?.user_id || user?.id;
          
          console.log('Stored user:', user);
          console.log('User ID:', userId);
          
          if (userId) {
            console.log('Fetching order details for user:', userId, 'order:', orderId);
            const result = await getOrderDetails(userId, orderId);
            console.log('Order details API result:', result);
            
            if (result.success && result.order) {
              console.log('Order found, mapping data...');
              // Map order to expected shape for UI
              const order = result.order;
              const mapped = {
                order_id: order.id,
                id: order.id,
                order_date: order.date_added,
                date_added: order.date_added,
                active_status: order.active_status || order.status,
                items_amount: order.final_total || order.total,
                delivery_charge: order.delivery_charge || '0.0',
                tax: order.tax || '0.0',
                total: order.total || order.final_total,
                grand_total: order.final_total || order.total,
                delivery_time: order.delivery_time,
                delivery_method: order.delivery_method,
                payment_method: order.payment_method,
                customer_details: {
                  name: order.name || 'Customer',
                  mobile: order.mobile,
                  address: order.address,
                  email: order.email,
                },
                // Extract individual fields for easier access
                user_name: order.user_name || order.name || 'Customer',
                mobile: order.mobile,
                address: order.address,
                email: order.email,
                products: (order.items || []).map(item => ({
                  product_id: item.product_id || item.id,
                  name: item.name,
                  image: item.image,
                  quantity: String(item.quantity || 1),
                  price: String(item.discounted_price || item.price || 0),
                  sub_total: String(item.sub_total || item.price || 0),
                  measurement: item.measurement,
                  unit: item.unit,
                  product_variant_id: item.product_variant_id || item.product_id || item.id,
                  discounted_price: String(item.discounted_price || item.price || 0),
                })),
                status: order.status || [],
              };
              setOrderData(mapped);
              console.log('Order data set successfully:', mapped);
            } else {
              console.log('Order not found in API result:', result);
            }
          } else {
            console.log('No user ID found, cannot fetch order details');
          }
        } else {
          console.log('No order ID provided');
        }
      } catch (e) {
        console.log('Failed to load order details:', e);
      } finally {
        setLoading(false);
      }
    };
    hydrateFromService();
  }, [orderId, paramsOrderData]);

  // Function to check if order cannot be cancelled
  const isOrderNonCancellable = (status) => {
    const nonCancellableStatuses = [
      'shipped',
      'out_for_delivery', 
      'delivered',
      'cancelled',
      'cancel',
      'completed',
      'in_transit',
      'confirmed_and_shipped'
    ];
    
    return nonCancellableStatuses.includes(status?.toLowerCase());
  };

  // Cancel Order API Function
  const cancelOrder = async () => {
    try {
      setIsCancelling(true);
      
      const formData = new FormData();
      formData.append('accesskey', '90336');
      formData.append('update_order_status', '1');
      formData.append('status', 'cancelled');
      formData.append('id', orderData.order_id || orderData.id);

      console.log('Cancelling order with data:', {
        accesskey: '90336',
        update_order_status: '1',
        status: 'cancelled',
        id: orderData.order_id || orderData.id
      });

      const response = await fetch(`${API_BASE_URL}order-process.php`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      console.log('Cancel order API response:', result);

      if (result.error === false) {
        Alert.alert(
          'Success',
          'Order has been cancelled successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                // Update local state
                setOrderData(prev => ({
                  ...prev,
                  active_status: 'Cancelled'
                }));
                // Navigate back or refresh
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          result.message || 'Failed to cancel order. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      Alert.alert(
        'Error',
        'Network error. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Debug: Log the received params
  useEffect(() => {
    console.log('=== ORDER DETAILS PARAMS DEBUG ===');
    console.log('Route params:', route.params);
    console.log('Params orderData:', route.params?.orderData);
    console.log('Current orderData state:', orderData);
    console.log('Has params orderData:', !!route.params?.orderData);
    console.log('Order ID from params:', route.params?.orderData?.order_id);
    console.log('Customer name from params:', route.params?.orderData?.customer_details?.name);
    console.log('===================================');
  }, [route.params, orderData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e60023" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#e60023" />
        </View>
      </SafeAreaView>
    );
  }

  if (!orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#e60023" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#333' }}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e60023" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image 
            source={require('../Assets/Images/Arrow.png')} 
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer}>
      

        {/* Order Header */}
        <View style={styles.section}>
          {orderData.id && (
            <View style={styles.row}>
              <Text style={styles.label}>Order ID:</Text>
              <Text style={styles.value}>{orderData.id}</Text>
            </View>
          )}
          {orderData.date_added && (
            <View style={styles.row}>
              <Text style={styles.label}>Order Date:</Text>
              <Text style={styles.value}>{orderData.date_added}</Text>
            </View>
          )}
          {orderData.active_status && (
            <View style={styles.row}>
              <Text style={styles.label}>Order Status:</Text>
              <Text style={[styles.value, { 
                color: orderData.active_status === 'cancelled' ? '#dc3545' : 
                       orderData.active_status === 'delivered' ? '#28a745' : '#007bff' 
              }]}>{orderData.active_status}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products ({orderData.items?.length || orderData.products?.length || 0})</Text>
          {(orderData.items || orderData.products) && (orderData.items?.length > 0 || orderData.products?.length > 0) ? (
            (orderData.items || orderData.products).map((product, index) => (
              <View key={`${product.product_id}-${index}`} style={styles.productContainer}>
                {product.image && (
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                )}
                <View style={styles.productInfo}>
                  {product.name && (
                    <Text style={styles.productName}>{product.name}</Text>
                  )}
                  {product.quantity && (
                    <Text style={styles.quantity}>Qty. {product.quantity}</Text>
                  )}
                  {(product.price || product.discounted_price) && (
                    <Text style={styles.price}>RM {product.discounted_price || product.price}</Text>
                  )}
                  {product.measurement && product.unit && (
                    <Text style={styles.measurement}>{product.measurement} {product.unit}</Text>
                  )}
                  {product.sub_total && (
                    <Text style={styles.subtotal}>Subtotal: RM {product.sub_total}</Text>
                  )}
                  {product.discount && product.discount !== '0' && (
                    <Text style={styles.discount}>Discount: RM {product.discount}</Text>
                  )}
                </View>
               
              </View>
            ))
          ) : (
            // Fallback for old single product structure
            <View style={styles.productContainer}>
              {orderData.image && (
                <Image source={{ uri: orderData.image }} style={styles.productImage} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{orderData.name || 'Product Name'}</Text>
                <Text style={styles.quantity}>Qty. {orderData.quantity || '1'}</Text>
                <Text style={styles.price}>RM {orderData.price || '0'}</Text>
                <Text style={styles.measurement}>{orderData.measurement || '1'} {orderData.unit || 'unit'}</Text>
              </View>
              {!isOrderNonCancellable(orderData.active_status) && 
               !['Cancelled', 'cancel', 'cancelled'].includes(orderData.active_status?.toLowerCase()) && (
                <TouchableOpacity style={styles.returnButton}>
                  <Text style={styles.returnButtonText}>Cancel item</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

      

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          {orderData.total && (
            <View style={styles.row}>
              <Text style={styles.label}>Items Amount:</Text>
              <Text style={styles.value}>RM {orderData.total}</Text>
            </View>
          )}
          {orderData.delivery_charge && orderData.delivery_charge !== '0.00' && (
            <View style={styles.row}>
              <Text style={styles.label}>Delivery Charge:</Text>
              <Text style={styles.value}>RM {orderData.delivery_charge}</Text>
            </View>
          )}
          {orderData.tax_amount && orderData.tax_amount !== '0.00' && (
            <View style={styles.row}>
              <Text style={styles.label}>Tax:</Text>
              <Text style={styles.value}>+ RM {orderData.tax_amount}</Text>
            </View>
          )}
          {orderData.discount && orderData.discount !== '0' && (
            <View style={styles.row}>
              <Text style={styles.label}>Discount:</Text>
              <Text style={styles.value}>- RM {orderData.discount_rm || orderData.discount}</Text>
            </View>
          )}
          {orderData.promo_discount && orderData.promo_discount !== '0' && (
            <View style={styles.row}>
              <Text style={styles.label}>Promo Discount:</Text>
              <Text style={styles.value}>- RM {orderData.promo_discount}</Text>
            </View>
          )}
          {orderData.final_total && (
            <View style={[styles.row, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>RM {orderData.final_total}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{orderData.user_name || orderData.customer_details?.name || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mobile No:</Text>
              <Text style={styles.detailValue}>{orderData.mobile || orderData.customer_details?.mobile || 'N/A'}</Text>
            </View>
            {orderData.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{orderData.address}</Text>
              </View>
            )}
            {orderData.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{orderData.email}</Text>
              </View>
            )}
            {orderData.delivery_time && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Delivery Time:</Text>
                <Text style={styles.detailValue}>{orderData.delivery_time}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailValue}>{orderData.payment_method || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Method:</Text>
              <Text style={styles.detailValue}>{orderData.delivery_method || 'N/A'}</Text>
            </View>
            {orderData.payment_status && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status:</Text>
                <Text style={styles.detailValue}>{orderData.payment_status === '1' ? 'Paid' : 'Pending'}</Text>
              </View>
            )}
            {orderData.delivery_boy_id && orderData.delivery_boy_id !== '0' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Delivery Boy ID:</Text>
                <Text style={styles.detailValue}>{orderData.delivery_boy_id}</Text>
              </View>
            )}
            {orderData.courier && orderData.courier !== '0' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Courier:</Text>
                <Text style={styles.detailValue}>{orderData.courier}</Text>
              </View>
            )}
            {orderData.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <Text style={styles.detailValue}>{orderData.notes}</Text>
              </View>
            )}
            {orderData.promo_code && orderData.promo_code !== '-' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Promo Code:</Text>
                <Text style={styles.detailValue}>{orderData.promo_code}</Text>
              </View>
            )}
            {orderData.loyalty_points && orderData.loyalty_points !== '0' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loyalty Points:</Text>
                <Text style={styles.detailValue}>{orderData.loyalty_points}</Text>
              </View>
            )}
            {orderData.earned_loyalty_points && orderData.earned_loyalty_points !== '0' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Earned Points:</Text>
                <Text style={styles.detailValue}>{orderData.earned_loyalty_points}</Text>
              </View>
            )}
            {orderData.wallet_balance && orderData.wallet_balance !== '0' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Wallet Balance:</Text>
                <Text style={styles.detailValue}>RM {orderData.wallet_balance}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.statusProgressContainer}>
            <View style={styles.statusItem}>
              <View style={[styles.statusCircle, 
                ['received', 'Processing', 'Confirmed', 'Order Placed'].includes(orderData.active_status) ? styles.activeStatusCircle : styles.inactiveStatusCircle]} />
              <Text style={styles.statusLabel}>Order Placed</Text>
              {['received', 'Processing', 'Confirmed', 'Order Placed'].includes(orderData.active_status) && (
                <Text style={styles.statusDate}>{orderData.date_added || orderData.order_date || 'N/A'}</Text>
              )}
            </View>
            
            <View style={styles.statusConnector} />
            
            <View style={styles.statusItem}>
              <View style={[styles.statusCircle, 
                ['In Transit', 'Shipped', 'Order Processed'].includes(orderData.active_status) ? styles.activeStatusCircle : styles.inactiveStatusCircle]} />
              <Text style={styles.statusLabel}>Order Processed</Text>
              {['In Transit', 'Shipped', 'Order Processed'].includes(orderData.active_status) && (
                <Text style={styles.statusDate}>{orderData.date_added || orderData.order_date || 'N/A'}</Text>
              )}
            </View>
            
            <View style={styles.statusConnector} />
            
            <View style={styles.statusItem}>
              <View style={[styles.statusCircle, 
                ['Order Shipped'].includes(orderData.active_status) ? styles.activeStatusCircle : styles.inactiveStatusCircle]} />
              <Text style={styles.statusLabel}>Order Shipped</Text>
              {['Order Shipped'].includes(orderData.active_status) && (
                <Text style={styles.statusDate}>{orderData.date_added || orderData.order_date || 'N/A'}</Text>
              )}
            </View>
            
            <View style={styles.statusConnector} />
            
            <View style={styles.statusItem}>
              <View style={[styles.statusCircle, 
                ['Delivered', 'Order Delivered'].includes(orderData.active_status) ? styles.activeStatusCircle : 
                ['Cancelled', 'cancel', 'cancelled'].includes(orderData.active_status?.toLowerCase()) ? styles.cancelledStatusCircle : styles.inactiveStatusCircle]} />
              <Text style={styles.statusLabel}>
                {['Cancelled', 'cancel', 'cancelled'].includes(orderData.active_status?.toLowerCase()) ? 'Order Cancelled' : 'Order Delivered'}
              </Text>
              {(['Delivered', 'Order Delivered'].includes(orderData.active_status) || ['Cancelled', 'cancel', 'cancelled'].includes(orderData.active_status?.toLowerCase())) && (
                <Text style={styles.statusDate}>{orderData.date_added || orderData.order_date || 'N/A'}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Cancel/Review Button at Bottom */}
      <View style={styles.bottomButtonContainer}>
        {orderData.active_status === 'Delivered' ? (
          <TouchableOpacity 
            style={styles.reviewOrderButton}
            onPress={() => {
              console.log('Navigating to Rating page with data:', orderData);
              navigation.navigate('Rating', {
                orderData: orderData
              });
            }}
          >
            <Text style={styles.reviewOrderButtonText}>REVIEW</Text>
          </TouchableOpacity>
        ) : (
          // Only show cancel button if order can be cancelled and is not already cancelled
          !isOrderNonCancellable(orderData.active_status) && 
          !['Cancelled', 'cancel', 'cancelled'].includes(orderData.active_status?.toLowerCase()) && (
            <TouchableOpacity 
              style={[styles.cancelOrderButton, isCancelling && styles.cancelOrderButtonDisabled]}
              onPress={() => {
                Alert.alert(
                  'Cancel Order',
                  'Are you sure you want to cancel this order?',
                  [
                    {
                      text: 'No',
                      style: 'cancel'
                    },
                    {
                      text: 'Yes, Cancel',
                      style: 'destructive',
                      onPress: cancelOrder
                    }
                  ]
                );
              }}
              disabled={isCancelling}
            >
              <Text style={styles.cancelOrderButtonText}>
                {isCancelling ? 'CANCELLING...' : 'CANCEL ORDER?'}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContainer: {
    flex: 1,
  },
  debugSection: {
    backgroundColor: '#fff3cd',
    padding: 12,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
    fontFamily: 'Montserrat-Regular',
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    fontFamily: 'Montserrat-SemiBold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Montserrat-Medium',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    flex: 0.4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Montserrat-Medium',
    flex: 0.6,
    textAlign: 'right',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
    fontFamily: 'Montserrat-Regular',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
    fontFamily: 'Montserrat-Bold',
  },
  measurement: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Montserrat-Regular',
  },
  subtotal: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: 'Montserrat-Bold',
  },
  discount: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: 'Montserrat-Bold',
  },
  returnButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium',
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelOrderButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  cancelOrderButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  reviewOrderButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  starContainer: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  starButton: {
    marginRight: 8,
  },
  star: {
    fontSize: 24,
    fontFamily: 'Montserrat-Regular',
  },
  starFilled: {
    color: '#ffc107',
  },
  starEmpty: {
    color: '#ddd',
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  reviewInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    textAlignVertical: 'top',
    minHeight: 80,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  submitButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  statusContainer: {
    marginTop: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  horizontalStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  horizontalStatusItem: {
    alignItems: 'center',
    flex: 1,
  },
  horizontalStatusText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontFamily: 'Montserrat-Regular',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  activeStatus: {
    backgroundColor: '#28a745',
  },
  inactiveStatus: {
    backgroundColor: '#ddd',
  },
  cancelledStatus: {
    backgroundColor: '#dc3545',
  },
  statusInfoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  currentStatusText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
  },
  statusValue: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  statusDateText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  statusDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  statusProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 8,
  },
  activeStatusCircle: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  inactiveStatusCircle: {
    backgroundColor: 'transparent',
    borderColor: '#ddd',
  },
  cancelledStatusCircle: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  statusLabel: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Montserrat-Regular',
  },
  statusConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
    marginTop: -10,
  },
});

export default OrderDatials;