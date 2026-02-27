export interface Tree {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TreeDto {
  name: string;
  description?: string;
  user_id: string;
}