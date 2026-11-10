import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/supabase';
import { useRouter } from 'expo-router';

// Completa la sesión del navegador emergente en móvil si estaba pendiente
WebBrowser.maybeCompleteAuthSession();

export default function GoogleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);

      // Genera automáticamente 'exp://...' si estás en Expo Go
      // o 'stuffloop://...' si estás probando una build nativa/APK
      const redirectUrl = makeRedirectUri({
        scheme: 'stuffloop',
      });

      // 1. Iniciar el flujo de OAuth con Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Importante en móvil para controlarlo manualmente
        },
      });

      if (error) throw error;

      // 2. Abrir el navegador del celular (WebBrowser) para autenticar con Google
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        // 3. Al volver del navegador del celular, extraer los tokens de la URL
        if (result.type === 'success' && result.url) {
          const paramsString = result.url.split('#')[1] || result.url.split('?')[1];
          
          if (paramsString) {
            const urlParams = new URLSearchParams(paramsString);
            const accessToken = urlParams.get('access_token');
            const refreshToken = urlParams.get('refresh_token');

            if (accessToken && refreshToken) {
              // 4. Guardar la sesión en Supabase
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) throw sessionError;

              // Redirigir directamente al catálogo
              router.replace('/catalogo');
            }
          }
        }
      }
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
          <ActivityIndicator color="#00875A" />
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
