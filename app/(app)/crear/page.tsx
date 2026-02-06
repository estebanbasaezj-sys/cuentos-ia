"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AGE_GROUPS, THEMES, TONES, LENGTHS } from "@/lib/constants";

export default function CrearCuentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  const [childName, setChildName] = useState("");
  const [childAgeGroup, setChildAgeGroup] = useState("");
  const [theme, setTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [tone, setTone] = useState("tierno");
  const [length, setLength] = useState("corto");
  const [mascota, setMascota] = useState("");
  const [colorFavorito, setColorFavorito] = useState("");

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining ?? null))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finalTheme = theme === "custom" ? customTheme : theme;
    if (!finalTheme) {
      setError("Selecciona o escribe un tema");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create story record
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName,
          childAgeGroup,
          theme: finalTheme,
          tone,
          length,
          traits: {
            ...(mascota && { mascota }),
            ...(colorFavorito && { colorFavorito }),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear cuento");
        setLoading(false);
        return;
      }

      // Step 2: Start generation
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: data.storyId }),
      });

      // Step 3: Redirect to progress page
      router.push(`/generando/${data.storyId}`);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-800">Crear un nuevo cuento</h1>
        <p className="text-gray-500 mt-1">Personaliza la historia para tu hijo/a</p>
        {remaining !== null && (
          <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${
            remaining > 0
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}>
            {remaining > 0
              ? `${remaining} cuento${remaining > 1 ? "s" : ""} gratuito${remaining > 1 ? "s" : ""} disponible${remaining > 1 ? "s" : ""} hoy`
              : "Ya usaste tu cuento gratuito de hoy"}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label-field">Nombre del niño/a *</label>
          <input
            type="text"
            className="input-field"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Ej: Sofía"
            required
            maxLength={30}
          />
        </div>

        <div>
          <label className="label-field">Edad aproximada *</label>
          <select
            className="input-field"
            value={childAgeGroup}
            onChange={(e) => setChildAgeGroup(e.target.value)}
            required
          >
            <option value="">Selecciona...</option>
            {AGE_GROUPS.map((ag) => (
              <option key={ag.value} value={ag.value}>{ag.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Tema del cuento *</label>
          <select
            className="input-field"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
          >
            <option value="">Selecciona un tema...</option>
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {theme === "custom" && (
            <input
              type="text"
              className="input-field mt-2"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Escribe tu tema personalizado..."
              maxLength={100}
              required
            />
          )}
        </div>

        <div>
          <label className="label-field">Tono</label>
          <div className="flex gap-3 flex-wrap">
            {TONES.map((t) => (
              <label
                key={t.value}
                className={`px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                  tone === t.value
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-purple-200"
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={t.value}
                  checked={tone === t.value}
                  onChange={(e) => setTone(e.target.value)}
                  className="sr-only"
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label-field">Largo del cuento</label>
          <div className="flex gap-3">
            {LENGTHS.map((l) => (
              <label
                key={l.value}
                className={`px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                  length === l.value
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-purple-200"
                }`}
              >
                <input
                  type="radio"
                  name="length"
                  value={l.value}
                  checked={length === l.value}
                  onChange={(e) => setLength(e.target.value)}
                  className="sr-only"
                />
                {l.label}
              </label>
            ))}
          </div>
        </div>

        {/* Optional traits */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-800">
            + Detalles opcionales (mascota, color favorito)
          </summary>
          <div className="mt-3 space-y-3 pl-1">
            <div>
              <label className="label-field">Mascota</label>
              <input
                type="text"
                className="input-field"
                value={mascota}
                onChange={(e) => setMascota(e.target.value)}
                placeholder="Ej: un gatito llamado Michi"
                maxLength={30}
              />
            </div>
            <div>
              <label className="label-field">Color favorito</label>
              <input
                type="text"
                className="input-field"
                value={colorFavorito}
                onChange={(e) => setColorFavorito(e.target.value)}
                placeholder="Ej: azul"
                maxLength={30}
              />
            </div>
          </div>
        </details>

        <button
          type="submit"
          className="btn-primary w-full text-lg !py-3"
          disabled={loading || (remaining !== null && remaining <= 0)}
        >
          {loading ? "Creando cuento..." : "Generar cuento"}
        </button>
      </form>
    </div>
  );
}
