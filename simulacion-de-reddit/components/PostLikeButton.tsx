'use client';

import React, { useState } from 'react';
import { toggleLike } from '../actions/likes';

interface PostLikeButtonProps {
  postId: number;
  initialUpvotes: number;
  initialHasLiked: boolean;
  currentUser: any;
}

export default function PostLikeButton({ postId, initialUpvotes, initialHasLiked, currentUser }: PostLikeButtonProps) {
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [upvotes, setUpvotes] = useState(initialUpvotes);

  const handleLike = async () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para dar me gusta");
      return;
    }
    
    // Optimistic update
    setHasLiked(!hasLiked);
    setUpvotes(hasLiked ? upvotes - 1 : upvotes + 1);

    const res = await toggleLike('post', postId);
    if (res?.error) {
      setHasLiked(hasLiked);
      setUpvotes(upvotes);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={`group flex items-center gap-2 transition-all text-sm font-semibold py-2 px-4 rounded-full cursor-pointer shadow-sm border ${
        hasLiked 
          ? 'text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-100' 
          : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:text-pink-500 hover:border-pink-200'
      }`}
    >
      <svg className={`w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200 ${hasLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={hasLiked ? 2 : 2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {upvotes}
    </button>
  );
}
