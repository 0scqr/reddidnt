'use server';

import { getDb } from '../services/db';
import { getUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function addComment(postId: number, parentId: number | null, content: string) {
  const user = await getUser();
  if (!user) return { error: 'Debes iniciar sesión para comentar' };
  if (!content || !content.trim()) return { error: 'El comentario no puede estar vacío' };

  const db = await getDb();
  await db.run(
    'INSERT INTO comments (post_id, parent_id, user_id, author, content) VALUES (?, ?, ?, ?, ?)',
    [postId, parentId, user.id, user.username, content.trim()]
  );

  // Invalida la cache de Next.js de la página principal para forzar un refresco con los datos nuevos
  revalidatePath('/');
  return { success: true };
}
