import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Faq = ({ navigation }) => {
  const faqData = [
    {
      id: 1,
      question: 'At what amount you will provide free delivery',
      answer: 'ITS ABOUT THE LOCATION',
    },
    {
      id: 2,
      question: 'What are your delivery hours?',
      answer: 'We deliver from 9:00 AM to 9:00 PM, 7 days a week.',
    },
    {
      id: 3,
      question: 'How can I track my order?',
      answer: 'You can track your order in the "My Orders" section of the app.',
    },
    {
      id: 4,
      question: 'What payment methods do you accept?',
      answer:
        'We accept cash on delivery, credit/debit cards, and online payment.',
    },
    {
      id: 5,
      question: 'Can I cancel my order?',
      answer:
        'Yes, you can cancel your order before it is prepared for delivery.',
    },
  ];

  const renderFaqItem = (item, index) => (
    <View key={item.id} style={styles.faqItem}>
      <Text style={styles.questionNumber}>{index + 1}.</Text>
      <View style={styles.questionContent}>
        <Text style={styles.question}>{item.question}</Text>
        <Text style={styles.answer}>{item.answer}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Quick answers</Text>
        <Text style={styles.heroSubtitle}>to your queries</Text>
      </View>

      {/* FAQ Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}># FAQs</Text>

        {faqData.map((item, index) => renderFaqItem(item, index))}
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
    backgroundColor: '#e53e3e',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  heroSection: {
    backgroundColor: '#333',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  heroSubtitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    fontFamily: 'Montserrat-Light',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    color: '#ff6b35',
    marginRight: 8,
    marginTop: 2,
  },
  questionContent: {
    flex: 1,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default Faq;


