import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_ACCESS_KEY, HOMEPAGE_ENDPOINT } from '../../config/config';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import TabHeader from '../../Components/TabHeader';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const formData = new FormData();
        formData.append('accesskey', API_ACCESS_KEY);
        const response = await axios.post(HOMEPAGE_ENDPOINT, formData);
        if (response.data && response.data.error === 'false') {
          setCategories(response.data.data.category || []);
        } else {
          console.error('API error:', response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);


  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate('SubCategory', {
          category_id: item.id,
          category_name: item.name,
        });
      }}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderBox} />
      )}
      <Text style={styles.cardText} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleMenuPress = () => {
    // Navigate to home screen to access the drawer
    navigation.navigate('Home');
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: wp('4%') }}>
            {/* Drawer swipe indicator - clickable */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                console.log('Menu button pressed in Category');
                
                // Try to get the drawer navigation
                try {
                  const drawerNavigation = navigation.getParent('Drawer');
                  if (drawerNavigation && drawerNavigation.openDrawer) {
                    console.log('Opening drawer via getParent(Drawer)');
                    drawerNavigation.openDrawer();
                    return;
                  }
                } catch (error) {
                  console.log('Error with getParent(Drawer):', error);
                }
                
                // Try alternative approach - get all parents
                try {
                  let currentNav = navigation;
                  while (currentNav) {
                    if (currentNav.openDrawer) {
                      console.log('Opening drawer via parent navigation');
                      currentNav.openDrawer();
                      return;
                    }
                    currentNav = currentNav.getParent();
                  }
                } catch (error) {
                  console.log('Error with parent navigation:', error);
                }
                
                console.log('Could not find drawer navigation');
              }}
              activeOpacity={0.7}
            >
              <Image 
                source={require('../../Assets/icon/menu.png')} 
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Categories</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={{ position: 'absolute', right: wp('4%'), padding: wp('2%') }}
            >
              <Icon name="cart" size={wp('6%')} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        contentContainerStyle={{
          paddingHorizontal: wp('4%'),
          paddingVertical: hp('2%'),
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Category;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#EF3340',
    paddingVertical: hp('2%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins',
  },
  menuButton: {
    position: 'absolute',
    left: wp('4%'),
    padding: wp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIcon: {
    width: wp('6%'),
    height: wp('6%'),
    tintColor: '#fff',
  },
  locationText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  cardContainer: {
    width: wp('46%'),
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    alignItems: 'center',
    paddingBottom: hp('2%'),
    marginBottom: hp('1%'),
    alignSelf: 'flex-start',
  },
  cardImage: {
    width: '100%',
    height: hp('24%'),
    resizeMode: 'cover',
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
  },
  placeholderBox: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('3%'),
    backgroundColor: '#ccc',
    marginBottom: hp('1.5%'),
  },
  cardText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
  },
});
