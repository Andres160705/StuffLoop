import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { Colors } from '../../constants/colors';
import { supabase } from '../../supabase';

// Los deep links a /catalogo/[id] cargan primero el índice (para que el
// botón atrás del detalle regrese al catálogo)
export const unstable_settings = {
  anchor: 'index',
};

type EstadoGuard = 'cargando' | 'autorizado' | 'sinSesion';

export default function CatalogoLayout() {
  const [estado, setEstado] = useState<EstadoGuard>('cargando');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEstado(data.session ? 'autorizado' : 'sinSesion');
    });

    // Si la sesión cambia (p. ej. el token se invalida), el guard reacciona
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setEstado(session ? 'autorizado' : 'sinSesion');
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (estado === 'cargando') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Sin sesión: cualquier pantalla del catálogo devuelve al login
  if (estado === 'sinSesion') {
    return <Redirect href="/login" />;
  }

  // El header es propio de cada pantalla (components/CatalogoHeader): se
  // renderiza dentro del flujo del layout y nunca se monta sobre el contenido
  // Explorar, Intercambio y Mi perfil se cambian desde la barra inferior con
  // router.replace: sin animación para que se sientan como pestañas
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="intercambio" options={{ animation: 'none' }} />
      <Stack.Screen name="perfil" options={{ animation: 'none' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
