'use client';

import React, { useState } from 'react';
import CommentForm from './CommentForm';
import { getAvatarColor } from '../utils/avatar';
import { toggleLike } from '../actions/likes';

export type CommentData = {
  id: number;
  post_id: number;
  parent_id: number | null;
  content: string;
  author: string;
  upvotes: number;
  created_at: string;
  has_liked?: boolean;
  replies?: CommentData[];
};

interface CommentProps {
  comment: CommentData;
  level?: number;
  currentUser?: { id: number; username: string } | null;
}

export default function Comment({ comment, level = 0, currentUser }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [hasLiked, setHasLiked] = useState(comment.has_liked || false);
  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
  const [formattedDate, setFormattedDate] = useState('');
  const isReply = level > 0;

  React.useEffect(() => {
    setFormattedDate(new Date(comment.created_at).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }));
  }, [comment.created_at]);

  const handleLike = async () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para dar me gusta");
      return;
    }

    // Optimistic update
    setHasLiked(!hasLiked);
    setUpvotes(hasLiked ? upvotes - 1 : upvotes + 1);

    const res = await toggleLike('comment', comment.id);
    if (res?.error) {
      setHasLiked(hasLiked);
      setUpvotes(upvotes);
    }
  };

  return (
    <div className={`flex flex-col gap-3 p-5 mt-4 transition-all duration-300 ease-out bg-white/80 backdrop-blur-md border border-gray-200/50 hover:border-gray-300 hover:shadow-lg rounded-[2rem] ${isReply ? 'shadow-sm' : 'shadow-md'}`}>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 font-bold text-sm shadow-inner"
            style={{ backgroundColor: getAvatarColor(comment.author) }}
          >
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 leading-tight">{comment.author}</span>
            <span className="text-[11px] text-gray-400 font-medium">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div className="text-gray-600 text-[15px] leading-relaxed pl-[52px]">
        {comment.content}
      </div>

      <div className="flex items-center gap-4 pl-[52px] mt-1">
        <button
          onClick={handleLike}
          className={`group flex items-center gap-1.5 transition-all text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${hasLiked
            ? 'text-pink-600 bg-pink-50 hover:bg-pink-100'
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-pink-500'
            }`}
        >
          <svg className={`w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200 ${hasLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={hasLiked ? 2 : 2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {upvotes}
        </button>

        {/* Solo mostramos el boton "Responder" si el usuario ha iniciado sesión */}
        {currentUser && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-all text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-gray-50 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Responder
          </button>
        )}
      </div>

      {isReplying && currentUser && (
        <div className="pl-[52px] w-full mt-2">
          <CommentForm
            postId={comment.post_id}
            parentId={comment.id}
            onSuccess={() => setIsReplying(false)}
            placeholder={`Respondiendo a ${comment.author}...`}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="relative pl-6 mt-2 before:absolute before:left-[30px] before:top-2 before:bottom-6 before:w-[2px] before:bg-gradient-to-b before:from-gray-200 before:to-transparent before:rounded-full">
          <div className="flex flex-col gap-1">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} level={level + 1} currentUser={currentUser} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
