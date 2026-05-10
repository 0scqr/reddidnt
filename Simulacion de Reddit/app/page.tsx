import React from 'react';
import { cookies } from 'next/headers';
import { getDb } from '../services/db';
import { getCommentsByPostId } from '../services/commentService';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';
import LandingPage from '../components/LandingPage';
import LogoutButton from '../components/LogoutButton';
import PostLikeButton from '../components/PostLikeButton';
import { getUser } from '../actions/auth';
import { getAvatarColor } from '../utils/avatar';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getUser();
  const isGuest = cookies().get('guest')?.value === 'true';

  if (!user && !isGuest) {
    return <LandingPage />;
  }

  const db = await getDb();
  let post = await db.get('SELECT * FROM posts LIMIT 1');

  // Si el post antiguo existe, reiniciamos la BD para inyectar a Lana Del Rey
  if (post && !post.title.includes('Lana Del Rey')) {
    await db.exec('DELETE FROM comments; DELETE FROM posts; DELETE FROM users;');
    post = null;
  }

  if (!post) {
    const crypto = require('crypto');
    const hash = crypto.scryptSync('123456', 'reddit_salt', 64).toString('hex');

    await db.run('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', ['Melomano99', hash]);
    await db.run('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', ['AlmaDeVinilo', hash]);
    await db.run('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', ['RitmoYBlues', hash]);

    const u1 = await db.get('SELECT id FROM users WHERE username = ?', ['Melomano99']);
    const u2 = await db.get('SELECT id FROM users WHERE username = ?', ['AlmaDeVinilo']);
    const u3 = await db.get('SELECT id FROM users WHERE username = ?', ['RitmoYBlues']);

    const postResult = await db.run(
      'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)', 
      ['¿Qué les transmite "Video Games" de Lana Del Rey?', 'Esa melodía nostálgica y su voz me llevan a un recuerdo que ni siquiera sabía que tenía. Es como estar en un romance vintage, melancólico pero hermoso. ¿Cómo les hace sentir a ustedes?', 'AlmaDeVinilo']
    );
    const newPostId = postResult.lastID as number;

    const c1 = await db.run(`INSERT INTO comments (post_id, parent_id, user_id, author, content, upvotes) VALUES (?, ?, ?, ?, ?, ?)`, 
      [newPostId, null, u1.id, 'Melomano99', 'Me da escalofríos cada vez que entran los violines. Es pura nostalgia cinematográfica, me hace querer manejar de noche sin rumbo.', 68]);
    const rootId = c1.lastID;

    await db.run(`INSERT INTO comments (post_id, parent_id, user_id, author, content, upvotes) VALUES (?, ?, ?, ?, ?, ?)`, 
      [newPostId, rootId, u3.id, 'RitmoYBlues', 'Siento que el tiempo se detiene. Su voz tiene el poder de aislarte completamente del mundo moderno.', 42]);

    await db.run(`INSERT INTO comments (post_id, parent_id, user_id, author, content, upvotes) VALUES (?, ?, ?, ?, ?, ?)`, 
      [newPostId, null, u2.id, 'AlmaDeVinilo', 'Es la definición de "old hollywood sadness". Es triste pero no quieres que termine de sonar, es adictiva.', 55]);

    post = await db.get('SELECT * FROM posts WHERE id = ?', [newPostId]);
  }

  const commentsTree = await getCommentsByPostId(post.id);

  const userLikes = user ? await db.all('SELECT target_type, target_id FROM likes WHERE user_id = ?', [user.id]) : [];
  const likedPostIds = new Set(userLikes.filter((l: any) => l.target_type === 'post').map((l: any) => l.target_id));
  const likedCommentIds = new Set(userLikes.filter((l: any) => l.target_type === 'comment').map((l: any) => l.target_id));

  post.has_liked = likedPostIds.has(post.id);

  const markLikes = (comments: any[]) => {
    comments.forEach(c => {
      c.has_liked = likedCommentIds.has(c.id);
      if (c.replies) markLikes(c.replies);
    });
  };
  markLikes(commentsTree);

  const countComments = (comments: any[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countComments(comment.replies) : 0);
    }, 0);
  };
  const totalComments = countComments(commentsTree);

  return (
    <main className="py-10 px-4 sm:px-6 flex justify-center">
      <div className="max-w-2xl w-full z-10">
        
        {/* Navbar */}
        <div className="flex justify-between items-center mb-10 px-3 bg-white/50 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-sm border border-white/60 transition-all hover:bg-white/70">
           <div className="font-bold text-gray-800 text-lg flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-md">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                 <rect x="5" y="8" width="14" height="10" rx="3" strokeLinecap="round" strokeLinejoin="round" />
                 <path d="M12 8V4M10 4h4" strokeLinecap="round" strokeLinejoin="round" />
                 <circle cx="9" cy="13" r="1.5" fill="currentColor" stroke="none" />
                 <circle cx="15" cy="13" r="1.5" fill="currentColor" stroke="none" />
                 <path d="M10 16.5c1 .5 3 .5 4 0" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
             Reddidn&apos;t
           </div>
           {user ? (
             <div className="flex items-center gap-4">
               <span className="text-sm font-semibold text-gray-700">{user.username}</span>
               <LogoutButton />
             </div>
           ) : (
             <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-gray-600 bg-gray-100/50 px-3 py-1.5 rounded-full border border-gray-200/50">Invitado</span>
               <form action={async () => { 'use server'; cookies().delete('guest'); }} className="inline">
                 <button type="submit" className="text-xs font-bold text-gray-700 bg-white/80 border border-gray-200 px-4 py-2 rounded-full hover:bg-white transition-colors shadow-sm">Entrar</button>
               </form>
             </div>
           )}
        </div>

        {/* Cabecera del Post Musical */}
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] tracking-widest font-extrabold text-gray-600 bg-gray-100/50 px-4 py-1.5 rounded-full uppercase border border-gray-200/50">
              Análisis Sensorial
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-5 leading-snug tracking-tight">
            {post.title}
          </h1>
          <p className="text-gray-600 text-[16px] leading-relaxed mb-8 font-medium">
            {post.content}
          </p>
          <div className="flex items-center justify-between border-t border-gray-100/50 pt-6">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-semibold">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 font-bold shadow-sm"
                style={{ backgroundColor: getAvatarColor(post.author) }}
              >
                {post.author.charAt(0).toUpperCase()}
              </div>
              <span>Publicado por <span className="text-gray-800 font-bold">{post.author}</span></span>
            </div>
            <PostLikeButton postId={post.id} initialUpvotes={post.upvotes} initialHasLiked={post.has_liked} currentUser={user} />
          </div>
        </div>

        {/* Interacción */}
        {user ? (
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm border border-white/60 mb-10">
             <h3 className="text-gray-700 font-bold mb-3 text-[15px] flex items-center gap-2">
               Añadir comentario, <span className="text-gray-500">{user.username}</span>
             </h3>
             <CommentForm postId={post.id} placeholder="¿Qué te transmite a ti esta canción?" />
          </div>
        ) : (
          <div className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/60 mb-10 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-700 bg-white/50 rounded-full flex items-center justify-center shadow-inner">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-gray-800 font-bold mb-3 text-xl">Únete a la conversación</h3>
            <p className="text-[15px] text-gray-500 mb-6 font-medium max-w-sm mx-auto">Inicia sesión con tu nombre artístico para compartir qué te transmite esta pieza musical.</p>
            <form action={async () => { 'use server'; cookies().delete('guest'); }}>
              <button type="submit" className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold px-8 py-3.5 rounded-3xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                Iniciar Sesión / Registrarse
              </button>
            </form>
          </div>
        )}
        
        {/* Comentarios Musicales */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 pl-2 flex items-center gap-3">
            Comentarios 
            <span className="bg-white/80 text-gray-600 text-sm px-3 py-1 rounded-full font-bold shadow-sm border border-white">
              {totalComments}
            </span>
          </h2>
          
          <div className="flex flex-col gap-4">
            {commentsTree.map((comment) => (
              <Comment key={comment.id} comment={comment} currentUser={user} />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
