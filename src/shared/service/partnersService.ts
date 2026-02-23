import { supabase } from '../../config/supabase/supabase';
import type { Partner, CreatePartnerDto, UpdatePartnerDto } from '../models/partnerModel';


export const getAllPartners = async (person_id: string): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('person_id', person_id);

  if (error) throw new Error(error.message);
  return data ?? [];
};


export const getPartnerById = async (id: string): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const createPartner = async (dto: CreatePartnerDto): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .insert(dto)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const updatePartner = async (id: string, dto: UpdatePartnerDto): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .update(dto)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


export const deletePartner = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
