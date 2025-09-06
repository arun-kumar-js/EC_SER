// Example of how to navigate to OrderDetails with data
// This is just an example file - you can delete it after understanding the usage

import { useNavigation } from '@react-navigation/native';

const ExampleNavigation = () => {
  const navigation = useNavigation();

  // Example order data structure
  const exampleOrderData = {
    active_status: "received",
    date_added: "2025-01-15 10:30:00",
    discount: "10",
    discounted_price: "90",
    id: "123",
    image: "https://example.com/product-image.jpg",
    measurement: "500",
    name: "Organic Honey",
    order_id: "ORD-001",
    price: "100",
    product_id: "P001",
    product_variant_id: "V001",
    quantity: "2",
    rating: "0",
    rating_desc: "",
    sub_total: "200",
    unit: "gm",
    user_id: "U001",
    status: [["received", "15-01-2025 10:30:00am"]],
    order_date: "15-01-2025",
    customer_details: {
      name: "John Doe",
      mobile: "9876543210",
      address: "123 Main Street, City, State - 123456",
      email: "john.doe@example.com",
    },
    delivery_time: "Today/Evening 6PM - 9PM",
    items_amount: "200",
    delivery_charge: "50",
    tax: "25",
    total: "250",
    grand_total: "275"
  };

  const navigateToOrderDetails = () => {
    navigation.navigate('OrderDetails', {
      orderData: exampleOrderData
    });
  };

  return {
    navigateToOrderDetails,
    exampleOrderData
  };
};

export default ExampleNavigation;

// Usage in your component:
// const { navigateToOrderDetails } = ExampleNavigation();
// 
// <TouchableOpacity onPress={navigateToOrderDetails}>
//   <Text>View Order Details</Text>
// </TouchableOpacity>
