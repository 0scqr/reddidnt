'use client';

import React, { useState } from 'react';
import { addComment } from '../actions/comments';

interface CommentFormProps {
  postId: number;
  parentId?: number | null;
  onSuccess?: () => void;
  placeholder?: string;
}

export default function CommentForm({ postId, parentId = null, onSuccess, placeholder = "¿Qué piensas sobre esto?" }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    const res = await addComment(postId, parentId, content);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      // Si el error dice que debe iniciar sesión (ej. su sesión expiró o la BD se borró), refrescamos la página
      if (res.error === 'Debes iniciar sesión para comentar') {
          window.location.reload();
      }
    } else {
      setContent('');
      setLoading(false);
      if (onSuccess) onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full mt-2">
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-4 rounded-[1.5rem] border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 bg-white/50 backdrop-blur-sm resize-none text-sm shadow-sm transition-all"
        rows={3}
      />
      {error && <span className="text-red-500 text-xs pl-3 font-medium">{error}</span>}
      <div className="flex justify-end gap-3 mt-1">
        {onSuccess && (
          <button type="button" onClick={onSuccess} className="px-5 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200">
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading || !content.trim()}
          className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-2 rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? 'Publicando...' : 'Comentar'}
        </button>
      </div>
    </form>
  );
}
