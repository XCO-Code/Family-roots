export type Gender = 'male' | 'female' | 'other';

export interface Person {
  id: string;
  tree_id: string;
  name: string;
  gender: Gender;
  born?: string;
  died?: string;
  photo_url?: string;
  bio?: string;
  father_id?: string;
  mother_id?: string;
  created_at: string;
}

export interface CreatePersonDto {
  tree_id: string;
  name: string;
  gender: Gender;
  born?: string;
  died?: string;
  photo_url?: string;
  
  bio?: string;
  father_id?: string;
  mother_id?: string;
}

export interface UpdatePersonDto {
  name?: string;
  gender?: Gender;
  born?: string;
  died?: string;
  photo_url?: string;
  bio?: string;
  father_id?: string;
  mother_id?: string;
}
