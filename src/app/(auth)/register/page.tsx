"use client";

import React, { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Bird,
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import "./puppy-register.css";

const PASSWORD_IDS = ["register-password", "register-confirm-password"];

export default function PuppyRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.hypot(dx, dy) / 100, 5);

      setEyePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Si el foco pasa de un campo de contraseña al otro, el perrito sigue tapándose los ojos.
  const handlePasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (!next || !PASSWORD_IDS.includes(next.id)) {
      setIsPasswordFocused(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. ¡Inténtalo de nuevo!");
      return;
    }

    // Aquí puedes conectar tu API de registro.
    setSuccess("¡Todo listo! El formulario está validado.");
  };

  const eye = (side: "left" | "right") => (
    <div className={`puppy-eye-patch puppy-eye-${side}`}>
      <div className="puppy-eye-white">
        {!isPasswordFocused ? (
          <div
            className="puppy-eye-ball"
            style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}
          >
            <span />
          </div>
        ) : (
          <div className="puppy-eye-closed" />
        )}
      </div>
    </div>
  );

  const paw = (side: "left" | "right") => (
    <div className={`puppy-arm puppy-arm-${side}`}>
      <span className="puppy-paw-pad" />
      <span className="puppy-paw-toe toe-one" />
      <span className="puppy-paw-toe toe-two" />
      <span className="puppy-paw-toe toe-three" />
    </div>
  );

  return (
    <main className="puppy-page">
      <div className="puppy-scene">
        {/* CACHORRITO ANIMADO */}
        <div className="puppy-stage">
          <div
            className={`puppy ${isPasswordFocused ? "is-hiding" : ""}`}
            aria-hidden="true"
          >
            <div className="puppy-tail" />

            <div className="puppy-body">
              <div className="puppy-belly" />
            </div>

            <div className="puppy-foot puppy-foot-left">
              <span />
            </div>
            <div className="puppy-foot puppy-foot-right">
              <span />
            </div>

            <div className="puppy-head">
              <div className="puppy-ear puppy-ear-left">
                <span />
              </div>
              <div className="puppy-ear puppy-ear-right">
                <span />
              </div>

              <div className="puppy-face">
                <div className="puppy-forehead" />
                <div className="puppy-brow puppy-brow-left" />
                <div className="puppy-brow puppy-brow-right" />

                {eye("left")}
                {eye("right")}

                <div className="puppy-blush puppy-blush-left" />
                <div className="puppy-blush puppy-blush-right" />

                <div className="puppy-snout">
                  <div className="puppy-nose">
                    <span />
                  </div>
                  <div className="puppy-mouth" />
                  <div className="puppy-smile puppy-smile-left" />
                  <div className="puppy-smile puppy-smile-right" />
                  <div className="puppy-tongue" />
                </div>
              </div>
            </div>

            <div className="puppy-collar">
              <span className="puppy-tag" />
            </div>

            {/* PATITAS QUE CUBREN LOS OJOS */}
            {paw("left")}
            {paw("right")}
          </div>
        </div>

        {/* TARJETA DE REGISTRO (fija, no se mueve) */}
        <form
          onSubmit={handleSubmit}
          className={`puppy-form ${error ? "puppy-form-error" : ""}`}
        >
          <header className="puppy-heading">
            {/* Espacio reservado para tu logo */}
            <div className="register-logo">
              <img className="w-30 h-30" src="/img/logo_animalsmile.png" />
            </div>

            <h1>
              Crear <span>cuenta</span>
            </h1>
            <p>¡Un nuevo comienzo te espera!</p>
          </header>

          {error && (
            <div className="puppy-message puppy-message-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="puppy-message puppy-message-success" role="status">
              {success}
            </div>
          )}

          <div className="puppy-form-fields">
            <div className="puppy-field">
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="puppy-input"
              />
              <label htmlFor="register-name" className="puppy-label">
                Nombre completo
              </label>
              <UserRound className="puppy-input-icon" size={18} />
            </div>

            <div className="puppy-field">
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="puppy-input"
              />
              <label htmlFor="register-email" className="puppy-label">
                Correo electrónico
              </label>
              <Mail className="puppy-input-icon" size={18} />
            </div>

            <div className="puppy-field">
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={handlePasswordBlur}
                placeholder=" "
                className="puppy-input"
              />
              <label htmlFor="register-password" className="puppy-label">
                Contraseña
              </label>
              <LockKeyhole className="puppy-input-icon" size={18} />
            </div>

            <div className="puppy-field">
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={handlePasswordBlur}
                placeholder=" "
                className="puppy-input"
              />
              <label
                htmlFor="register-confirm-password"
                className="puppy-label"
              >
                Confirmar contraseña
              </label>
              <ShieldCheck className="puppy-input-icon" size={18} />
            </div>
          </div>

          <button type="submit" className="puppy-submit">
            <span>Crear mi cuenta</span>
            <ArrowRight size={19} />
          </button>

          <p className="puppy-login-link">
            ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
          </p>

          <p className="puppy-footer">
            <span>El amor no se compra,</span> pero se puede rescatar
            <Bird size={14} />
          </p>
        </form>
      </div>
    </main>
  );
}
