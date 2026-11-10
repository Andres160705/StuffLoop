import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { objetosService } from '../../services/objetosService';
import { Objeto } from '../../types/objeto';

export default function DetalleObjeto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [objeto, setObjeto] = useState<Objeto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id) {
      cargarDetalle();
    }
  }, [id]);

  const cargarDetalle = async () => {
    try {
      setCargando(true);
      const data = await objetosService.obtenerPorId(id as string);
      setObjeto(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información del objeto.');
      router.back();
    } finally {
      setCargando(false);
    }
  };

  const solicitarObjeto = () => {
    Alert.alert(
      'Solicitud enviada',
      `Le has enviado una solicitud a ${objeto?.usuarioNombre} para este objeto.`
    );
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00875A" />
      </View>
    );
  }

  if (!objeto) return null;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: objeto.imagenUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{objeto.titulo}</Text>
          <Text style={[styles.badge, objeto.tipo === 'prestamo' ? styles.badgePrestamo : styles.badgeIntercambio]}>
            {objeto.tipo ? objeto.tipo.toUpperCase() : 'GENERAL'}
          </Text>
        </View>

        <Text style={styles.category}>Categoría: {objeto.categoria}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{objeto.descripcion}</Text>

        <Text style={styles.sectionTitle}>Condiciones de entrega</Text>
        <Text style={styles.description}>{objeto.condiciones || 'Sin condiciones específicas.'}</Text>

        <View style={styles.divider} />

        <View style={styles.ownerCard}>
          <Text style={styles.ownerTitle}>Publicado por</Text>
          <Text style={styles.ownerName}>{objeto.usuarioNombre}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={solicitarObjeto}>
          <Text style={styles.buttonText}>
            {objeto.tipo === 'prestamo' ? 'Solicitar Préstamo' : 'Proponer Intercambio'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 260, backgroundColor: '#E2E8F0' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', flex: 1 },
  badge: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, color: '#FFF' },
  badgePrestamo: { backgroundColor: '#2563EB' },
  badgeIntercambio: { backgroundColor: '#D97706' },
  category: { fontSize: 14, color: '#64748B', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  description: { fontSize: 14, color: '#475569', lineHeight: 20 },
  ownerCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginVertical: 12 },
  ownerTitle: { fontSize: 12, color: '#64748B' },
  ownerName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  button: { backgroundColor: '#00875A', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
