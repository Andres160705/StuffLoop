import React from "react";
import AuthField from "@/components/AuthField";
import GoogleButton from "@/components/GoogleButton";
import { Colors } from "@/constants/colors";
import { supabase } from "@/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert(
        "Campos incompletos",
        "Ingresa tu correo y contraseña.",
      );
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) return Alert.alert("No se pudo iniciar sesión", error.message);

    router.replace("/catalogo");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="repeat" size={34} color="#fff" />
            </View>
            <Text style={styles.brand}>StuffLoop</Text>
            <Text style={styles.subtitle}>
              Presta, intercambia y comparte{"\n"}con tus vecinos
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Iniciar sesión</Text>

            <View style={styles.fields}>
              <AuthField
                icon="mail-outline"
                placeholder="Correo electrónico"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <AuthField
                icon="lock-closed-outline"
                placeholder="Contraseña"
                isPassword
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable style={styles.forgot}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (pressed || loading) && { opacity: 0.85 },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={22} color="#fff" />
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
                </>
              )}
            </Pressable>
            <GoogleButton />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <Link href="/register" style={styles.footerLink}>
              Regístrate
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 28 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 12,
  },
  subtitle: {
    textAlign: "center",
    color: Colors.muted,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 18,
  },
  fields: { gap: 14 },
  forgot: { alignSelf: "flex-end", marginTop: 12, marginBottom: 20 },
  forgotText: { color: Colors.primary, fontWeight: "600", fontSize: 13 },
  button: {
    flexDirection: "row",
    gap: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: Colors.muted },
  footerLink: { color: Colors.primary, fontWeight: "700" },
});
