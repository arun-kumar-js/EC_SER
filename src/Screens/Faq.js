import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const Faq = ({ navigation }) => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqData();
  }, []);

  const parseFaqFromHTML = (htmlString) => {
    try {
      const faqData = [];
      
      // Extract FAQ items using regex patterns
      const questionRegex = /<h3[^>]*>(\d+)\.\s*([^<]+)<\/h3>/g;
      const answerRegex = /<p class="lead">([^<]*)<\/p>/g;
      
      let questionMatch;
      let answerMatch;
      let questionIndex = 0;
      
      // Extract all questions
      const questions = [];
      while ((questionMatch = questionRegex.exec(htmlString)) !== null) {
        questions.push({
          number: parseInt(questionMatch[1]),
          text: questionMatch[2].trim()
        });
      }
      
      // Extract all answers
      const answers = [];
      while ((answerMatch = answerRegex.exec(htmlString)) !== null) {
        answers.push(answerMatch[1].trim());
      }
      
      // Combine questions and answers
      for (let i = 0; i < questions.length; i++) {
        faqData.push({
          id: questions[i].number,
          question: questions[i].text,
          answer: answers[i] || 'No answer available'
        });
      }
      
      return faqData;
    } catch (error) {
      console.error('Error parsing FAQ HTML:', error);
      return [];
    }
  };

  const fetchFaqData = async () => {
    try {
      setLoading(true);
      console.log('Fetching FAQ data...');
      
      const formData = new FormData();
      formData.append('accesskey', '90336');
      formData.append('get_faq', '1');

      const response = await axios.post(
        'https://spiderekart.in/ec_service/pages_web/faq.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('FAQ API Response:', response.data);

      if (response.data && typeof response.data === 'string') {
        // Parse HTML response to extract FAQ data
        const faqData = parseFaqFromHTML(response.data);
        setFaqData(faqData);
        console.log('FAQ data parsed from HTML:', faqData);
      } else {
        console.log('No FAQ data received from API');
        setFaqData([]);
      }
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      setFaqData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderFaqItem = (item, index) => (
    <View key={item.id} style={styles.faqItem}>
      <Text style={styles.questionNumber}>{index + 1}.</Text>
      <View style={styles.questionContent}>
        <Text style={styles.question}>{item.question}</Text>
        <Text style={styles.answer}>{item.answer}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image 
              source={require('../Assets/Images/Arrow.png')} 
              style={styles.backArrow} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e53e3e" />
          <Text style={styles.loadingText}>Loading FAQs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../Assets/Images/Arrow.png')} 
            style={styles.backArrow} 
            resizeMode="contain" 
          />
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

        {faqData.length > 0 ? (
          faqData.map((item, index) => renderFaqItem(item, index))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No FAQs available</Text>
          </View>
        )}
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
    padding: 8,
  },
  backArrow: {
    width: 24,
    height: 24,
    tintColor: '#fff',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontFamily: 'Montserrat-Regular',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
});

export default Faq;


