/**
 * BISS BuyScreen - Tageskarten kaufen
 * 
 * Features (Coming Soon):
 * - Tageskarten für Gewässer
 * - Gastkarten
 * - Vereinsmitgliedschaften
 * - Sichere Bezahlung
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ticket, MapPin, Calendar, CreditCard, Search, ChevronRight } from 'lucide-react-native';

// Design Tokens
const COLORS = {
  primary: '#00A3FF',
  accent: '#0066FF',
  green: '#4ADE80',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#111827',
  dark: {
    bg: '#0A1A2F',
    surface: '#132337',
    card: '#1A2D44',
  },
};

// Mock data for popular permits
const POPULAR_PERMITS = [
  {
    id: '1',
    name: 'Elbe-Seitenkanal',
    region: 'Lüneburg',
    price: 15,
    type: 'Tageskarte',
  },
  {
    id: '2',
    name: 'Ilmenau',
    region: 'Uelzen',
    price: 12,
    type: 'Tageskarte',
  },
  {
    id: '3',
    name: 'Schaalseefischerei',
    region: 'Zarrentin',
    price: 20,
    type: 'Tageskarte',
  },
];

export const BuyScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, isDark && styles.textLight]}>
          Kaufen
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Tageskarten & Erlaubnisscheine
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <Search size={20} color={COLORS.gray400} strokeWidth={1.8} />
          <TextInput
            style={[styles.searchInput, isDark && styles.textLight]}
            placeholder="Gewässer suchen..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickAction, isDark && styles.quickActionDark]} activeOpacity={0.8}>
            <View style={[styles.quickIconCircle, { backgroundColor: COLORS.primary + '20' }]}>
              <MapPin size={22} color={COLORS.primary} strokeWidth={1.8} />
            </View>
            <Text style={[styles.quickLabel, isDark && styles.textLight]}>In der Nähe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickAction, isDark && styles.quickActionDark]} activeOpacity={0.8}>
            <View style={[styles.quickIconCircle, { backgroundColor: COLORS.green + '20' }]}>
              <Calendar size={22} color={COLORS.green} strokeWidth={1.8} />
            </View>
            <Text style={[styles.quickLabel, isDark && styles.textLight]}>Heute</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickAction, isDark && styles.quickActionDark]} activeOpacity={0.8}>
            <View style={[styles.quickIconCircle, { backgroundColor: COLORS.accent + '20' }]}>
              <Ticket size={22} color={COLORS.accent} strokeWidth={1.8} />
            </View>
            <Text style={[styles.quickLabel, isDark && styles.textLight]}>Favoriten</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Permits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Beliebte Gewässer
          </Text>

          {POPULAR_PERMITS.map((permit) => (
            <TouchableOpacity 
              key={permit.id}
              style={[styles.permitCard, isDark && styles.permitCardDark]}
              activeOpacity={0.8}
            >
              <View style={styles.permitInfo}>
                <Text style={[styles.permitName, isDark && styles.textLight]}>
                  {permit.name}
                </Text>
                <Text style={[styles.permitRegion, isDark && styles.subtitleDark]}>
                  {permit.region} • {permit.type}
                </Text>
              </View>
              <View style={styles.permitPrice}>
                <Text style={styles.priceValue}>€{permit.price}</Text>
                <ChevronRight size={20} color={COLORS.gray400} strokeWidth={1.8} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Zahlungsmethoden
          </Text>

          <View style={[styles.paymentCard, isDark && styles.paymentCardDark]}>
            <CreditCard size={24} color={COLORS.primary} strokeWidth={1.5} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, isDark && styles.textLight]}>
                Zahlungsmethode hinzufügen
              </Text>
              <Text style={[styles.paymentDesc, isDark && styles.subtitleDark]}>
                Karte, PayPal oder Apple Pay
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.gray400} strokeWidth={1.8} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  containerDark: {
    backgroundColor: COLORS.dark.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  headerDark: {
    backgroundColor: COLORS.dark.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray400,
    marginBottom: 16,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  textLight: {
    color: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchBarDark: {
    backgroundColor: COLORS.dark.bg,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray900,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionDark: {
    backgroundColor: COLORS.dark.card,
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 14,
  },
  permitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permitCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  permitInfo: {
    flex: 1,
  },
  permitName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  permitRegion: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  permitPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  paymentDesc: {
    fontSize: 13,
    color: COLORS.gray400,
  },
});

export default BuyScreen;
