import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HomeScreen from '../Screens/BottomTap/Home';
import CategoryScreen from '../Screens/BottomTap/Category';
import WishlistScreen from '../Screens/BottomTap/WishList';
import MoreScreen from '../Screens/BottomTap/More';

const Tab = createBottomTabNavigator();

const BottomTap = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          if (route.name === 'Category') iconName = 'grid';
          else if (route.name === 'Wishlist') iconName = 'heart';
          else if (route.name === 'more') iconName = 'ellipsis-horizontal';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e60023',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="cart" size={25} color="#fff" />
          </TouchableOpacity>
        ),
        headerStyle: { backgroundColor: '#EF3340' },
        headerTintColor: '#fff',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
          fontFamily: 'Poppins',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Category" 
        component={CategoryScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Wishlist" 
        component={WishlistScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="more" 
        component={MoreScreen} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default BottomTap;
