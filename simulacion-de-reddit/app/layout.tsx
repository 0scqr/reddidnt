import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Reddidn\'t',
  description: 'Comunidad musical sentimental',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900 text-lg min-h-screen relative overflow-x-hidden selection:bg-gray-200 selection:text-gray-900`}>
        {/* Fondos estéticos unificados para TODA la aplicación */}
        <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-gray-200/40 rounded-full blur-[100px] pointer-events-none z-[-1]"></div>
        <div className="fixed bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-gray-300/30 rounded-full blur-[100px] pointer-events-none z-[-1]"></div>

        {children}
      </body>
    </html>
  );
}
