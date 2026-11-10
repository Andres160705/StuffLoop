import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

// Variables fijas para animaciones (asegúrate de que estén definidas)
const DURATION = 1000;

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      {/* Glow Animation */}
      <Animated.View style={styles.glow}>
        <Image
          style={styles.glow}
          source={require('@/assets/images/logo-glow.png')}
        />
      </Animated.View>

      {/* Background Animation (Se reemplazó <div> por View) */}
      <Animated.View style={styles.background}>
        <View style={styles.expoLogoBackground} />
      </Animated.View>

      {/* Logo Animation */}
      <Animated.View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require('@/assets/images/expo-logo.png')}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
  },
  background: {
    position: 'absolute',
    width: 100,
    height: 100,
  },
  expoLogoBackground: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#00875A',
  },
  imageContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});