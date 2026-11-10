import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { objetosService } from '../../services/objetosService';
import { Objeto } from '../../types/objeto';

const CATEGORIAS = ['Todos', 'Herramientas', 'Hogar', 'Deportes', 'Electrónica', 'Libros'];

export default function CatalogoIndex() {
  const router = useRouter();
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarObjetos();
  }, [categoriaSeleccionada, busqueda]);

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

  const renderCard = ({ item }: { item: Objeto }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/catalogo/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imagenUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, item.tipo === 'prestamo' ? styles.badgePrestamo : styles.badgeIntercambio]}>
            {item.tipo ? item.tipo.toUpperCase() : 'GENERAL'}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.cardAuthor}>Por: {item.usuarioNombre}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar objetos..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIAS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                categoriaSeleccionada === item && styles.categoryChipActive
              ]}
              onPress={() => setCategoriaSeleccionada(item)}
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
        <ActivityIndicator size="large" color="#00875A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={objetos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron objetos disponibles.</Text>
          }
        />
      )}

      {/* Botón flotante para publicar */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/catalogo/publicar')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchContainer: { padding: 16, backgroundColor: '#FFF' },
  searchInput: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, fontSize: 16 },
  categoriesContainer: { paddingVertical: 10, paddingLeft: 16, backgroundColor: '#FFF' },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 8 },
  categoryChipActive: { backgroundColor: '#00875A' },
  categoryChipText: { color: '#475569', fontWeight: '500' },
  categoryChipTextActive: { color: '#FFF' },
  listContainer: { padding: 8 },
  card: { flex: 1, margin: 8, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', height: 120, backgroundColor: '#E2E8F0' },
  cardContent: { padding: 10 },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  badge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, color: '#FFF' },
  badgePrestamo: { backgroundColor: '#2563EB' },
  badgeIntercambio: { backgroundColor: '#D97706' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  cardAuthor: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#64748B' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#00875A', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' }
});

