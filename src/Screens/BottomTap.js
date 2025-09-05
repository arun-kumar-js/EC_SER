import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from './BottomTap/Home.js';
import CategoryScreen from './BottomTap/Category.tsx';
import WishlistScreen from './BottomTap/WishList.tsx';
import MoreScreen from './BottomTap/More.js';

const Tab = createBottomTabNavigator();

const BottomTap = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Category') {
            iconName = 'grid';
          } else if (route.name === 'Wishlist') {
            iconName = 'heart';
          } else if (route.name === 'More') {
            iconName = 'ellipsis-horizontal';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

export default BottomTap;
