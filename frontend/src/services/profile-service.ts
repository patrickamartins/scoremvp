import { z } from 'zod';
import api from '../lib/axios'; // Importa a instância do axios

const API_URL = 'https://scoremvp-backend.onrender.com/api';

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  favorite_team: z.string().nullable().optional(),
  playing_team: z.string().nullable().optional(),
  plan: z.string(),
  profile_image: z.string().nullable().optional(),
  is_active: z.boolean(),
  role: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

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