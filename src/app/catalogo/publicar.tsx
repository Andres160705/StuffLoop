import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { objetosService } from '../../services/objetosService';
import { TipoPublicacion } from '../../types/objeto';

export default function PublicarObjeto() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Herramientas');
  const [tipo, setTipo] = useState<TipoPublicacion>('prestamo');
  const [condiciones, setCondiciones] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!titulo || !descripcion || !imagenUrl) {
      Alert.alert('Campos requeridos', 'Por favor completa el título, descripción e imagen.');
      return;
    }

    try {
      setGuardando(true);
      await objetosService.crearObjeto({
        titulo,
        descripcion,
        categoria,
        tipo,
        condiciones,
        imagenUrl,
        estado: 'disponible',
        usuarioId: 'user_temp_id',
        usuarioNombre: 'Usuario Actual'
      });
      Alert.alert('Éxito', 'Objeto publicado correctamente.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo publicar el objeto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Título del Objeto</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ej. Taladro Inalámbrico" />

      <Text style={styles.label}>Modalidad</Text>
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.typeBtn, tipo === 'prestamo' && styles.typeBtnActive]} 
          onPress={() => setTipo('prestamo')}
        >
          <Text style={tipo === 'prestamo' ? styles.typeTextActive : styles.typeText}>Préstamo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, tipo === 'intercambio' && styles.typeBtnActive]} 
          onPress={() => setTipo('intercambio')}
        >
          <Text style={tipo === 'intercambio' ? styles.typeTextActive : styles.typeText}>Intercambio</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>URL de la Imagen</Text>
      <TextInput style={styles.input} value={imagenUrl} onChangeText={setImagenUrl} placeholder="https://..." />

      <Text style={styles.label}>Descripción</Text>
      <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} />

      <Text style={styles.label}>Condiciones (opcional)</Text>
      <TextInput style={styles.input} value={condiciones} onChangeText={setCondiciones} placeholder="Ej. Devuelvo en máximo 3 días" />

      <TouchableOpacity style={styles.submitBtn} onPress={guardar} disabled={guardando}>
        {guardando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Publicar Objeto</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#00875A', borderColor: '#00875A' },
  typeText: { color: '#64748B', fontWeight: 'bold' },
  typeTextActive: { color: '#FFF', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#00875A', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

