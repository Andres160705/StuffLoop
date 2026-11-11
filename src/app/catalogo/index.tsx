import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { objetosService } from '../../services/objetosService';
import { Objeto } from '../../types/objeto';
import { Colors } from '../../constants/colors';
import { CATEGORIAS_FILTRO } from '../../constants/categorias';
import { CatalogoHeader } from '@/components/CatalogoHeader';
import { UserMenu } from '@/components/UserMenu';
import { ObjetoImagen } from '@/components/ObjetoImagen';

// En pantallas grandes (tablet/web) el contenido se centra en una columna tipo móvil
const ANCHO_MAXIMO = 720;

export default function CatalogoIndex() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // "actualizar" cambia cuando se publica un objeto y se quiere refrescar la lista
  const { actualizar } = useLocalSearchParams<{ actualizar?: string }>();

  useEffect(() => {
    // Debounce: espera 400ms tras el último cambio antes de consultar Supabase
    const temporizador = setTimeout(() => {
      cargarObjetos();
    }, 400);

    return () => clearTimeout(temporizador);
  }, [categoriaSeleccionada, busqueda, actualizar]);

  const cargarObjetos = async () => {
    try {
      setCargando(true);
      const data = await objetosService.obtenerObjetos(categoriaSeleccionada, busqueda);
      setObjetos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // El número de columnas se adapta al ancho de pantalla
  const numColumnas = width >= 1024 ? 4 : width >= 768 ? 3 : 2;
  // La imagen de cada tarjeta escala con su columna (más margen para respirar)
  const anchoColumna = (Math.min(width, ANCHO_MAXIMO) - 32) / numColumnas;
  const altoImagen = Math.round(anchoColumna * 0.7);

  const renderCard = ({ item }: { item: Objeto }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/catalogo/${item.id}`)}
      activeOpacity={0.8}
    >
      <ObjetoImagen 
        uri={item.imagenUrl} 
        style={[styles.cardImage, { height: altoImagen }]} 
      />
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, item.tipo === 'prestamo' ? styles.badgePrestamo : styles.badgeIntercambio]}>
            {item.tipo ? item.tipo.toUpperCase() : 'GENERAL'}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>Por: {item.usuarioNombre}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header propio: empuja el contenido, no se superpone */}
      <CatalogoHeader title="Catálogo" derecha={<UserMenu />} />
      <View style={styles.contenido}>
        {/* Buscador */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar objetos..."
              placeholderTextColor="#94A3B8"
              value={busqueda}
              onChangeText={setBusqueda}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Categorías */}
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIAS_FILTRO}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  categoriaSeleccionada === item && styles.categoryChipActive
                ]}
                onPress={() => setCategoriaSeleccionada(item)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryChipText,
                  categoriaSeleccionada === item && styles.categoryChipTextActive
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Lista de Objetos */}
        {cargando ? (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            key={numColumnas}
            data={objetos}
            keyExtractor={(item) => item.id}
            numColumns={numColumnas}
            renderItem={renderCard}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No se encontraron objetos disponibles.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Botón flotante para publicar (respeta la barra de gestos del dispositivo) */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: 20 + insets.bottom }]}
        onPress={() => router.push('/catalogo/publicar')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  // Columna centrada con ancho máximo: en móvil ocupa todo el ancho
  contenido: { flex: 1, width: '100%', maxWidth: ANCHO_MAXIMO, alignSelf: 'center' },
  searchContainer: { padding: 16, backgroundColor: '#FFF' },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F1F5F9', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    minHeight: 48 
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1E293B', paddingVertical: 0 },
  categoriesContainer: { paddingVertical: 10, paddingLeft: 16, backgroundColor: '#FFF' },
  categoryChip: { 
    paddingHorizontal: 16, 
    minHeight: 38, 
    justifyContent: 'center', 
    borderRadius: 19, 
    backgroundColor: '#E2E8F0', 
    marginRight: 8 
  },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryChipText: { color: '#475569', fontWeight: '500', fontSize: 13 },
  categoryChipTextActive: { color: '#FFF' },
  spinnerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // padding extra abajo para que el FAB no tape las últimas tarjetas
  listContainer: { padding: 8, paddingBottom: 96 },
  card: { flex: 1, margin: 8, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', backgroundColor: '#E2E8F0' },
  cardContent: { padding: 10 },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  badge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, color: '#FFF', overflow: 'hidden' },
  badgePrestamo: { backgroundColor: Colors.badgePrestamo },
  badgeIntercambio: { backgroundColor: Colors.badgeIntercambio },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  cardAuthor: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyWrap: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', fontSize: 15 },
  fab: { 
    position: 'absolute', 
    right: 20, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
