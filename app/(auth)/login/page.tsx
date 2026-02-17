"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Correo o contrasena incorrectos");
    } else {
      router.push("/biblioteca");
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="text-center mb-6">
        <div className="icon-container-md mx-auto mb-4">
          <BookOpen className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gradient">Iniciar sesion</h1>
        <p className="text-gray-500 text-sm mt-1">Accede a tus cuentos</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50/80 border border-red-200/60 text-red-700 rounded-2xl px-4 py-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="------"
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          <LogIn className="w-4 h-4" />
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link href="/recuperar" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">
          Olvidaste tu contrasena?
        </Link>
      </div>

      <p className="text-center text-sm text-gray-500 mt-3">
        No tienes cuenta?{" "}
        <Link href="/register" className="text-brand-600 font-heading font-bold hover:text-brand-800 transition-colors">
          Registrate gratis
        </Link>
      </p>
    </div>
  );
}
