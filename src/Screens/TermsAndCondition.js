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
import axios from 'axios';

const TermsAndCondition = ({ navigation }) => {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTermsData();
  }, []);

  const parseTermsContent = (htmlContent) => {
    if (!htmlContent) return [];
    
    const contentBlocks = [];
    
    // Split by paragraph tags and process each
    const paragraphs = htmlContent.split(/<\/p>\s*<p[^>]*>/);
    
    paragraphs.forEach((paragraph, index) => {
      // Clean up the paragraph content
      let text = paragraph
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(//g, '•')
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();

      if (!text) return;

      // Skip the main title as we'll add it separately
      if (text.includes('Terms and Conditions for EC Service App')) {
        return;
      }

      // Check if this paragraph contains numbered sections
      const numberedSections = text.split(/(\d+\.\s[^0-9]+?)(?=\d+\.\s|$)/);
      
      numberedSections.forEach((section) => {
        const trimmedSection = section.trim();
        if (!trimmedSection) return;

        // Check if it's a numbered section heading
        if (/^\d+\.\s/.test(trimmedSection)) {
          const sectionNumber = trimmedSection.match(/^(\d+)\.\s/)[1];
          const sectionTitle = trimmedSection.replace(/^\d+\.\s/, '');
          
          contentBlocks.push({ 
            type: 'heading', 
            level: 1, 
            text: `${sectionNumber}. ${sectionTitle}`,
            sectionNumber: parseInt(sectionNumber)
          });
        } else if (trimmedSection) {
          // This is content for the previous section
          contentBlocks.push({ type: 'paragraph', text: trimmedSection });
        }
      });
    });

    return contentBlocks;
  };

  const fetchTermsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching terms and conditions data...');
      
      const formData = new FormData();
      formData.append('settings', '1');
      formData.append('accesskey', '90336');
      formData.append('get_terms', '1');

      const response = await axios.post(
        'https://spiderekart.in/ec_service/api-firebase/settings.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Terms API Response:', response.data);

      if (response.data && !response.data.error && response.data.terms) {
        setTermsData(response.data);
        console.log('Terms data set:', response.data);
      } else {
        console.log('No terms data received from API or error:', response.data);
        setTermsData(null);
      }
    } catch (error) {
      console.error('Error fetching terms data:', error);
      setTermsData(null);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e53e3e" />
          <Text style={styles.loadingText}>Loading terms and conditions...</Text>
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {termsData && termsData.terms ? (
          <View>
            <Text style={styles.title}>Terms & Conditions</Text>
            <Text style={styles.lastUpdated}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
            
            <View style={styles.section}>
              {parseTermsContent(termsData.terms).map((block, index) => {
                if (block.type === 'heading') {
                  return (
                    <Text key={index} style={styles.sectionTitle}>
                      {block.text}
                    </Text>
                  );
                } else if (block.type === 'paragraph') {
                  return (
                    <Text key={index} style={styles.sectionText}>
                      {block.text}
                    </Text>
                  );
                }
                return null;
              })}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No terms and conditions available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'left',
    marginBottom: 8,
    marginTop: 0,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'left',
    marginBottom: 24,
    fontStyle: 'normal',
    fontFamily: 'Montserrat-Regular',
  },
  section: {
    marginBottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
    marginTop: 16,
    lineHeight: 22,
    textTransform: 'none',
  },
  sectionText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'left',
    fontFamily: 'Montserrat-Regular',
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#e53e3e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footerText: {
    fontSize: 14,
    color: '#e53e3e',
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
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

export default TermsAndCondition;
