import { supabase } from '../supabase';
import { Objeto } from '../types/objeto';

export const objetosService = {
  async obtenerObjetos(categoria?: string, busqueda?: string): Promise<Objeto[]> {
    let query = supabase.from('objetos').select('*');

    if (categoria && categoria !== 'Todos') {
      query = query.eq('categoria', categoria);
    }

    if (busqueda && busqueda.trim() !== '') {
      query = query.ilike('titulo', `%${busqueda.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener objetos:', error);
      throw error;
    }

    const objetosFormateados = (data || []).map((item: any) => ({
      ...item,
      imagenUrl: item.imagenUrl || item.imagen_url || 'https://via.placeholder.com/150',
      usuarioNombre: item.usuarioNombre || item.usuario_nombre || 'Vecino',
      usuarioId: item.usuarioId || item.usuario_id || '',
    }));

    return objetosFormateados as Objeto[];
  },

  async obtenerPorId(id: string): Promise<Objeto | null> {
    const { data, error } = await supabase
      .from('objetos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error al obtener objeto ${id}:`, error);
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      imagenUrl: data.imagenUrl || data.imagen_url || 'https://via.placeholder.com/150',
      usuarioNombre: data.usuarioNombre || data.usuario_nombre || 'Vecino',
      usuarioId: data.usuarioId || data.usuario_id || '',
    } as Objeto;
  },

  async crearObjeto(nuevoObjeto: Omit<Objeto, 'id' | 'creadoEn' | 'created_at'>): Promise<Objeto> {
    const { data: { user } } = await supabase.auth.getUser();

    const usuarioIdFinal = user?.id || nuevoObjeto.usuarioId || 'user_anonimo';
    const usuarioNombreFinal = user?.user_metadata?.full_name || user?.email || nuevoObjeto.usuarioNombre || 'Vecino';

    const payload = {
      titulo: nuevoObjeto.titulo,
      descripcion: nuevoObjeto.descripcion,
      categoria: nuevoObjeto.categoria,
      tipo: nuevoObjeto.tipo,
      estado: nuevoObjeto.estado || 'disponible',
      condiciones: nuevoObjeto.condiciones,
      imagen_url: nuevoObjeto.imagenUrl,
      usuario_id: usuarioIdFinal,
      usuario_nombre: usuarioNombreFinal,
      imagenUrl: nuevoObjeto.imagenUrl,
      usuarioId: usuarioIdFinal,
      usuarioNombre: usuarioNombreFinal,
    };

    const { data, error } = await supabase
      .from('objetos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error al crear objeto:', error);
      throw error;
    }

    return data as Objeto;
  }
};

export default objetosService;