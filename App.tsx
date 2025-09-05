// App.tsx

// MUST be at the top — before any other imports
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomTap from './src/Navigation/BottomTap';
import AddressPage from './src/Screens/AddressPage';
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
import Faq from './src/Screens/Faq';
import TermsAndCondition from './src/Screens/TermsAndCondition';
import PrivacyPolicy from './src/Screens/PrivacyPolicy';
import MyOrders from './src/Screens/MyOrders';
import Rating from './src/Screens/Rating';
import OrderDatials from './src/Screens/OrderDatials';
import Search from './src/Search';
import PaymentFailure from './src/Screens/PaymentFailure';
import { initDB } from './src/DataBase/db';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

const App = () => {
  // Initialize database when app starts
  React.useEffect(() => {
    initDB().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainApp"
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="MainApp" component={BottomTap} />
          <Stack.Screen
            name="AddressPage"
            component={AddressPage}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="AddAddress" component={AddAddress} />
          <Stack.Screen name="SubCategory" component={SubCategory} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="OtpScreen" component={OtpScreen} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="CheckOut" component={CheckOut} />
          <Stack.Screen
            name="Payment"
            component={Payment}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="OrderConfirmed" component={OrderConfirmed} />
          <Stack.Screen name="BillPlzWebView" component={BillPlzWebView} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Orders" component={Orders} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Support" component={Support} />
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="Faq" component={Faq} />
          <Stack.Screen name="TermsAndCondition" component={TermsAndCondition} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="Rating" component={Rating} />
          <Stack.Screen name="OrderDatials" component={OrderDatials} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="PaymentFailure" component={PaymentFailure} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
