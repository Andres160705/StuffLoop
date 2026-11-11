import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabase';
import { objetosService } from '@/services/objetosService';
import { Objeto } from '@/types/objeto';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { MarcaHeader } from '@/components/MarcaHeader';
import { BarraInferior } from '@/components/BarraInferior';
import { ObjetoImagen } from '@/components/ObjetoImagen';

const ANCHO_MAXIMO = 560;

/** Pestaña "Mi perfil": datos de la cuenta, mis publicaciones y cerrar sesión */
export default function Perfil() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [misObjetos, setMisObjetos] = useState<Objeto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      setNombre(user?.user_metadata?.nombre || user?.user_metadata?.full_name || 'Vecino');
      setEmail(user?.email || '');
      setAvatarUrl(user?.user_metadata?.avatar_url ?? null);

      // Mis publicaciones: el catálogo completo filtrado por dueño
      const todos = await objetosService.obtenerObjetos();
      setMisObjetos(todos.filter((o) => o.usuarioId === user?.id));
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      setCerrando(true);
      await supabase.auth.signOut();
      router.replace('/login');
    } catch {
      Alert.alert('No se pudo cerrar la sesión', 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setCerrando(false);
    }
  };

  const encabezado = (
    <>
      <View style={styles.cuenta}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImagen} />
          ) : (
            <Text style={styles.avatarTexto}>{nombre.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <Text style={styles.nombre}>{nombre}</Text>
        {!!email && <Text style={styles.email}>{email}</Text>}
      </View>

      <Text style={styles.seccionTitulo}>Mis publicaciones</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <MarcaHeader />

      <View style={styles.contenido}>
        <FlatList
          data={cargando ? [] : misObjetos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={encabezado}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fila}
              onPress={() => router.push(`/catalogo/${item.id}`)}
              activeOpacity={0.85}
            >
              <ObjetoImagen uri={item.imagenUrl} style={styles.filaImagen} />
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo} numberOfLines={1}>{item.titulo}</Text>
                <Text style={styles.filaDetalle} numberOfLines={1}>
                  {item.tipo === 'intercambio' ? 'Intercambio' : 'Préstamo'} · {item.categoria}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            cargando ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
            ) : (
              <View style={styles.vacio}>
                <Text style={styles.vacioTexto}>
                  Aún no has publicado nada. Toca el botón + para prestar o intercambiar tu primer objeto.
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.salir}
              onPress={cerrarSesion}
              disabled={cerrando}
              activeOpacity={0.8}
            >
              {cerrando ? (
                <ActivityIndicator color={Colors.error} />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={styles.salirTexto}>Cerrar sesión</Text>
                </>
              )}
            </TouchableOpacity>
          }
        />
      </View>

      <BarraInferior activa="perfil" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contenido: { flex: 1, width: '100%', maxWidth: ANCHO_MAXIMO, alignSelf: 'center' },
  lista: { paddingHorizontal: 16, paddingBottom: 24 },
  cuenta: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImagen: { width: 80, height: 80 },
  avatarTexto: { fontFamily: Fonts.extrabold, fontSize: 32, color: '#FFF' },
  nombre: { fontFamily: Fonts.extrabold, fontSize: 22, color: Colors.text, marginTop: 12 },
  email: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSoft, marginTop: 2 },
  seccionTitulo: {
    fontFamily: Fonts.extrabold,
    fontSize: 20,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  filaImagen: { width: 56, height: 56, borderRadius: 10 },
  filaTextos: { flex: 1 },
  filaTitulo: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.text },
  filaDetalle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSoft, marginTop: 2 },
  spinner: { marginTop: 32 },
  vacio: { backgroundColor: Colors.card, borderRadius: 14, padding: 20 },
  vacioTexto: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, color: Colors.textSoft, textAlign: 'center' },
  salir: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    minHeight: 50,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  salirTexto: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.error },
});
