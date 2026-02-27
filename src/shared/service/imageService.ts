import { supabase } from "../../config/supabase/supabase";

const BUCKET_NAME = 'family_pictures';

export async function uploadImageByTree(treeId: string, file: File): Promise<string> {
  if (!treeId) throw new Error('El treeId es requerido');
  if (!file) throw new Error('El archivo es requerido');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${treeId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  if (!data?.publicUrl) throw new Error('No se pudo obtener la URL pública');

  return data.publicUrl;
}


export async function getImagesByTree(treeId: string): Promise<string[]> {
  if (!treeId) throw new Error('El treeId es requerido');

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(treeId, { sortBy: { column: 'created_at', order: 'desc' } });

  if (error) throw new Error(`Error al obtener imágenes: ${error.message}`);
  if (!data || data.length === 0) return [];

  return data.map((file) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${treeId}/${file.name}`);
    return urlData.publicUrl;
  });
}


export async function deleteImageFromTree(treeId: string, fileName: string): Promise<void> {
  const filePath = `${treeId}/${fileName}`;
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  if (error) throw new Error(`Error al eliminar imagen: ${error.message}`);
}