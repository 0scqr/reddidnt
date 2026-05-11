'use client';
import { useState } from 'react';
import AuthForm from './AuthForm';
import { continueAsGuest } from '../actions/auth';

export default function LandingPage() {
  const [view, setView] = useState<'options' | 'auth'>('options');
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 sm:p-10 bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 text-center relative transition-all duration-500">
         {view === 'options' ? (
           <div className="animate-in fade-in zoom-in duration-500">
             <div className="w-24 h-24 mx-auto mb-6 rounded-[2rem] bg-gradient-to-tr from-gray-600 to-gray-800 flex items-center justify-center text-white shadow-lg shadow-gray-200/50 rotate-3 hover:rotate-6 transition-transform">
               <svg className="w-12 h-12 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                 <rect x="5" y="8" width="14" height="10" rx="3" strokeLinecap="round" strokeLinejoin="round" />
                 <path d="M12 8V4M10 4h4" strokeLinecap="round" strokeLinejoin="round" />
                 <circle cx="9" cy="13" r="1.5" fill="currentColor" stroke="none" />
                 <circle cx="15" cy="13" r="1.5" fill="currentColor" stroke="none" />
                 <path d="M10 16.5c1 .5 3 .5 4 0" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
             <h1 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">Reddidn&apos;t</h1>
             <p className="text-gray-500 mb-10 text-[15px] font-medium leading-relaxed">Donde la música y tus emociones convergen en un solo lugar.</p>
             
             <div className="flex flex-col gap-4">
               <button onClick={() => setView('auth')} className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold py-4 rounded-3xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                 Entrar a la Comunidad
               </button>
               <button onClick={async () => { await continueAsGuest(); window.location.reload(); }} className="bg-white/80 text-gray-600 font-bold py-4 rounded-3xl shadow-sm border border-gray-200 hover:bg-white hover:text-gray-800 transition-all">
                 Explorar como Invitado
               </button>
             </div>
           </div>
         ) : (
           <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative text-left">
             <button onClick={() => setView('options')} className="absolute -top-4 -left-4 text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-bold transition-colors z-20 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
               Volver
             </button>
             <div className="pt-8">
                <AuthForm />
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
