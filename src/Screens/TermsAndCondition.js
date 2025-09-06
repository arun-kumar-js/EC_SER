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

const TermsAndCondition = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By accessing and using this mobile application, you accept and agree
            to be bound by the terms and provision of this agreement. If you do
            not agree to abide by the above, please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Services</Text>
          <Text style={styles.sectionText}>
            Our services are intended for personal, non-commercial use. You
            agree to use our services only for lawful purposes and in accordance
            with these Terms.
          </Text>
          <Text style={styles.sectionText}>
            You are responsible for maintaining the confidentiality of your
            account and password and for restricting access to your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Orders and Payment</Text>
          <Text style={styles.sectionText}>
            All orders are subject to availability and confirmation. We reserve
            the right to refuse any order placed through our application.
          </Text>
          <Text style={styles.sectionText}>
            Payment must be made at the time of order placement or upon
            delivery, depending on the payment method selected.
          </Text>
          <Text style={styles.sectionText}>
            Prices are subject to change without notice. All prices include
            applicable taxes unless otherwise stated.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Delivery Policy</Text>
          <Text style={styles.sectionText}>
            We strive to deliver your orders within the estimated time frame.
            However, delivery times may vary based on location, weather
            conditions, and order volume.
          </Text>
          <Text style={styles.sectionText}>
            Free delivery may be available for orders above a certain amount,
            depending on your location.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Cancellation and Refunds</Text>
          <Text style={styles.sectionText}>
            Orders can be cancelled before they are prepared for delivery. Once
            an order is out for delivery, it cannot be cancelled.
          </Text>
          <Text style={styles.sectionText}>
            Refunds will be processed according to our refund policy and may
            take 3-7 business days to reflect in your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
          <Text style={styles.sectionText}>
            We respect your privacy and are committed to protecting your
            personal data. Please review our Privacy Policy to understand how we
            collect, use, and protect your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. User Conduct</Text>
          <Text style={styles.sectionText}>
            You agree not to use our services for any unlawful purpose or to
            solicit others to perform unlawful acts.
          </Text>
          <Text style={styles.sectionText}>
            You agree not to violate any local, state, national, or
            international law in connection with your use of our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            All content, features, and functionality of our application are
            owned by us and are protected by international copyright, trademark,
            and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            We shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages resulting from your use of our
            services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify these terms at any time. Updated
            terms will be posted in the application and will be effective
            immediately upon posting.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have any questions about these Terms and Conditions, please
            contact us through the support section in the application.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using our application, you acknowledge that you have read and
            understood these Terms and Conditions and agree to be bound by them.
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e53e3e',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
    textAlign: 'justify',
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
});

export default TermsAndCondition;


