'use server';

import { getDb } from '../services/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.scryptSync(password, 'reddit_salt', 64).toString('hex');
}

export async function register(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  if (!username || !password) return { error: 'Todos los campos son obligatorios' };
  
  const db = await getDb();
  
  try {
    const hash = hashPassword(password);
    const result = await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id', [username, hash]);
    
    cookies().set('userId', result.lastID!.toString(), { httpOnly: true, secure: true, path: '/' });
    cookies().set('username', username, { secure: true, path: '/' });
    cookies().delete('guest');
    
    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) {
      return { error: 'El nombre de usuario ya está en uso' };
    }
    return { error: 'Ocurrió un error al registrar el usuario' };
  }
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  if (!username || !password) return { error: 'Todos los campos son obligatorios' };
  
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  
  if (!user || user.password_hash !== hashPassword(password)) {
    return { error: 'Usuario o contraseña incorrectos' };
  }
  
  cookies().set('userId', user.id.toString(), { httpOnly: true, secure: true, path: '/' });
  cookies().set('username', username, { secure: true, path: '/' });
  cookies().delete('guest');
  
  return { success: true };
}

export async function logout() {
  cookies().delete('userId');
  cookies().delete('username');
  cookies().delete('guest');
}

export async function continueAsGuest() {
  cookies().set('guest', 'true', { path: '/' });
}

export async function getUser() {
  try {
    const userId = cookies().get('userId')?.value;
    const username = cookies().get('username')?.value;
    if (!userId || !username) return null;
    
    const id = parseInt(userId);
    const db = await getDb();
    
    const user = await db.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) return null;
    
    return { id, username };
  } catch (e) {
    console.error("Error al obtener usuario:", e);
    return null;
  }
}
