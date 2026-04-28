/**
 * HelpScreen
 * FAQ + Support Kontakt für BISS
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Github,
  Book,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bug,
  Lightbulb,
  Shield,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'Was ist BISS?',
    answer: 'BISS ist deine Angel-App für Norddeutschland. Wir helfen dir, die besten Angel-Spots zu finden, den perfekten Zeitpunkt zum Angeln zu bestimmen und deine Fänge zu dokumentieren - alles kostenlos!',
    category: 'Allgemein'
  },
  {
    id: '2',
    question: 'Ist BISS wirklich kostenlos?',
    answer: 'Ja! BISS ist und bleibt immer kostenlos. Keine Paywalls, kein Abo, keine versteckten Kosten. Alle Kernfunktionen wie Fangindex, Karten, Fangbuch und Schonzeiten sind für immer kostenlos.',
    category: 'Allgemein'
  },
  {
    id: '3',
    question: 'Was ist der Fangindex?',
    answer: 'Der Fangindex ist unsere Vorhersage, wie gut die Beißbedingungen sind. Er berücksichtigt Wetter, Mondphase, Tageszeit und Solunar-Daten. Ein hoher Score bedeutet gute Beißchancen!',
    category: 'Features'
  },
  {
    id: '4',
    question: 'Wie funktioniert der Offline-Modus?',
    answer: 'Du kannst Kartenbereiche herunterladen, um sie auch ohne Internet zu nutzen. Gehe zu Profil → Offline-Karten und lade deine Region herunter. So funktioniert BISS auch am abgelegenen Gewässer!',
    category: 'Features'
  },
  {
    id: '5',
    question: 'Wie genau sind die Gewässer-Daten?',
    answer: 'Unsere Daten werden von der Community gepflegt und regelmäßig aktualisiert. Wir haben über 56 kuratierte Spots in Norddeutschland mit echten Permit-Preisen und Vorschriften.',
    category: 'Daten'
  },
  {
    id: '6',
    question: 'Kann ich eigene Spots hinzufügen?',
    answer: 'Ja! Du kannst neue Gewässer vorschlagen und bestehende korrigieren. Wir prüfen alle Vorschläge und integrieren sie nach Qualitätssicherung in die App.',
    category: 'Community'
  },
  {
    id: '7',
    question: 'Was passiert mit meinen Daten?',
    answer: 'Deine Daten sind sicher bei uns. Wir speichern nur das Nötigste für die App-Funktionen und geben niemals personenbezogene Daten an Dritte weiter. Details findest du in unserer Datenschutzerklärung.',
    category: 'Datenschutz'
  },
  {
    id: '8',
    question: 'Wie kann ich Bugs melden?',
    answer: 'Am besten über GitHub Issues. Du findest den Link in der App unter "Kontakt". Beschreib das Problem möglichst genau und gib uns Screenshots, wenn möglich.',
    category: 'Support'
  },
  {
    id: '9',
    question: 'Gibt es BISS für Android?',
    answer: 'Aktuell entwickeln wir BISS zuerst für iOS. Eine Android-Version ist geplant, aber noch nicht verfügbar. Folge uns auf GitHub für Updates.',
    category: 'Technisch'
  },
  {
    id: '10',
    question: 'Wie kann ich BISS unterstützen?',
    answer: '1) Nutze die App und gib uns Feedback! 2) Trage neue Spots ein und hilf der Community. 3) Empfiehl Biss anderen Anglern. 4) Star uns auf GitHub, wenn du magst.',
    category: 'Community'
  }
];

const CATEGORIES = ['Allgemein', 'Features', 'Daten', 'Community', 'Datenschutz', 'Support', 'Technisch'];

export const HelpScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isDark } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const insets = useSafeAreaInsets();

  const toggleExpanded = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredFAQ = selectedCategory === 'Alle' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(item => item.category === selectedCategory);

  const handleContact = (type: 'email' | 'github' | 'website') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@biss-app.de?subject=BISS Support Anfrage');
        break;
      case 'github':
        Linking.openURL('https://github.com/chulio115/Biss/issues');
        break;
      case 'website':
        Linking.openURL('https://biss-app.de');
        break;
    }
  };

  const handleBugReport = () => {
    Alert.alert(
      'Bug melden',
      'Wie möchtest du den Bug melden?',
      [
        { text: 'GitHub', onPress: () => handleContact('github') },
        { text: 'E-Mail', onPress: () => handleContact('email') },
        { text: 'Abbrechen', style: 'cancel' }
      ]
    );
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
        <Text style={[styles.title, isDark && styles.titleDark]}>Hilfe & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={[styles.quickActionsCard, isDark && styles.quickActionsCardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.textLight]}>Schnelle Hilfe</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionBtn, isDark && styles.quickActionBtnDark]}
              onPress={handleBugReport}
              activeOpacity={0.7}
            >
              <Bug size={20} color={COLORS.red} strokeWidth={2} />
              <Text style={[styles.quickActionText, isDark && styles.textLight]}>Bug melden</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, isDark && styles.quickActionBtnDark]}
              onPress={() => handleContact('email')}
              activeOpacity={0.7}
            >
              <Mail size={20} color={COLORS.primary} strokeWidth={2} />
              <Text style={[styles.quickActionText, isDark && styles.textLight]}>E-Mail</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, isDark && styles.quickActionBtnDark]}
              onPress={() => handleContact('github')}
              activeOpacity={0.7}
            >
              <Github size={20} color={COLORS.gray700} strokeWidth={2} />
              <Text style={[styles.quickActionText, isDark && styles.textLight]}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={[styles.categoryCard, isDark && styles.categoryCardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.textLight]}>Kategorien</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryList}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'Alle' && styles.categoryChipActive,
                  isDark && styles.categoryChipDark,
                  selectedCategory === 'Alle' && styles.categoryChipActiveDark,
                ]}
                onPress={() => setSelectedCategory('Alle')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === 'Alle' && styles.categoryTextActive,
                  isDark && styles.categoryTextDark,
                ]}>
                  Alle
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                    isDark && styles.categoryChipDark,
                    selectedCategory === category && styles.categoryChipActiveDark,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                    isDark && styles.categoryTextDark,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* FAQ Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Häufige Fragen ({filteredFAQ.length})
          </Text>
          
          {filteredFAQ.map((item) => (
            <View 
              key={item.id} 
              style={[styles.faqCard, isDark && styles.faqCardDark]}
            >
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleExpanded(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqQuestionRow}>
                  <HelpCircle size={20} color={COLORS.primary} strokeWidth={2} />
                  <Text style={[styles.faqQuestion, isDark && styles.textLight]}>
                    {item.question}
                  </Text>
                </View>
                {expandedItems.has(item.id) ? (
                  <ChevronUp size={20} color={COLORS.gray400} strokeWidth={2} />
                ) : (
                  <ChevronDown size={20} color={COLORS.gray400} strokeWidth={2} />
                )}
              </TouchableOpacity>
              
              {expandedItems.has(item.id) && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, isDark && styles.subtitleDark]}>
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={[styles.contactCard, isDark && styles.contactCardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.textLight]}>Kontakt</Text>
          <View style={styles.contactList}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('email')}
              activeOpacity={0.7}
            >
              <Mail size={20} color={COLORS.primary} strokeWidth={2} />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, isDark && styles.textLight]}>
                  E-Mail Support
                </Text>
                <Text style={[styles.contactValue, isDark && styles.subtitleDark]}>
                  support@biss-app.de
                </Text>
              </View>
              <ExternalLink size={16} color={COLORS.gray400} strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('github')}
              activeOpacity={0.7}
            >
              <Github size={20} color={COLORS.gray700} strokeWidth={2} />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, isDark && styles.textLight]}>
                  GitHub Issues
                </Text>
                <Text style={[styles.contactValue, isDark && styles.subtitleDark]}>
                  Bugs & Feature Requests
                </Text>
              </View>
              <ExternalLink size={16} color={COLORS.gray400} strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('website')}
              activeOpacity={0.7}
            >
              <Book size={20} color={COLORS.primary} strokeWidth={2} />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, isDark && styles.textLight]}>
                  Website
                </Text>
                <Text style={[styles.contactValue, isDark && styles.subtitleDark]}>
                  biss-app.de
                </Text>
              </View>
              <ExternalLink size={16} color={COLORS.gray400} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, isDark && styles.tipsCardDark]}>
          <View style={styles.tipsHeader}>
            <Lightbulb size={20} color={COLORS.yellow} strokeWidth={2} />
            <Text style={[styles.tipsTitle, isDark && styles.tipsTitleDark]}>
              Tipps
            </Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={[styles.tipItem, isDark && styles.tipItemDark]}>
              • Halte die App immer aktuell für die besten Daten
            </Text>
            <Text style={[styles.tipItem, isDark && styles.tipItemDark]}>
              • Trage aktiv neue Spots ein und hilf der Community
            </Text>
            <Text style={[styles.tipItem, isDark && styles.tipItemDark]}>
              • Nutze den Offline-Modus für Angel-Trips ohne Empfang
            </Text>
            <Text style={[styles.tipItem, isDark && styles.tipItemDark]}>
              • Dokumentiere deine Fänge für persönliche Statistiken
            </Text>
          </View>
        </View>

        {/* Version Info */}
        <View style={[styles.versionCard, isDark && styles.versionCardDark]}>
          <Text style={[styles.versionText, isDark && styles.subtitleDark]}>
            BISS v1.0.0
          </Text>
          <Text style={[styles.versionSubtext, isDark && styles.subtitleDark]}>
            Made with 🎣 in Norddeutschland
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
  quickActionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionsCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
  },
  quickActionBtnDark: {
    backgroundColor: COLORS.dark.bg,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray900,
    marginTop: 8,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  categoryChipDark: {
    backgroundColor: COLORS.dark.bg,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipActiveDark: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  categoryTextDark: {
    color: COLORS.gray400,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray900,
    marginLeft: 8,
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  contactList: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray900,
  },
  contactValue: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  tipsTitleDark: {
    color: COLORS.white,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 8,
    lineHeight: 20,
  },
  tipItemDark: {
    color: COLORS.gray400,
  },
  versionCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  versionCardDark: {
    backgroundColor: COLORS.dark.card,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  versionSubtext: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 4,
  },
});
