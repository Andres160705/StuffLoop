import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  Modal, 
  Pressable, 
  StyleSheet, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabase';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

/**
 * Círculo de usuario arriba a la derecha del header del catálogo.
 * Al tocarlo abre un menú desplegable con (por ahora) solo "Cerrar sesión";
 * a futuro ahí se pueden colar más opciones (perfil, mis objetos, etc.).
 */
export function UserMenu() {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      // Google guarda la foto en avatar_url; con email se muestra el icono
      setAvatarUrl(user?.user_metadata?.avatar_url ?? null);
    });
  }, []);

  const cerrarSesion = async () => {
    try {
      setCerrando(true);
      await supabase.auth.signOut();
      setAbierto(false);
      // El guard del catálogo también reacciona a onAuthStateChange;
      // este replace hace la vuelta al login inmediata
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    } finally {
      setCerrando(false);
    }
  };

  return (
    <>
      {/* Círculo del usuario */}
      <TouchableOpacity
        style={styles.avatar}
        onPress={() => setAbierto(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Menú de usuario"
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImagen} />
        ) : (
          <Ionicons name="person-outline" size={24} color="#FFF" />
        )}
      </TouchableOpacity>

      {/* Menú desplegable */}
      <Modal
        transparent
        visible={abierto}
        animationType="fade"
        onRequestClose={() => setAbierto(false)}
      >
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)}>
          {/* Tarjeta anclada debajo del círculo; tocar la tarjeta no la cierra */}
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.menu, { top: insets.top + 68 }]}
            onPress={() => {}}
          >
            <TouchableOpacity
              style={styles.item}
              onPress={cerrarSesion}
              disabled={cerrando}
              activeOpacity={0.6}
            >
              {cerrando ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              )}
              <Text style={styles.itemTexto}>Cerrar sesión</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImagen: { width: 48, height: 48 },
  fondo: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.3)' },
  menu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 6,
    minWidth: 190,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  itemTexto: { color: '#DC2626', fontSize: 15, fontFamily: Fonts.semibold },
});
