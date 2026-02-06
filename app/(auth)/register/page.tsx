"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAdult) {
      setError("Debes confirmar que eres mayor de edad");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, isAdult: true }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al registrar");
      setLoading(false);
      return;
    }

    // Auto login
    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (loginRes?.error) {
      setError("Cuenta creada pero hubo un error al iniciar sesión. Intenta en la página de login.");
    } else {
      router.push("/crear");
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">✨</div>
        <h1 className="text-2xl font-bold text-purple-800">Crear cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">Empieza a crear cuentos mágicos</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Tu nombre</label>
          <input
            type="text"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: María"
            required
            maxLength={50}
          />
        </div>
        <div>
          <label className="label-field">Correo electrónico</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </div>
        <div>
          <label className="label-field">Contraseña</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-purple-600"
            checked={isAdult}
            onChange={(e) => setIsAdult(e.target.checked)}
          />
          <span className="text-sm text-gray-600">
            Confirmo que soy mayor de 18 años y acepto los términos de uso del servicio.
          </span>
        </label>
        <button type="submit" className="btn-primary w-full" disabled={loading || !isAdult}>
          {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-purple-600 font-semibold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
