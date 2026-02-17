"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al enviar el codigo");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center mb-6">
          <div className="icon-container-md mx-auto mb-4" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <CheckCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gradient">Codigo enviado</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Si existe una cuenta con <strong>{email}</strong>, se ha generado un codigo de recuperacion.
            Revisa la consola del servidor o tu correo.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/restablecer?email=${encodeURIComponent(email)}`}
            className="btn-primary w-full text-center block"
          >
            Ingresar codigo
          </Link>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="btn-secondary w-full"
          >
            Enviar otro codigo
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          <Link href="/login" className="text-brand-600 font-heading font-bold hover:text-brand-800 transition-colors flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="text-center mb-6">
        <div className="icon-container-md mx-auto mb-4">
          <Mail className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gradient">Recuperar contrasena</h1>
        <p className="text-gray-500 text-sm mt-1">Te enviaremos un codigo para restablecer tu contrasena</p>
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
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {loading ? "Enviando..." : "Enviar codigo"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        <Link href="/login" className="text-brand-600 font-heading font-bold hover:text-brand-800 transition-colors flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al login
        </Link>
      </p>
    </div>
  );
}
