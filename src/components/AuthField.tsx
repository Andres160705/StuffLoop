import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export default function AuthField({ icon, isPassword, ...rest }: Props) {
  // Inicializamos hidden en true si es contraseña para que comience oculta
  const [hidden, setHidden] = useState<boolean>(!!isPassword);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <TextInput
        {...rest}
        style={styles.input}
        placeholderTextColor={Colors.placeholder}
        secureTextEntry={isPassword ? hidden : false}
        autoCapitalize={
          isPassword || rest.keyboardType === "email-address"
            ? "none"
            : rest.autoCapitalize
        }
      />
      {isPassword && (
        <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={Colors.muted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text,
  },
});