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

const PrivacyPolicy = ({ navigation }) => {
  const [privacyData, setPrivacyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const parsePrivacyContent = (htmlContent) => {
    if (!htmlContent) return [];
    
    // First, remove all question mark emojis from the entire HTML content
    htmlContent = htmlContent
      .replace(/❓/g, '') // Remove question mark emoji
      .replace(/❓\s*/g, '') // Remove question mark emoji with spaces
      .replace(/\s*❓/g, '') // Remove spaces before question mark emoji
      .replace(/\s*❓\s*/g, '') // Remove spaces around question mark emoji
      .replace(/\[\?\]/g, '') // Remove [?] patterns
      .replace(/\[.*?\]/g, '') // Remove any square bracket content
      .replace(/\?\s*/g, '') // Remove question marks
      .replace(/\s*\?\s*/g, ''); // Remove spaces around question marks
    
    const contentBlocks = [];
    
    // Use a more comprehensive regex to match all HTML tags including strong tags
    const regex = /<(h[2-3]|p|strong)(?:[^>]*)>(.*?)<\/(h[2-3]|p|strong)>/gs;
    let match;

    while ((match = regex.exec(htmlContent)) !== null) {
      const tag = match[1];
      let text = match[2];

      // Clean up HTML entities and unwanted symbols
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n/g, '\n')
        .replace(/\s+/g, ' ')
        .replace(/\[\?\]/g, '') // Remove [?] completely
        .replace(/\[.*?\]/g, '') // Remove any square bracket content
        .replace(/⸻/g, '') // Remove section dividers
        .replace(/\s*\[\s*\?\s*\]\s*/g, '') // Remove [?] patterns completely
        .replace(/❓/g, '') // Remove question mark emoji
        .replace(/❓\s*/g, '') // Remove question mark emoji with spaces
        .replace(/\s*❓/g, '') // Remove spaces before question mark emoji
        .replace(/\s*❓\s*/g, '') // Remove spaces around question mark emoji
        .replace(/\?\s*/g, '') // Remove question marks completely
        .replace(/\s*\?\s*/g, '') // Remove any remaining question marks
        .replace(/\?\s*$/g, '') // Remove trailing question marks
        .replace(/^\s*\?\s*/g, '') // Remove leading question marks
        .replace(//g, '•') // Replace bullet symbol "" with standard bullet "•"
        .replace(/•/g, '• ') // Ensure bullet points have proper spacing
        .replace(/\s*•\s*/g, '• ') // Normalize bullet point spacing
        .trim();

      if (!text) continue;

      // Skip the main title and effective date as we'll add them separately
      if (text.includes('Privacy Policy for EC Service') || 
          text.includes('Effective Date') ||
          text.includes('[10-01-2025]')) {
        continue;
      }

      if (tag.startsWith('h')) {
        const level = parseInt(tag.substring(1));
        
        // Check if it's a numbered section heading (like "1. Information We Collect")
        if (/^\d+\.\s/.test(text)) {
          contentBlocks.push({ 
            type: 'heading', 
            level: level, 
            text: text,
            sectionNumber: parseInt(text.match(/^(\d+)\.\s/)?.[1] || '0')
          });
        } 
        // Check if it's a subsection heading (like "1.1 Personal Information")
        else if (/^\d+\.\d+\s/.test(text)) {
          contentBlocks.push({ 
            type: 'subheading', 
            level: level, 
            text: text 
          });
        }
        // Check if it's descriptive text that should be treated as paragraph
        else if (text.includes('We collect the following types') || 
                 text.includes('We use the collected data') ||
                 text.includes('We do not sell your personal') ||
                 text.includes('We implement robust security') ||
                 text.includes('You have the following rights') ||
                 text.includes('The App may include integration') ||
                 text.includes('We use cookies and similar') ||
                 text.includes('We retain your data only') ||
                 text.includes('The App is not intended') ||
                 text.includes('We may update this Privacy') ||
                 text.includes('If you have any questions')) {
          contentBlocks.push({ type: 'paragraph', text: text });
        }
        // Default to heading for other h3 content
        else {
          contentBlocks.push({ 
            type: 'heading', 
            level: level, 
            text: text 
          });
        }
      } else if (tag === 'p' && text) {
        contentBlocks.push({ type: 'paragraph', text: text });
      }
    }

    return contentBlocks;
  };

  const fetchPrivacyData = async () => {
    try {
      setLoading(true);
      console.log('Fetching privacy policy data...');
      
      const formData = new FormData();
      formData.append('settings', '1');
      formData.append('accesskey', '90336');
      formData.append('get_privacy', '1');

      const response = await axios.post(
        'https://spiderekart.in/ec_service/api-firebase/settings.php',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Privacy API Response:', response.data);

      if (response.data && !response.data.error && response.data.privacy) {
        setPrivacyData(response.data);
        console.log('Privacy data set:', response.data);
      } else {
        console.log('No privacy data received from API or error:', response.data);
        setPrivacyData(null);
      }
    } catch (error) {
      console.error('Error fetching privacy data:', error);
      setPrivacyData(null);
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e53e3e" />
          <Text style={styles.loadingText}>Loading privacy policy...</Text>
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {privacyData && privacyData.privacy ? (
          <View>
            <View style={styles.section}>
              {parsePrivacyContent(privacyData.privacy).map((block, index) => {
                if (block.type === 'heading') {
                  // Different styling for different heading levels
                  const headingStyle = block.level === 2 ? styles.mainHeading : styles.sectionTitle;
                  return (
                    <Text key={index} style={headingStyle}>
                      {block.text}
                    </Text>
                  );
                } else if (block.type === 'subheading') {
                  return (
                    <Text key={index} style={styles.subheading}>
                      {block.text}
                    </Text>
                  );
                } else if (block.type === 'paragraph') {
                  const lines = block.text.split('\n');
                  return (
                    <View key={index}>
                      {lines.map((line, lineIndex) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;
                        
                        // Check if line starts with bullet point (including tab-indented ones)
                        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('\t•') || trimmedLine.match(/^\s*•/)) {
                          return (
                            <Text key={lineIndex} style={styles.bulletPoint}>
                              {trimmedLine.replace(/^\s*/, '')} {/* Remove leading whitespace */}
                            </Text>
                          );
                        }
                        
                        // Check if line contains bullet points anywhere (for mixed content)
                        if (trimmedLine.includes('•')) {
                          return (
                            <Text key={lineIndex} style={styles.bulletPoint}>
                              {trimmedLine}
                            </Text>
                          );
                        }
                        
                        return (
                          <Text key={lineIndex} style={styles.sectionText}>
                            {trimmedLine}
                          </Text>
                        );
                      })}
                    </View>
                  );
                }
                return null;
              })}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No privacy policy available</Text>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'left',
    marginBottom: 8,
    marginTop: 0,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'left',
    marginBottom: 20,
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
  mainHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
    marginTop: 20,
    lineHeight: 24,
    textTransform: 'none',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
    marginTop: 24,
    lineHeight: 26,
    textTransform: 'none',
  },
  subheading: {
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
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'left',
    fontFamily: 'Montserrat-Regular',
    textAlignVertical: 'top',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'left',
    fontFamily: 'Montserrat-Regular',
    paddingLeft: 16,
    marginLeft: 8,
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

export default PrivacyPolicy;
