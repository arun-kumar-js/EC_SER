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

const PrivacyPolicy = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          This Privacy Policy describes how we collect, use, and protect your
          personal information when you use our mobile application. We are
          committed to ensuring that your privacy is protected and your personal
          data is handled securely.
        </Text>

        <Text style={styles.introText}>
          By using our application, you agree to the collection and use of
          information in accordance with this policy. We will not use or share
          your information with anyone except as described in this Privacy
          Policy.
        </Text>

        <Text style={styles.sectionTitle}>WHO WE ARE</Text>
        <Text style={styles.sectionText}>
          We are a food delivery service that connects customers with local
          restaurants and food vendors. Our platform enables users to browse
          menus, place orders, and have food delivered to their preferred
          location.
        </Text>
        <Text style={styles.sectionText}>
          Our mission is to provide convenient, reliable, and efficient food
          delivery services while maintaining the highest standards of data
          privacy and security for our users.
        </Text>

        <Text style={styles.sectionTitle}>INFORMATION WE COLLECT</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.boldText}>Personal Information:</Text> We collect
          information you provide directly to us, such as your name, email
          address, phone number, delivery address, and payment information when
          you create an account or place an order.
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.boldText}>Usage Information:</Text> We
          automatically collect information about how you use our app, including
          your order history, preferences, and interactions with our services.
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.boldText}>Device Information:</Text> We may
          collect information about your mobile device, including device type,
          operating system, and unique device identifiers.
        </Text>

        <Text style={styles.sectionTitle}>HOW WE USE YOUR INFORMATION</Text>
        <Text style={styles.sectionText}>
          We use the information we collect to provide, maintain, and improve
          our services, including processing your orders, facilitating
          deliveries, and providing customer support.
        </Text>
        <Text style={styles.sectionText}>
          We may also use your information to send you promotional materials,
          updates about our services, and important notices about your account
          or orders.
        </Text>
        <Text style={styles.sectionText}>
          Your location information helps us connect you with nearby restaurants
          and provide accurate delivery estimates and tracking.
        </Text>

        <Text style={styles.sectionTitle}>ROLES WE PLAY</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.boldText}>Data Controller:</Text> We act as a data
          controller when we determine the purposes and means of processing your
          personal data for our services.
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.boldText}>Service Provider:</Text> We facilitate
          connections between customers and restaurants, acting as an
          intermediary to process orders and coordinate deliveries.
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.boldText}>Platform Operator:</Text> We operate and
          maintain the technical infrastructure that enables our food delivery
          marketplace to function.
        </Text>

        <Text style={styles.sectionTitle}>INFORMATION SHARING</Text>
        <Text style={styles.sectionText}>
          We share your order information with restaurants and delivery partners
          to fulfill your orders. This includes your contact information and
          delivery address.
        </Text>
        <Text style={styles.sectionText}>
          We may share aggregated, non-personally identifiable information with
          third parties for analytics and business purposes.
        </Text>
        <Text style={styles.sectionText}>
          We do not sell, trade, or rent your personal information to third
          parties for marketing purposes without your explicit consent.
        </Text>

        <Text style={styles.sectionTitle}>DATA SECURITY</Text>
        <Text style={styles.sectionText}>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized access,
          alteration, disclosure, or destruction.
        </Text>
        <Text style={styles.sectionText}>
          Payment information is processed through secure, encrypted channels
          and we do not store complete payment card details on our servers.
        </Text>

        <Text style={styles.sectionTitle}>YOUR RIGHTS</Text>
        <Text style={styles.sectionText}>
          You have the right to access, update, or delete your personal
          information. You can do this through your account settings or by
          contacting our support team.
        </Text>
        <Text style={styles.sectionText}>
          You can opt out of promotional communications at any time by following
          the unsubscribe instructions in our emails or adjusting your
          notification preferences in the app.
        </Text>

        <Text style={styles.sectionTitle}>COOKIES AND TRACKING</Text>
        <Text style={styles.sectionText}>
          Our app may use cookies and similar tracking technologies to enhance
          your experience and collect usage analytics.
        </Text>
        <Text style={styles.sectionText}>
          You can control cookie preferences through your device settings,
          though this may affect some functionality of our services.
        </Text>

        <Text style={styles.sectionTitle}>CHILDREN'S PRIVACY</Text>
        <Text style={styles.sectionText}>
          Our services are not intended for children under 13 years of age. We
          do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>CHANGES TO THIS POLICY</Text>
        <Text style={styles.sectionText}>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy in the app and
          updating the "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>CONTACT US</Text>
        <Text style={styles.sectionText}>
          If you have any questions about this Privacy Policy or our data
          practices, please contact us through the support section in the
          application.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last Updated: {new Date().toLocaleDateString()}
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
  introText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#e53e3e',
    fontFamily: 'Montserrat-Bold',
  },
  footer: {
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    padding: 16,
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default PrivacyPolicy;


