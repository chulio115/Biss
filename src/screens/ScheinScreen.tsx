/**
 * BISS ScheinScreen - Angelschein Verwaltung
 * 
 * Features (Coming Soon):
 * - Digitaler Fischereischein
 * - QR-Code für Kontrollen
 * - Gültigkeitsstatus
 * - Verlängerung
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, QrCode, Clock, Shield } from 'lucide-react-native';

// Design Tokens
const COLORS = {
  primary: '#00A3FF',
  accent: '#0066FF',
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

export const ScheinScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, isDark && styles.textLight]}>
          Mein Schein
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Dein digitaler Angelschein
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder Card */}
        <View style={[styles.scheinCard, isDark && styles.scheinCardDark]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
              <FileText size={32} color={COLORS.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.cardTitleSection}>
              <Text style={[styles.cardTitle, isDark && styles.textLight]}>
                Fischereischein
              </Text>
              <Text style={[styles.cardSubtitle, isDark && styles.subtitleDark]}>
                Noch nicht hinterlegt
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Hinterlege deinen Fischereischein digital, um ihn jederzeit bei Kontrollen vorzeigen zu können.
          </Text>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>Schein hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Preview Cards */}
        <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
          Demnächst verfügbar
        </Text>

        <View style={styles.featureGrid}>
          <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
            <QrCode size={24} color={COLORS.primary} strokeWidth={1.5} />
            <Text style={[styles.featureTitle, isDark && styles.textLight]}>
              QR-Code
            </Text>
            <Text style={[styles.featureDesc, isDark && styles.subtitleDark]}>
              Schnell vorzeigen
            </Text>
          </View>

          <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
            <Clock size={24} color={COLORS.primary} strokeWidth={1.5} />
            <Text style={[styles.featureTitle, isDark && styles.textLight]}>
              Gültigkeit
            </Text>
            <Text style={[styles.featureDesc, isDark && styles.subtitleDark]}>
              Erinnerungen
            </Text>
          </View>

          <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
            <Shield size={24} color={COLORS.primary} strokeWidth={1.5} />
            <Text style={[styles.featureTitle, isDark && styles.textLight]}>
              Verifiziert
            </Text>
            <Text style={[styles.featureDesc, isDark && styles.subtitleDark]}>
              Offiziell bestätigt
            </Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray400,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  textLight: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  scheinCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
  },
  scheinCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitleSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.gray600,
    lineHeight: 22,
    marginBottom: 20,
  },
  infoTextDark: {
    color: COLORS.gray400,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
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
  featureCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginTop: 12,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'center',
  },
});

export default ScheinScreen;
