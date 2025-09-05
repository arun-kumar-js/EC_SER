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
import SidebarModal from '../../Components/SidebarModal';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const [drawerVisible, setDrawerVisible] = useState(false);

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

  // Drawer functions
  const openDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

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
    <View style={{ flex: 1 }}>
      <TabHeader 
        title="Categories"
        onMenuPress={openDrawer}
        onCartPress={() => navigation.navigate('Cart')}
        showLocation={false}
      />
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
          paddingHorizontal: wp('2.5%'),
          paddingVertical: hp('2%'),
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />

      {/* Sidebar Modal */}
      <SidebarModal
        visible={drawerVisible}
        onClose={closeDrawer}
        navigation={navigation}
      />
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#e60023',
    height: hp('12%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
  },
  locationText: {
    color: '#fff',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  cardContainer: {
    width: wp('45%'),
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: wp('1%'),
    alignItems: 'center',
    paddingBottom: hp('1.5%'),
    marginBottom: hp('2%'),
    alignSelf: 'flex-start',
  },
  cardImage: {
    width: '100%',
    height: hp('26%'),
    resizeMode: 'cover',
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
