import { z } from 'zod';
import api from '../lib/axios'; // Importa a instância do axios

const API_URL = 'https://scoremvp-backend.onrender.com/api';

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const validateProfile = (data: unknown) => {
  return profileSchema.safeParse(data);
};

export const statsSchema = z.object({
  evolution: z.array(z.object({ month: z.number(), points: z.number() })),
  assists: z.array(z.object({ month: z.number(), total: z.number() })),
  free_throws: z.array(z.object({ month: z.number(), total: z.number() })),
  rebounds: z.array(z.object({ month: z.number(), total: z.number() })),
});

export const eventSchema = z.object({
  date: z.string(),
  status: z.enum(['accepted', 'pending', 'rejected']),
  title: z.string(),
});

export type ProfileData = z.infer<typeof profileSchema>;

export async function getProfile(): Promise<ProfileData> {
  const response = await api.get('/profile/me');
  return profileSchema.parse(response.data);
}

export async function getStats() {
  const response = await api.get('/profile/me/stats');
  return statsSchema.parse(response.data);
}

export async function getEvents() {
  const response = await api.get('/profile/me/events');
  return z.array(eventSchema).parse(response.data);
}

export async function updateProfile(payload: Partial<ProfileData>) {
  const response = await api.put('/profile/me', payload);
  return profileSchema.parse(response.data);
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/profile/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.avatar;
} 