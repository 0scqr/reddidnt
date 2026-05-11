'use server';

import { getDb } from '../services/db';
import { getUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function toggleLike(targetType: 'post' | 'comment', targetId: number) {
  const user = await getUser();
  if (!user) return { error: 'Debes iniciar sesión para dar me gusta' };

  const db = await getDb();
  
  const existing = await db.get(
    'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
    [user.id, targetType, targetId]
  );

  let increment = 0;

  if (existing) {
    await db.run('DELETE FROM likes WHERE id = ?', [existing.id]);
    increment = -1;
  } else {
    await db.run(
      'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
      [user.id, targetType, targetId]
    );
    increment = 1;
  }

  if (targetType === 'comment') {
    await db.run('UPDATE comments SET upvotes = upvotes + ? WHERE id = ?', [increment, targetId]);
  } else if (targetType === 'post') {
    await db.run('UPDATE posts SET upvotes = upvotes + ? WHERE id = ?', [increment, targetId]);
  }

  revalidatePath('/');
  return { success: true, hasLiked: increment > 0 };
}
