import { supabase } from '../../config/supabase/supabase';
import type { Person, CreatePersonDto, UpdatePersonDto } from '../models/personModel';


export const getAllPersons = async (tree_id: string): Promise<Person[]> => {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('tree_id', tree_id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};


export const getPersonById = async (id: string): Promise<Person> => {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const createPerson = async (dto: CreatePersonDto): Promise<Person> => {
  const { data, error } = await supabase
    .from('persons')
    .insert(dto)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const updatePerson = async (id: string, dto: UpdatePersonDto): Promise<Person> => {
  const { data, error } = await supabase
    .from('persons')
    .update(dto)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const deletePerson = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('persons')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

