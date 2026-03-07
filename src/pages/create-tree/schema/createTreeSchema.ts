import { z } from 'zod';

export const createTreeSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional(),
});

export type CreateTreeFormData = z.infer<typeof createTreeSchema>;