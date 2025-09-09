// App.js// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerNavigation from './src/Navigation/DrawerNavigation';

import AddressPage from './src/Screens/AddressPage';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import AddAddress from './src/Screens/AddAddress';
import SubCategory from './src/Screens/SubCategory';
import ProductDetails from './src/Screens/ProductDetails';
import Cart from './src/Screens/Cart';
import CheckOut from './src/Screens/CheckOut';
import Payment from './src/Screens/Payment';
import OrderConfirmed from './src/Screens/OrderConfirmed';
import BillPlzWebView from './src/Screens/BillPlzWebView';
import Login from './src/Screens/Login';
import OtpScreen from './src/Screens/OtpScreen';
import Profile from './src/Screens/Profile';
import Orders from './src/Screens/Orders';
import Settings from './src/Screens/Settings';
import Support from './src/Screens/Support';
import About from './src/Screens/About';
import ContactUs from './src/Screens/ContactUs';
import Faq from './src/Screens/Faq';
import TermsAndCondition from './src/Screens/TermsAndCondition';
import PrivacyPolicy from './src/Screens/PrivacyPolicy';
import MyOrders from './src/Screens/MyOrders';
import Rating from './src/Screens/Rating';
import OrderDatials from './src/Screens/OrderDatials';
import Search from './src/Screens/Search';
 import PaymentFailure from './src/Screens/Paymentfailure';
import NotificationScreen from './src/Screens/Notification';
import ShareApp from './src/Screens/ShareApp';
import HomeScreen from './src/Screens/BottomTap/Home';
import { CartProvider } from './src/Context/CartContext';
import Toast from 'react-native-toast-message';
import { initDB } from './src/DataBase/db';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNav() {
  return <DrawerNavigation />;
}

const App = () => {
  // Initialize database when app starts
  React.useEffect(() => {
    initDB().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainDrawer"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="MainDrawer" component={DrawerNav} />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="AddressPage" component={AddressPage} />
          <Stack.Screen name="AddAddress" component={AddAddress} />
          <Stack.Screen name="SubCategory" component={SubCategory} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="CheckOut" component={CheckOut} />
          <Stack.Screen name="Payment" component={Payment} />
          <Stack.Screen name="OrderConfirmed" component={OrderConfirmed} />
          <Stack.Screen name="BillPlzWebView" component={BillPlzWebView} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="OtpScreen" component={OtpScreen} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Orders" component={Orders} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Support" component={Support} />
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="ContactUs" component={ContactUs} />
          <Stack.Screen name="Faq" component={Faq} />
          <Stack.Screen name="TermsAndCondition" component={TermsAndCondition} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="Rating" component={Rating} />
          <Stack.Screen name="OrderDatials" component={OrderDatials} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="PaymentFailure" component={PaymentFailure} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="ShareApp" component={ShareApp} />
          <Stack.Screen name="ReferEarn" component={Support} />
          
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;