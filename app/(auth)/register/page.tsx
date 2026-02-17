"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, UserPlus, AlertCircle } from "lucide-react";

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
      setError("La contrasena debe tener al menos 6 caracteres");
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

    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (loginRes?.error) {
      setError("Cuenta creada pero hubo un error al iniciar sesion. Intenta en la pagina de login.");
    } else {
      router.push("/crear");
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="text-center mb-6">
        <div className="icon-container-md mx-auto mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gradient">Crear cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">Empieza a crear cuentos magicos</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50/80 border border-red-200/60 text-red-700 rounded-2xl px-4 py-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
            placeholder="Ej: Maria"
            required
            maxLength={50}
          />
        </div>
        <div>
          <label className="label-field">Correo electronico</label>
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
          <label className="label-field">Contrasena</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-brand-600 rounded"
            checked={isAdult}
            onChange={(e) => setIsAdult(e.target.checked)}
          />
          <span className="text-sm text-gray-500 leading-relaxed">
            Confirmo que soy mayor de 18 anos y acepto los terminos de uso del servicio.
          </span>
        </label>
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading || !isAdult}
        >
          <UserPlus className="w-4 h-4" />
          {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="text-brand-600 font-heading font-bold hover:text-brand-800 transition-colors">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
