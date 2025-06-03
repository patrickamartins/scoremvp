const API_URL = 'https://scoremvp-backend.onrender.com/api';

import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  plan: z.enum(['Bronze', 'Prata', 'Ouro']),
  avatar: z.string().optional(),
  level: z.string(),
  exp: z.number(),
  nextLevel: z.string(),
  nextLevelExp: z.number(),
  currentExp: z.number(),
  totalExp: z.number(),
  progress: z.number(),
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

export async function getProfile() {
  const res = await fetch(`${API_URL}/profile/me`);
  const data = await res.json();
  return profileSchema.parse(data);
}

export async function getStats() {
  const res = await fetch(`${API_URL}/profile/me/stats`);
  const data = await res.json();
  return statsSchema.parse(data);
}

export async function getEvents() {
  const res = await fetch(`${API_URL}/profile/me/events`);
  const data = await res.json();
  return z.array(eventSchema).parse(data);
}

export async function updateProfile(payload: z.infer<typeof profileSchema>) {
  const res = await fetch(`${API_URL}/profile/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erro ao atualizar perfil');
  const data = await res.json();
  return profileSchema.parse(data);
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_URL}/profile/me/avatar`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error('Erro ao fazer upload do avatar');
  const data = await res.json();
  return data.avatar;
} 