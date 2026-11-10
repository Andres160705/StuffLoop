import React from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import { Colors } from "@/constants/colors";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "link"
    | "linkPrimary"
    | "code";
  themeColor?: keyof typeof Colors;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const color = themeColor ? Colors[themeColor] : Colors.text;

  return (
    <Text
      style={[{ color }, styles[type], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 24, fontWeight: "bold", lineHeight: 32 },
  small: { fontSize: 14, lineHeight: 20 },
  smallBold: { fontSize: 14, fontWeight: "bold", lineHeight: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", lineHeight: 24 },
  link: { fontSize: 16, color: "#0a7ea4" },
  linkPrimary: { fontSize: 16, color: Colors.primary, fontWeight: "bold" },
  code: { fontSize: 14, fontFamily: "SpaceMono" },
});