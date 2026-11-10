import React from "react";
import { Image } from "expo-image";
import { version } from "expo/package.json";
import { StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="code"
        style={styles.versionText}
      >
        v{version}
      </ThemedText>
      <Image
  source={
    scheme === "dark"
      ? require("@/assets/images/expo-badge-white.png")
      : require("@/assets/images/expo-badge.png")
  }
  style={styles.badgeImage}
  contentFit="contain"
/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  versionText: {
    marginBottom: 8,
    color: "#64748B",
  },
  badgeImage: {
    width: 120,
    height: 30,
    resizeMode: "contain",
  },
});