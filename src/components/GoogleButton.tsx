import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithGoogle } from '@/googleAuth';
import { Colors } from '@/constants/colors';

export default function GoogleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);

      // Toda la lógica de OAuth vive en @/googleAuth
      // (soporta el flujo implícito y PKCE)
      const resultado = await signInWithGoogle();

      if (resultado.exito) {
        // Redirigir directamente al catálogo
        router.replace('/catalogo');
        return;
      }

      // Error conocido del flujo (Supabase/Google): mostrarlo tal cual
      if (!resultado.cancelado && resultado.mensaje) {
        Alert.alert('No se pudo iniciar sesión', resultado.mensaje);
        return;
      }

      // El navegador cerró sin volver a la app. Lo típico: Supabase no tiene
      // la URL de retorno en su lista blanca y mandó el navegador al Site
      // URL (localhost), que el teléfono no puede alcanzar. Mostramos la
      // URL exacta que falta por agregar.
      Alert.alert(
        'El navegador no volvió a la app',
        'Si tú cerraste la ventana, simplemente vuelve a intentar.\n\n' +
          'Si el navegador quedó en un error de conexión ("no se pudo conectar al servidor"), falta agregar la URL de retorno en Supabase → Authentication → URL Configuration → Redirect URLs:\n\n' +
          resultado.redirectUri +
          '\n\nAgrégalas, guarda y vuelve a intentar el login.',
      );
    } catch (err: any) {
      Alert.alert('Error de autenticación', err.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
  container: { width: '100%' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 10, color: '#64748B', fontSize: 13 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  text: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
});
