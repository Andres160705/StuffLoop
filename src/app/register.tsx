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

export default function Register() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [zona, setZona] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre.trim() || !zona.trim() || !email.trim() || !password) {
      return Alert.alert("Campos incompletos", "Llena todos los campos.");
    }
    if (password.length < 6) {
      return Alert.alert(
        "Contraseña débil",
        "Debe tener al menos 6 caracteres.",
      );
    }
    if (password !== confirm) {
      return Alert.alert("Error", "Las contraseñas no coinciden.");
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { nombre: nombre.trim(), zona_barrio: zona.trim() },
      },
    });
    setLoading(false);

    if (error) return Alert.alert("No se pudo registrar", error.message);

    Alert.alert("¡Cuenta creada!", "Ya puedes iniciar sesión.", [
      { text: "OK", onPress: () => router.replace("/login") },
    ]);
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
              <Ionicons name="person-add-outline" size={30} color="#fff" />
            </View>
            <Text style={styles.brand}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a la comunidad de tu barrio
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fields}>
              <AuthField
                icon="person-outline"
                placeholder="Nombre completo"
                autoCapitalize="words"
                value={nombre}
                onChangeText={setNombre}
              />
              <AuthField
                icon="location-outline"
                placeholder="Zona o barrio (ej. Montebello)"
                autoCapitalize="words"
                value={zona}
                onChangeText={setZona}
              />
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
              <AuthField
                icon="lock-closed-outline"
                placeholder="Confirmar contraseña"
                isPassword
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (pressed || loading) && { opacity: 0.85 },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Crear cuenta</Text>
              )}
            </Pressable>
            <GoogleButton />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Link href="/login" style={styles.footerLink}>
              Inicia sesión
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
  header: { alignItems: "center", marginBottom: 24 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 26, fontWeight: "800", color: Colors.text, marginTop: 12 },
  subtitle: { color: Colors.muted, marginTop: 4 },
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
  fields: { gap: 14, marginBottom: 22 },
  button: {
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
