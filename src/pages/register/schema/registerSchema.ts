import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;