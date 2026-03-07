import { z } from 'zod';

export const createPersonSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  gender: z.enum(['male', 'female']),
  born: z.string().optional(),
  died: z.string().optional(),
  photo_url: z.string().optional(),
  bio: z.string().max(1000, 'La biografía no puede superar los 1000 caracteres').optional(),
  father_id: z.string().optional(),
  mother_id: z.string().optional(),
});

export type CreatePersonFormData = z.infer<typeof createPersonSchema>;