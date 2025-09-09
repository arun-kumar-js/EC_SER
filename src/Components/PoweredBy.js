import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PoweredBy = ({ style, textStyle, imageStyle }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>Powered by</Text>
      <Image 
        source={require('../Assets/Images/spider.png')} 
        style={[styles.image, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
  },
  text: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginRight: wp('2%'),
    fontFamily: 'Montserrat-Regular',
  },
  image: {
    width: wp('15%'),
    height: hp('3%'),
  },
});

export default PoweredBy;
