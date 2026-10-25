import { Colors } from "@/constants/colors";
import { signInWithGoogle } from "@/googleAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function GoogleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);
      const ok = await signInWithGoogle();
      if (ok) router.replace("/home");
    } catch (e: any) {
      Alert.alert(
        "No se pudo iniciar con Google",
        e?.message ?? "Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>o continúa con</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          (pressed || loading) && { opacity: 0.85 },
        ]}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.text}>Continuar con Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.inputBg },
  dividerText: { color: Colors.muted, fontSize: 13 },
  button: {
    flexDirection: "row",
    gap: 10,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.inputBg,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: Colors.text, fontSize: 15, fontWeight: "600" },
});
