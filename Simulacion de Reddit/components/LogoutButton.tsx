'use client';
import { logout } from '../actions/auth';

export default function LogoutButton() {
  return (
    <button 
      onClick={async () => { await logout(); window.location.reload(); }} 
      className="text-xs font-bold text-gray-600 hover:text-white bg-gray-100 hover:bg-gray-800 px-4 py-1.5 rounded-full transition-colors shadow-sm"
    >
      Cerrar Sesión
    </button>
  );
}
