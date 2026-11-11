import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

export type SeccionBarra = 'explorar' | 'intercambio' | 'perfil';

type Destino = '/catalogo' | '/catalogo/intercambio' | '/catalogo/perfil';

const SECCIONES: {
  id: SeccionBarra;
  etiqueta: string;
  icono: keyof typeof Ionicons.glyphMap;
  ruta: Destino;
}[] = [
  { id: 'explorar', etiqueta: 'Explorar', icono: 'compass-outline', ruta: '/catalogo' },
  { id: 'intercambio', etiqueta: 'Intercambio', icono: 'swap-horizontal-outline', ruta: '/catalogo/intercambio' },
  { id: 'perfil', etiqueta: 'Mi perfil', icono: 'person-outline', ruta: '/catalogo/perfil' },
];

/**
 * Barra inferior de las pantallas principales. No es un Tabs de Expo Router:
 * cada pestaña es una pantalla del Stack del catálogo y aquí se cambia con
 * router.replace (sin animación, configurado en catalogo/_layout.tsx).
 * El botón verde del centro abre el formulario de publicar.
 */
export function BarraInferior({ activa }: { activa: SeccionBarra }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const renderItem = (seccion: (typeof SECCIONES)[number]) => {
    const esActiva = seccion.id === activa;
    return (
      <TouchableOpacity
        key={seccion.id}
        style={styles.item}
        onPress={() => !esActiva && router.replace(seccion.ruta)}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: esActiva }}
      >
        <Ionicons
          name={seccion.icono}
          size={24}
          color={esActiva ? Colors.primary : Colors.text}
        />
        <Text style={[styles.etiqueta, esActiva && styles.etiquetaActiva]}>
          {seccion.etiqueta}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {renderItem(SECCIONES[0])}
      {renderItem(SECCIONES[1])}

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push('/catalogo/publicar')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Publicar un objeto"
      >
        <View style={styles.publicar}>
          <Ionicons name="add" size={34} color="#FFF" />
        </View>
        <Text style={styles.etiqueta}>Publicar</Text>
      </TouchableOpacity>

      {renderItem(SECCIONES[2])}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.card,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#1E2A5A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  item: { flex: 1, alignItems: 'center', gap: 2, minHeight: 48, justifyContent: 'flex-end' },
  etiqueta: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.primary },
  etiquetaActiva: { fontFamily: Fonts.bold },
  // El botón de publicar sobresale por encima de la barra
  publicar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: Colors.card,
  },
});
