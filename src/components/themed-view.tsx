import React from "react";
import { View, type ViewProps } from "react-native";
import { Colors } from "@/constants/colors";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: keyof typeof Colors;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = type ? Colors[type] : (lightColor || Colors.background);

  return (
    <View
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}