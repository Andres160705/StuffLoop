export type TipoPublicacion = 'prestamo' | 'intercambio' | 'ambos';
export type EstadoObjeto = 'disponible' | 'prestado' | 'intercambiado';

export interface Objeto {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  tipo: TipoPublicacion;
  estado: EstadoObjeto;
  imagenUrl: string;
  condiciones: string;
  usuarioId: string;
  usuarioNombre: string;
  distanciaKm?: number;
  diasMaxPrestamo?: number | null;
  creadoEn?: string;
  created_at?: string;
}