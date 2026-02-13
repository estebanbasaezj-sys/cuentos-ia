import { z } from 'zod';

export const createStorySchema = z.object({
  childName: z.string().min(1, 'El nombre es obligatorio').max(30, 'Máximo 30 caracteres'),
  childAgeGroup: z.enum(['0-2', '3-5', '6-8', '9-12'], {
    error: 'Selecciona un grupo de edad',
  }),
  theme: z.string().min(1, 'El tema es obligatorio').max(100, 'Máximo 100 caracteres'),
  tone: z.enum(['tierno', 'divertido', 'educativo'], {
    error: 'Selecciona un tono',
  }),
  length: z.enum(['corto', 'medio', 'largo'], {
    error: 'Selecciona un largo',
  }),
  artStyle: z.string().optional(),
  colorPalette: z.string().optional(),
  imageQuality: z.enum(['standard', 'high']).optional(),
  traits: z.object({
    mascota: z.string().max(30).optional(),
    colorFavorito: z.string().max(30).optional(),
  }).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  isAdult: z.literal(true, {
    error: 'Debes confirmar que eres mayor de edad',
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const reportSchema = z.object({
  reason: z.string().min(5, 'Describe el motivo (mínimo 5 caracteres)').max(500),
});

export const shareSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30),
});

export const updatePagesSchema = z.object({
  pages: z.array(z.object({
    id: z.string(),
    text: z.string().min(1).max(2000),
  })),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
