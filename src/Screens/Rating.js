import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Rating = ({ route }) => {
  const navigation = useNavigation();
  const { productId, productName, productImage, orderId } = route.params || {};

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarPress = selectedRating => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        'Rating Required',
        'Please select a rating before submitting.',
      );
      return;
    }

    if (review.trim().length === 0) {
      Alert.alert(
        'Review Required',
        'Please enter your review before submitting.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // API call to submit rating and review
      const formData = new FormData();
      formData.append('accesskey', '90336'); // Use your API access key
      formData.append('type', 'submit_review');
      formData.append('product_id', productId || '1');
      formData.append('order_id', orderId || '247');
      formData.append('rating', rating);
      formData.append('review', review.trim());
      formData.append('user_id', '1'); // Get from AsyncStorage or user context

      console.log('Submitting review:', {
        productId,
        orderId,
        rating,
        review: review.trim(),
      });

      // Simulated API call - replace with actual endpoint
      // const response = await axios.post('YOUR_API_ENDPOINT/submit-review.php', formData);

      // Simulate success for now
      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert(
          'Review Submitted',
          'Thank you for your review! Your feedback has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }, 1000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starContainer}
        >
          <Icon
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#FFD700' : '#ddd'}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#EF3340" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.productSection}>
          <Image
            source={productImage || require('../Assets/Images/logo.png')}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {productName || 'Neem & Turmeric Soap'}
            </Text>
            <Text style={styles.orderIdText}>Order ID: {orderId || '247'}</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>
            How would you rate this product?
          </Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
          <Text style={styles.ratingText}>
            {rating === 0 && 'Tap to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </Text>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Write your review</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Enter your review"
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={5}
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || review.trim().length === 0 || isSubmitting) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || review.trim().length === 0 || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>

        {/* Guidelines */}
        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Be honest and helpful in your review{'\n'}• Focus on the product
            quality and experience{'\n'}• Avoid inappropriate language{'\n'}•
            Your review will help other customers
          </Text>
        </View>
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
    backgroundColor: '#EF3340',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  productSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
  },
  orderIdText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  ratingSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starContainer: {
    paddingHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Montserrat',
  },
  reviewSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Montserrat',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    fontFamily: 'Montserrat',
  },
  submitButton: {
    backgroundColor: '#EF3340',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  guidelinesSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Montserrat',
  },
  guidelinesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Montserrat',
  },
});

export default Rating;
