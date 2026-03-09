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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onZoomIn();
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.btnText, isDark && styles.btnTextDark]}>+</Text>
      </TouchableOpacity>
      <View style={[styles.divider, isDark && styles.dividerDark]} />
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onZoomOut();
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.btnText, isDark && styles.btnTextDark]}>−</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 14,
    bottom: 110,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  containerDark: {
    backgroundColor: 'rgba(10,26,47,0.92)',
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0.4,
  },
  btn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  btnText: { fontSize: 22, fontWeight: '400', color: BTN_DARK },
  btnTextDark: { color: COLORS.white },
});
