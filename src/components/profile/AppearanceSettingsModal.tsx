import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { X, Moon, Sun, Monitor, Palette } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../constants/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppearanceSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({
  visible,
  onClose,
  currentTheme = 'system',
  onThemeChange,
}) => {
  const { theme, isDark } = useTheme();

  const themes = [
    {
      mode: 'light' as ThemeMode,
      label: 'Hell',
      description: 'Immer heller Modus',
      icon: Sun,
      color: COLORS.yellow,
    },
    {
      mode: 'dark' as ThemeMode,
      label: 'Dunkel',
      description: 'Immer dunkler Modus',
      icon: Moon,
      color: COLORS.primary,
    },
    {
      mode: 'system' as ThemeMode,
      label: 'System',
      description: `Folgt Systemeinstellung (${theme === 'system' ? (isDark ? 'Dunkel' : 'Hell') : theme === 'dark' ? 'Dunkel' : 'Hell'})`,
      icon: Monitor,
      color: COLORS.gray400,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View style={styles.headerLeft}>
            <Palette size={24} color={isDark ? COLORS.white : COLORS.gray600} />
            <Text style={[styles.title, isDark && styles.textLight]}>
              Darstellung
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, isDark && styles.closeBtnDark]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color={isDark ? COLORS.white : COLORS.gray600} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Erscheinungsbild
            </Text>
            <Text style={[styles.sectionDesc, isDark && styles.subtitleDark]}>
              Wähle das Farbschema der App
            </Text>

            {themes.map((theme) => {
              const Icon = theme.icon;
              const isSelected = currentTheme === theme.mode;
              
              return (
                <TouchableOpacity
                  key={theme.mode}
                  style={[
                    styles.themeOption,
                    isDark && styles.themeOptionDark,
                    isSelected && [styles.themeOptionSelected, isDark && styles.themeOptionSelectedDark],
                  ]}
                  onPress={() => onThemeChange(theme.mode)}
                  activeOpacity={0.7}
                >
                  <View style={styles.themeLeft}>
                    <View style={[styles.themeIcon, { backgroundColor: theme.color + '20' }]}>
                      <Icon size={20} color={theme.color} />
                    </View>
                    <View style={styles.themeInfo}>
                      <Text style={[styles.themeLabel, isDark && styles.textLight]}>
                        {theme.label}
                      </Text>
                      <Text style={[styles.themeDesc, isDark && styles.subtitleDark]}>
                        {theme.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkmark, isDark && styles.checkmarkDark]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Preview Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Vorschau
            </Text>
            <View style={[styles.previewCard, isDark && styles.previewCardDark]}>
              <View style={[styles.previewHeader, isDark && styles.previewHeaderDark]}>
                <Text style={[styles.previewTitle, isDark && styles.textLight]}>
                  Beispiel-Karte
                </Text>
                <View style={[styles.previewBadge, isDark && styles.previewBadgeDark]}>
                  <Text style={styles.previewBadgeText}>Neu</Text>
                </View>
              </View>
              <View style={[styles.previewContent, isDark && styles.previewContentDark]}>
                <Text style={[styles.previewText, isDark && styles.previewTextDark]}>
                  Dies ist eine Vorschau wie die App im gewählten Theme aussieht.
                </Text>
                <TouchableOpacity
                  style={[styles.previewButton, isDark && styles.previewButtonDark]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.previewButtonText, isDark && styles.previewButtonTextDark]}>
                    Beispiel-Button
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
              Hinweis
            </Text>
            <Text style={[styles.infoText, isDark && styles.subtitleDark]}>
              Die Theme-Einstellung wird auf alle Bildschirme übernommen, einschließlich Karten, Menüs und Dialoge. 
              Bei "System" folgt die App automatisch der Systemeinstellung deines Geräts.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerDark: {
    borderBottomColor: COLORS.borderDark,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  textLight: {
    color: COLORS.white,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  closeBtnDark: {
    backgroundColor: COLORS.gray800,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 16,
    lineHeight: 20,
  },
  subtitleDark: {
    color: COLORS.gray400,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  themeOptionDark: {
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.gray800,
  },
  themeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  themeOptionSelectedDark: {
    backgroundColor: COLORS.primary + '20',
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  themeDesc: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkDark: {
    backgroundColor: COLORS.primary,
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  previewCardDark: {
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.gray800,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewHeaderDark: {
    borderBottomColor: COLORS.borderDark,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  previewBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeDark: {
    backgroundColor: COLORS.primary,
  },
  previewBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  previewContent: {
    padding: 16,
  },
  previewContentDark: {
    backgroundColor: COLORS.gray800,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  previewTextDark: {
    color: COLORS.gray300,
  },
  previewButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  previewButtonDark: {
    backgroundColor: COLORS.primary,
  },
  previewButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  previewButtonTextDark: {
    color: COLORS.white,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray500,
    lineHeight: 20,
  },
});
