import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export default function AuthField({ icon, isPassword, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <TextInput
        {...rest}
        style={styles.input}
        placeholderTextColor={Colors.placeholder}
        secureTextEntry={hidden}
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
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
});
