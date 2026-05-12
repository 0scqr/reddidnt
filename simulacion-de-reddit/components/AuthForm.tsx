'use client';

import React, { useState, useEffect } from 'react';
import { login, register } from '../actions/auth';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Clear fields on mount to prevent browser cache from populating old data
  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const res = isLogin ? await login(formData) : await register(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Clear before reload just in case
      setUsername('');
      setPassword('');
      window.location.reload(); 
    }
  }

  function handleToggleMode() {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
  }

  return (
    <div className="w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-2xl font-black text-gray-800 mb-6 text-center tracking-tight">
        {isLogin ? 'Iniciar sesión' : 'Registrarse'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-2xl text-sm mb-5 text-center font-medium border border-red-100">
          {error}
        </div>
      )}

      <form key={isLogin ? 'login' : 'register'} onSubmit={handleSubmit} className="flex flex-col gap-4 text-left" autoComplete="off">
        <input 
          type="text" 
          name="username" 
          placeholder="Tu nombre artístico (ej. AlmaDeVinilo)" 
          className="px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 bg-white shadow-sm transition-all text-sm"
          autoComplete="off"
          required 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'}
            name="password" 
            placeholder="Contraseña" 
            className="w-full px-5 py-3.5 pr-12 rounded-2xl border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 bg-white shadow-sm transition-all text-sm"
            autoComplete="new-password"
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-gray-800 text-white font-bold py-3.5 mt-2 rounded-2xl shadow-md hover:bg-gray-900 transition-all disabled:opacity-50 hover:-translate-y-0.5 active:scale-95"
        >
          {loading ? 'Sincronizando...' : (isLogin ? 'Acceder' : 'Crear Cuenta')}
        </button>
      </form>

      <div className="text-center mt-5">
        <button 
          type="button" 
          onClick={handleToggleMode} 
          className="text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors"
        >
          {isLogin ? '¿Primera vez aquí? Regístrate' : '¿Ya tienes un espacio? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}
