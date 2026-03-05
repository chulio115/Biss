/**
 * MapZoomControls - Zoom +/- Buttons
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';

const BTN_LIGHT = '#FFFFFF';
const BTN_DARK = '#0A1A2F';

interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const MapZoomControls: React.FC<MapZoomControlsProps> = ({ onZoomIn, onZoomOut }) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, isDark && styles.btnDark]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onZoomIn();
        }}
      >
        <Text style={[styles.btnText, isDark && styles.btnTextDark]}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, isDark && styles.btnDark]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onZoomOut();
        }}
      >
        <Text style={[styles.btnText, isDark && styles.btnTextDark]}>−</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 110,
    gap: 12,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BTN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDark: {
    backgroundColor: BTN_DARK,
    shadowOpacity: 0.3,
  },
  btnText: { fontSize: 24, fontWeight: '300', color: BTN_DARK },
  btnTextDark: { color: COLORS.white },
});
