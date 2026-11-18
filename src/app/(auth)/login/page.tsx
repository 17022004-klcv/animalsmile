"use client";

import React, { useEffect, useState } from "react";
import "./panda-login.css";
import { Rabbit, Bird } from "lucide-react";
import { Validaciones } from "@/src/utils/validaciones";

export default function PandaLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [errorMsg, setErrorMsg] = useState("¡Credenciales incorrectas!");
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.hypot(dx, dy) / 100, 5);

      setEyePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsWrong(false);

    const errEmail = Validaciones.validarEmail(username, true);
    if (errEmail) {
      setErrorMsg(errEmail);
      setIsWrong(true);
      window.setTimeout(() => setIsWrong(false), 3000);
      return;
    }

    const email = username.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };

      if (!res.ok) {
        setErrorMsg("¡Credenciales incorrectas!");
        setIsWrong(true);
        window.setTimeout(() => setIsWrong(false), 3000);
        return;
      }

      const destino = data.redirect ?? ("/");
      window.location.href = destino;
    } catch {
      setErrorMsg("¡Credenciales incorrectas!");
      setIsWrong(true);
      window.setTimeout(() => setIsWrong(false), 3000);
    }
  };

  return (
    <main className="panda-page">
      <div className="login-scene">
        {/* PANDA */}
        <div className="panda" aria-hidden="true">
          <div className="panda-ear panda-ear-left" />
          <div className="panda-ear panda-ear-right" />

          <div className="panda-body" />

          <div className="panda-face">
            <div className="eye-shade eye-shade-left">
              <div className="eye-white">
                {!isPasswordFocused ? (
                  <div
                    className="eye-ball"
                    style={{
                      transform: `translate(${eyePos.x}px, ${eyePos.y}px)`,
                    }}
                  >
                    <span className="eye-glint" />
                  </div>
                ) : (
                  <div className="eye-closed" />
                )}
              </div>
            </div>

            <div className="eye-shade eye-shade-right">
              <div className="eye-white">
                {!isPasswordFocused ? (
                  <div
                    className="eye-ball"
                    style={{
                      transform: `translate(${eyePos.x}px, ${eyePos.y}px)`,
                    }}
                  >
                    <span className="eye-glint" />
                  </div>
                ) : (
                  <div className="eye-closed" />
                )}
              </div>
            </div>

            <div className="panda-blush panda-blush-left" />
            <div className="panda-blush panda-blush-right" />

            <div className="panda-muzzle">
              <div className="panda-nose" />
              <div className="panda-mouth" />
            </div>
          </div>

          {/* PATAS DELANTERAS */}
          <div
            className={`panda-arm panda-arm-left ${
              isPasswordFocused ? "cover-eyes-left" : ""
            }`}
          >
            <span className="paw-pad" />
            <span className="paw-toe paw-toe-one" />
            <span className="paw-toe paw-toe-two" />
          </div>

          <div
            className={`panda-arm panda-arm-right ${
              isPasswordFocused ? "cover-eyes-right" : ""
            }`}
          >
            <span className="paw-pad" />
            <span className="paw-toe paw-toe-one" />
            <span className="paw-toe paw-toe-two" />
          </div>

          {/* PATAS INFERIORES */}
          <div className="panda-foot panda-foot-left">
            <span />
          </div>
          <div className="panda-foot panda-foot-right">
            <span />
          </div>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className={`panda-form ${isWrong ? "login-error" : ""}`}
        >
          <div className="form-hands" aria-hidden="true">
            <div className="form-hand form-hand-left" />
            <div className="form-hand form-hand-right" />
          </div>

          {isWrong && (
            <div className="login-alert" role="alert">
              {errorMsg}
            </div>
          )}

          <div className="login-heading ">
            <div className="login-logo">
              <img className="w-30 h-30" src="/img/logo_animalsmile.png" alt="Logo de AnimalSmile" />
              <div className="login-heading p-3">
                <h1>
                  Animal<span>Smile</span>
                </h1>
                <p>¡Qué bueno verte de nuevo!</p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <input
              id="username"
               type="email"
               autoComplete="email"
               required
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               placeholder=" "
              className="form-control"
            />
            <label htmlFor="username" className="form-label">
              Correo electrónico
            </label>
            <Rabbit className="input-icon" size={18} strokeWidth={2} />
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              placeholder=" "
              className="form-control"
            />
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <Bird className="input-icon" size={18} strokeWidth={2} />
          </div>

          <button type="submit" className="login-button">
            <span>Iniciar sesión</span>
            <span className="button-arrow">→</span>
          </button>

          <p className="register-link">
            ¿Todavia no tienes cuenta? <a href="/register">Registrate ahora!</a>
          </p>

          <p className="login-footer">
            <span>El amor no se compra,</span> pero se puede rescatar
            <Bird size={14} />
          </p>
        </form>
      </div>
    </main>
  );
}
