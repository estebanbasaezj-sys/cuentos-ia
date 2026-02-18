"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, ArrowLeft, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const emailHint = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restablecer la contrasena");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center mb-6">
          <div className="icon-container-md mx-auto mb-4" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <CheckCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gradient">Contrasena restablecida</h1>
          <p className="text-gray-500 text-sm mt-2">
            Tu contrasena ha sido actualizada correctamente. Ya puedes iniciar sesion.
          </p>
        </div>

        <Link
          href="/login"
          className="btn-primary w-full text-center block"
        >
          Ir a iniciar sesion
        </Link>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="text-center mb-6">
        <div className="icon-container-md mx-auto mb-4">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gradient">Restablecer contrasena</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ingresa el codigo que recibiste{emailHint && ` en ${emailHint}`}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50/80 border border-red-200/60 text-red-700 rounded-2xl px-4 py-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Codigo de recuperacion</label>
          <input
            type="text"
            className="input-field text-center text-2xl font-bold tracking-[0.3em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            required
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>
        <div>
          <label className="label-field">Nueva contrasena</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input-field pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="label-field">Confirmar contrasena</label>
          <input
            type={showPassword ? "text" : "password"}
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contrasena"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading || code.length < 6}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          {loading ? "Restableciendo..." : "Restablecer contrasena"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        <Link href="/recuperar" className="text-brand-600 font-heading font-bold hover:text-brand-800 transition-colors flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Solicitar nuevo codigo
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="card animate-pulse"><div className="skeleton h-8 w-2/3 mx-auto mb-4" /><div className="skeleton h-4 w-1/2 mx-auto" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
