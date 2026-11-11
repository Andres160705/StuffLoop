import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';

interface CatalogoHeaderProps {
  title: string;
  /** Muestra el botón atrás (pantallas de detalle y publicar) */
  mostrarAtras?: boolean;
  /** Elemento a la derecha del título (ej. el menú de usuario) */
  derecha?: React.ReactNode;
}

/**
 * Header propio del catálogo. Se renderiza dentro del flujo normal del
 * layout (View + insets de safe area), así que EMPUJA el contenido hacia
 * abajo: nunca se monta encima como le pasaba al header nativo del Stack.
 */
export function CatalogoHeader({ title, mostrarAtras = false, derecha }: CatalogoHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        {mostrarAtras && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Ionicons name="chevron-back" size={26} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {derecha}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // flex: 1 hace que "derecha" (el avatar) quede pegado al borde derecho
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
    marginRight: 8,
  },
});
