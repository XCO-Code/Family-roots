import { supabase } from '../../config/supabase/supabase';
import type { Tree, TreeDto } from '../models/treeModel';


export const getAllTrees = async (): Promise<Tree[]> => {
  const { data, error } = await supabase
    .from('trees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
};


export const getTreeById = async (id: string): Promise<Tree> => {
  const { data, error } = await supabase
    .from('trees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getTreesByUserId = async (userId: string): Promise<Tree[]> => {
  const { data, error } = await supabase
    .from('trees')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createTree = async (dto: TreeDto): Promise<Tree> => {
  const { data, error } = await supabase
    .from('trees')
    .insert(dto)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const updateTree = async (id: string, dto: TreeDto): Promise<Tree> => {
  const { data, error } = await supabase
    .from('trees')
    .update({ ...dto, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const deleteTree = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('trees')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};