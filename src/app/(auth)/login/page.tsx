'use client';

import React, { useState, useEffect } from 'react';

export default function PandaLogin() {
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Posición de las pupilas
  const [eyePos, setEyePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Movimiento limitado suave alrededor del centro del ojo
      const mouseX = e.clientX - window.innerWidth / 2;
      const mouseY = e.clientY - window.innerHeight / 2;
      
      const angle = Math.atan2(mouseY, mouseX);
      const distance = Math.min(Math.hypot(mouseX, mouseY) / 25, 8); // Máximo 8px de desplazamiento

      setEyePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username !== 'admin' || password !== '123456') {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 3000);
    } else {
      alert('¡Bienvenido al sistema del refugio!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center p-4 selection:bg-pink-200">
      <div className="relative w-full max-w-sm pt-28">
        
        {/* ================= PANDA VECTORIAL REDISEÑADO ================= */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-56 pointer-events-none z-0">
          
          {/* OREJAS */}
          <div className="absolute -top-2 left-6 w-16 h-16 bg-slate-900 rounded-full border-4 border-white shadow-sm" />
          <div className="absolute -top-2 right-6 w-16 h-16 bg-slate-900 rounded-full border-4 border-white shadow-sm" />

          {/* CABEZA */}
          <div className="relative w-full h-48 bg-white rounded-[100px_100px_80px_80px] shadow-lg border-2 border-slate-100 overflow-hidden">
            
            {/* PARCHES NEGROS DE LOS OJOS */}
            <div className="absolute top-12 left-8 w-14 h-20 bg-slate-900 rounded-[50%_50%_45%_45%] -rotate-12 flex items-center justify-center">
              {/* OJO IZQUIERDO */}
              <div className="relative w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
                {!isPasswordFocused ? (
                  <div
                    className="w-4 h-4 bg-slate-900 rounded-full transition-transform duration-75 flex items-center justify-center"
                    style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full -top-0.5 -right-0.5 relative" />
                  </div>
                ) : (
                  <div className="w-full h-1 bg-slate-900 rounded-full" />
                )}
              </div>
            </div>

            <div className="absolute top-12 right-8 w-14 h-20 bg-slate-900 rounded-[50%_50%_45%_45%] rotate-12 flex items-center justify-center">
              {/* OJO DERECHO */}
              <div className="relative w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
                {!isPasswordFocused ? (
                  <div
                    className="w-4 h-4 bg-slate-900 rounded-full transition-transform duration-75 flex items-center justify-center"
                    style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full -top-0.5 -right-0.5 relative" />
                  </div>
                ) : (
                  <div className="w-full h-1 bg-slate-900 rounded-full" />
                )}
              </div>
            </div>

            {/* NARIZ Y HOCICO */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-7 h-4 bg-slate-900 rounded-full mb-0.5" />
              <div className="w-4 h-3 border-b-2 border-slate-900 rounded-full" />
            </div>

            {/* MEJILLAS ROSADAS */}
            <div className="absolute top-28 left-6 w-7 h-4 bg-pink-200/60 rounded-full blur-[1px]" />
            <div className="absolute top-28 right-6 w-7 h-4 bg-pink-200/60 rounded-full blur-[1px]" />
          </div>

          {/* PATITAS SUPERIORES (CUBREN LOS OJOS EN PASSWORD) */}
          <div
            className={`absolute z-30 w-12 h-16 bg-slate-900 rounded-full border-2 border-slate-800 transition-all duration-300 ease-out shadow-md ${
              isPasswordFocused
                ? 'top-12 left-12 rotate-45 scale-110'
                : 'top-36 left-4 -rotate-12'
            }`}
          >
            {/* Almohadilla rosada de la pata */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-pink-300 rounded-full opacity-80" />
          </div>

          <div
            className={`absolute z-30 w-12 h-16 bg-slate-900 rounded-full border-2 border-slate-800 transition-all duration-300 ease-out shadow-md ${
              isPasswordFocused
                ? 'top-12 right-12 -rotate-45 scale-110'
                : 'top-36 right-4 rotate-12'
            }`}
          >
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-pink-300 rounded-full opacity-80" />
          </div>
        </div>

        {/* ================= TARJETA DE LOGIN ================= */}
        <form
          onSubmit={handleSubmit}
          className={`relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 transition-all duration-300 ${
            isWrong ? 'animate-bounce border-red-400' : ''
          }`}
        >
          {/* GLOBITO DE ERROR EN CREDENCIALES */}
          {isWrong && (
            <div className="absolute -top-12 right-2 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg animate-pulse after:content-[''] after:absolute after:-bottom-2 after:right-6 after:border-8 after:border-transparent after:border-t-red-500">
              ¡Credenciales incorrectas!
            </div>
          )}

          <h2 className="text-2xl font-black text-center text-slate-800 mb-6 tracking-tight">
            Panda <span className="text-rose-500">Login</span>
          </h2>

          <div className="space-y-4">
            {/* USERNAME */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Usuario
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white focus:outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:bg-white focus:outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* ================= PATITAS INFERIORES SUTILES ================= */}
        <div className="relative z-0 -mt-3 flex justify-between px-8">
          <div className="w-16 h-10 bg-slate-900 rounded-b-3xl border-t-2 border-slate-700 shadow-md flex items-center justify-center">
            <div className="w-8 h-4 bg-pink-300/80 rounded-full" />
          </div>
          <div className="w-16 h-10 bg-slate-900 rounded-b-3xl border-t-2 border-slate-700 shadow-md flex items-center justify-center">
            <div className="w-8 h-4 bg-pink-300/80 rounded-full" />
          </div>
        </div>

      </div>
    </div>
  );
}