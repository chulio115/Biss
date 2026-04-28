/**
 * PrivacyScreen
 * Datenschutz Informationen für BISS
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Mail,
  User,
  Lock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Cookie,
  Smartphone,
} from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

export const PrivacyScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.backBtn, isDark && styles.backBtnDark]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={isDark ? COLORS.white : COLORS.gray600} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.titleDark]}>Datenschutz</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Promise */}
        <View style={[styles.promiseCard, isDark && styles.promiseCardDark]}>
          <View style={styles.promiseHeader}>
            <Shield size={24} color={COLORS.green} strokeWidth={2} />
            <Text style={[styles.promiseTitle, isDark && styles.textLight]}>
              Unser Datenschutz-Versprechen
            </Text>
          </View>
          <Text style={[styles.promiseText, isDark && styles.subtitleDark]}>
            Deine Privatsphäre ist uns wichtig. BISS wurde von Anglern für Angler entwickelt - wir wissen genau, was wichtig ist: Vertrauen und Transparenz.
          </Text>
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Welche Daten sammeln wir?
            </Text>
          </View>
          
          <View style={styles.dataList}>
            <View style={[styles.dataItem, isDark && styles.dataItemDark]}>
              <View style={styles.dataHeader}>
                <User size={16} color={COLORS.primary} strokeWidth={2} />
                <Text style={[styles.dataTitle, isDark && styles.textLight]}>
                  Account-Daten
                </Text>
              </View>
              <Text style={[styles.dataDesc, isDark && styles.subtitleDark]}>
                E-Mail-Adresse (für Login), Profil-Name (freiwillig), Bio (freiwillig)
              </Text>
            </View>

            <View style={[styles.dataItem, isDark && styles.dataItemDark]}>
              <View style={styles.dataHeader}>
                <FileText size={16} color={COLORS.primary} strokeWidth={2} />
                <Text style={[styles.dataTitle, isDark && styles.textLight]}>
                  Fang-Daten
                </Text>
              </View>
              <Text style={[styles.dataDesc, isDark && styles.subtitleDark]}>
                Deine Fänge, Fotos, Bewertungen, Favoriten - alles nur für dich sichtbar
              </Text>
            </View>

            <View style={[styles.dataItem, isDark && styles.dataItemDark]}>
              <View style={styles.dataHeader}>
                <Smartphone size={16} color={COLORS.primary} strokeWidth={2} />
                <Text style={[styles.dataTitle, isDark && styles.textLight]}>
                  App-Nutzung
                </Text>
              </View>
              <Text style={[styles.dataDesc, isDark && styles.subtitleDark]}>
                  App-Version, Geräte-Typ, Standort (nur wenn du es erlaubst)
              </Text>
            </View>

            <View style={[styles.dataItem, isDark && styles.dataItemDark]}>
              <View style={styles.dataHeader}>
                <Cookie size={16} color={COLORS.primary} strokeWidth={2} />
                <Text style={[styles.dataTitle, isDark && styles.textLight]}>
                  Lokale Daten
                </Text>
              </View>
              <Text style={[styles.dataDesc, isDark && styles.subtitleDark]}>
                Offline-Karten, Cache, Einstellungen - alles nur auf deinem Gerät
              </Text>
            </View>
          </View>
        </View>

        {/* What We DON'T Collect */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={20} color={COLORS.green} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Was wir NICHT sammeln
            </Text>
          </View>
          
          <View style={styles.dontList}>
            <View style={styles.dontItem}>
              <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
              <Text style={[styles.dontText, isDark && styles.textLight]}>
                Keine persönlichen Identifikationsnummern
              </Text>
            </View>
            <View style={styles.dontItem}>
              <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
              <Text style={[styles.dontText, isDark && styles.textLight]}>
                Keine Finanzdaten oder Kreditkarten
              </Text>
            </View>
            <View style={styles.dontItem}>
              <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
              <Text style={[styles.dontText, isDark && styles.textLight]}>
                Keine genauen Standort-Histories
              </Text>
            </View>
            <View style={styles.dontItem}>
              <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
              <Text style={[styles.dontText, isDark && styles.textLight]}>
                Keine Kontakte oder Social Media Daten
              </Text>
            </View>
            <View style={styles.dontItem}>
              <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
              <Text style={[styles.dontText, isDark && styles.textLight]}>
                Keine Werbung oder Tracking von Drittanbietern
              </Text>
            </View>
          </View>
        </View>

        {/* Data Usage */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Wie nutzen wir deine Daten?
            </Text>
          </View>
          
          <View style={styles.usageList}>
            <View style={[styles.usageItem, isDark && styles.usageItemDark]}>
              <Text style={[styles.usageTitle, isDark && styles.textLight]}>
                🎣 Kernfunktionen
              </Text>
              <Text style={[styles.usageDesc, isDark && styles.subtitleDark]}>
                Fangindex, Wetter, Karten, Fangbuch - alles funktioniert nur mit deinen Daten
              </Text>
            </View>

            <View style={[styles.usageItem, isDark && styles.usageItemDark]}>
              <Text style={[styles.usageTitle, isDark && styles.textLight]}>
                📊 Personalisierung
              </Text>
              <Text style={[styles.usageDesc, isDark && styles.subtitleDark]}>
                Individuelle Fang-Statistiken, Lieblingsspots, persönliche Empfehlungen
              </Text>
            </View>

            <View style={[styles.usageItem, isDark && styles.usageItemDark]}>
              <Text style={[styles.usageTitle, isDark && styles.textLight]}>
                🔧 App-Verbesserung
              </Text>
              <Text style={[styles.usageDesc, isDark && styles.subtitleDark]}>
                Anonyme Nutzungsstatistiken, Crash-Reports, Performance-Daten
              </Text>
            </View>
          </View>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Wie schützen wir deine Daten?
            </Text>
          </View>
          
          <View style={styles.securityList}>
            <View style={[styles.securityItem, isDark && styles.securityItemDark]}>
              <View style={styles.securityHeader}>
                <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
                <Text style={[styles.securityTitle, isDark && styles.textLight]}>
                  Verschlüsselte Übertragung
                </Text>
              </View>
              <Text style={[styles.securityDesc, isDark && styles.subtitleDark]}>
                Alle Daten werden mit HTTPS/TLS verschlüsselt übertragen
              </Text>
            </View>

            <View style={[styles.securityItem, isDark && styles.securityItemDark]}>
              <View style={styles.securityHeader}>
                <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
                <Text style={[styles.securityTitle, isDark && styles.textLight]}>
                  Sichere Server
                </Text>
              </View>
              <Text style={[styles.securityDesc, isDark && styles.subtitleDark]}>
                Supabase in Frankfurt (EU) - DSGVO-konform und zertifiziert
              </Text>
            </View>

            <View style={[styles.securityItem, isDark && styles.securityItemDark]}>
              <View style={styles.securityHeader}>
                <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
                <Text style={[styles.securityTitle, isDark && styles.textLight]}>
                  Row Level Security
                </Text>
              </View>
              <Text style={[styles.securityDesc, isDark && styles.subtitleDark]}>
                Du siehst nur deine eigenen Daten - niemand sonst kann darauf zugreifen
              </Text>
            </View>

            <View style={[styles.securityItem, isDark && styles.securityItemDark]}>
              <View style={styles.securityHeader}>
                <CheckCircle size={16} color={COLORS.green} strokeWidth={2} />
                <Text style={[styles.securityTitle, isDark && styles.textLight]}>
                  Keine Datenweitergabe
                </Text>
              </View>
              <Text style={[styles.securityDesc, isDark && styles.subtitleDark]}>
                Wir verkaufen deine Daten niemals an Dritte
              </Text>
            </View>
          </View>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Deine Rechte
            </Text>
          </View>
          
          <View style={styles.rightsList}>
            <View style={[styles.rightItem, isDark && styles.rightItemDark]}>
              <Text style={[styles.rightTitle, isDark && styles.textLight]}>
                📋 Auskunft
              </Text>
              <Text style={[styles.rightDesc, isDark && styles.subtitleDark]}>
                Du kannst jederzeit erfahren, welche Daten wir von dir speichern
              </Text>
            </View>

            <View style={[styles.rightItem, isDark && styles.rightItemDark]}>
              <Text style={[styles.rightTitle, isDark && styles.textLight]}>
                ✏️ Korrektur
              </Text>
              <Text style={[styles.rightDesc, isDark && styles.subtitleDark]}>
                Falsche Daten kannst du jederzeit korrigieren oder löschen
              </Text>
            </View>

            <View style={[styles.rightItem, isDark && styles.rightItemDark]}>
              <Text style={[styles.rightTitle, isDark && styles.textLight]}>
                🗑️ Löschung
              </Text>
              <Text style={[styles.rightDesc, isDark && styles.subtitleDark]}>
                Du kannst deinen Account und alle Daten jederzeit löschen
              </Text>
            </View>

            <View style={[styles.rightItem, isDark && styles.rightItemDark]}>
              <Text style={[styles.rightTitle, isDark && styles.textLight]}>
                📤 Export
              </Text>
              <Text style={[styles.rightDesc, isDark && styles.subtitleDark]}>
                Du kannst deine Daten als JSON exportieren und mitnehmen
              </Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={[styles.contactCard, isDark && styles.contactCardDark]}>
          <View style={styles.contactHeader}>
            <Mail size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={[styles.contactTitle, isDark && styles.textLight]}>
              Datenschutz-Anfragen
            </Text>
          </View>
          <Text style={[styles.contactDesc, isDark && styles.subtitleDark]}>
            Bei Fragen zum Datenschutz oder zur Ausübung deiner Rechte kontaktiere uns:
          </Text>
          <TouchableOpacity
            style={[styles.contactBtn, isDark && styles.contactBtnDark]}
            onPress={() => handleLink('mailto:privacy@biss-app.de')}
            activeOpacity={0.7}
          >
            <Mail size={16} color={COLORS.white} strokeWidth={2} />
            <Text style={[styles.title, isDark && styles.titleDark]}>Datenschutz</Text>
            <Text style={styles.contactBtnText}>privacy@biss-app.de</Text>
            <ExternalLink size={16} color={COLORS.white} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={[styles.legalCard, isDark && styles.legalCardDark]}>
          <Text style={[styles.legalTitle, isDark && styles.legalTitleDark]}>
            Rechtliche Dokumente
          </Text>
          <View style={styles.legalList}>
            <TouchableOpacity
              style={[styles.legalLink, isDark && styles.legalLinkDark]}
              onPress={() => handleLink('https://biss-app.de/privacy')}
              activeOpacity={0.7}
            >
              <Text style={[styles.legalText, isDark && styles.legalTextDark]}>
                Datenschutzerklärung
              </Text>
              <ExternalLink size={16} color={COLORS.primary} strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.legalLink, isDark && styles.legalLinkDark]}
              onPress={() => handleLink('https://biss-app.de/terms')}
              activeOpacity={0.7}
            >
              <Text style={[styles.legalText, isDark && styles.legalTextDark]}>
                Nutzungsbedingungen
              </Text>
              <ExternalLink size={16} color={COLORS.primary} strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.legalLink, isDark && styles.legalLinkDark]}
              onPress={() => handleLink('https://biss-app.de/imprint')}
              activeOpacity={0.7}
            >
              <Text style={[styles.legalText, isDark && styles.legalTextDark]}>
                Impressum
              </Text>
              <ExternalLink size={16} color={COLORS.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footerCard, isDark && styles.footerCardDark]}>
          <View style={styles.footerHeader}>
            <AlertCircle size={16} color={COLORS.yellow} strokeWidth={2} />
            <Text style={[styles.footerTitle, isDark && styles.textLight]}>
              Letzte Aktualisierung
            </Text>
          </View>
          <Text style={[styles.footerText, isDark && styles.subtitleDark]}>
            10.03.2026
          </Text>
          <Text style={[styles.footerSubtext, isDark && styles.subtitleDark]}>
            Diese Datenschutzerklärung kann aktualisiert werden. Änderungen werden in der App bekannt gegeben.
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerDark: {
    backgroundColor: COLORS.dark.surface,
    borderBottomColor: COLORS.dark.card,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDark: {
    backgroundColor: COLORS.dark.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  titleDark: {
    color: COLORS.white,
  },
  textLight: {
    color: COLORS.white,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  promiseCard: {
    backgroundColor: COLORS.green + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  promiseCardDark: {
    backgroundColor: COLORS.green + '20',
  },
  promiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promiseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  promiseTitleDark: {
    color: COLORS.white,
  },
  promiseText: {
    fontSize: 15,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  dataList: {
    gap: 12,
  },
  dataItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dataItemDark: {
    backgroundColor: COLORS.dark.card,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  dataDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  dontList: {
    gap: 12,
  },
  dontItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dontText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray900,
    marginLeft: 8,
    flex: 1,
  },
  usageList: {
    gap: 12,
  },
  usageItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  usageItemDark: {
    backgroundColor: COLORS.dark.card,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  usageDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  securityList: {
    gap: 12,
  },
  securityItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  securityItemDark: {
    backgroundColor: COLORS.dark.card,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  securityDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  rightsList: {
    gap: 12,
  },
  rightItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rightItemDark: {
    backgroundColor: COLORS.dark.card,
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  rightDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  contactDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 16,
    lineHeight: 20,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.white,
  },
  contactBtnDark: {
    backgroundColor: COLORS.primary,
  },
  legalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  legalCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 12,
  },
  legalTitleDark: {
    color: COLORS.white,
  },
  legalList: {
    gap: 12,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
  },
  legalLinkDark: {
    backgroundColor: COLORS.dark.bg,
  },
  legalText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray900,
  },
  legalTextDark: {
    color: COLORS.white,
  },
  footerCard: {
    backgroundColor: COLORS.yellow + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.yellow,
  },
  footerCardDark: {
    backgroundColor: COLORS.yellow + '20',
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
  },
});
