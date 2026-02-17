"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Wand2, AlertCircle, Crown, ChevronRight, ChevronLeft,
  Sparkles, PawPrint, Heart,
  Rocket, TreePine, Star, Moon, Cat, Paintbrush, Check,
} from "lucide-react";
import { AGE_GROUPS, THEMES, TONES, LENGTHS, ART_STYLES, COLOR_PALETTES } from "@/lib/constants";
import Paywall from "@/components/Paywall";
import { useUsage } from "@/components/UsageProvider";
import type { GateResult } from "@/types";

const THEME_ICONS: Record<string, React.ReactNode> = {
  aventura: <Rocket className="w-5 h-5" />,
  amistad: <Heart className="w-5 h-5" />,
  naturaleza: <TreePine className="w-5 h-5" />,
  espacio: <Star className="w-5 h-5" />,
  animales: <Cat className="w-5 h-5" />,
  noche: <Moon className="w-5 h-5" />,
  fantasia: <Sparkles className="w-5 h-5" />,
  custom: <Paintbrush className="w-5 h-5" />,
};

const THEME_COLORS: Record<string, string> = {
  aventura: "from-amber-400/20 to-orange-400/20 text-amber-600",
  amistad: "from-pink-400/20 to-rose-400/20 text-pink-500",
  naturaleza: "from-emerald-400/20 to-green-400/20 text-emerald-600",
  espacio: "from-indigo-400/20 to-violet-400/20 text-indigo-500",
  animales: "from-orange-400/20 to-amber-400/20 text-orange-500",
  noche: "from-blue-400/20 to-indigo-400/20 text-blue-500",
  fantasia: "from-purple-400/20 to-fuchsia-400/20 text-purple-500",
  custom: "from-gray-400/20 to-slate-400/20 text-gray-500",
};

const TOTAL_STEPS = 3;
const STEP_META = [
  { label: "Protagonista" },
  { label: "Historia" },
  { label: "Estilo" },
];

export default function CrearCuentoPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { usage } = useUsage();
  const [paywallGate, setPaywallGate] = useState<GateResult | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [step, setStep] = useState(1);

  const [childName, setChildName] = useState("");
  const [childAgeGroup, setChildAgeGroup] = useState("");
  const [theme, setTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [tone, setTone] = useState("tierno");
  const [length, setLength] = useState("corto");
  const [mascota, setMascota] = useState("");
  const [colorFavorito, setColorFavorito] = useState("");
  const [artStyle, setArtStyle] = useState("watercolor");
  const [colorPalette, setColorPalette] = useState("warm");
  const [authorName, setAuthorName] = useState("");
  const [dedication, setDedication] = useState("");
  const [stepDirection, setStepDirection] = useState<"forward" | "back">("forward");

  useEffect(() => {
    if (session?.user?.name && !authorName) {
      setAuthorName(session.user.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  useEffect(() => {
    if (usage?.planType === "premium") {
      fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ length }),
      })
        .then((r) => r.json())
        .then((d) => setEstimatedCost(d.totalCost))
        .catch(() => {});
    }
  }, [length, usage?.planType]);

  const isPremium = usage?.planType === "premium";

  const handleSelectLength = (val: string) => {
    const l = LENGTHS.find((x) => x.value === val);
    if (l?.premium && !isPremium) {
      setPaywallGate({ allowed: false, reason: "premium_length", paywallType: "upgrade" });
      return;
    }
    setLength(val);
  };

  const handleSelectArtStyle = (val: string) => {
    const s = ART_STYLES.find((x) => x.value === val);
    if (s?.premium && !isPremium) {
      setPaywallGate({ allowed: false, reason: "premium_style", paywallType: "upgrade" });
      return;
    }
    setArtStyle(val);
  };

  const canAdvanceStep1 = childName.trim() !== "" && childAgeGroup !== "";
  const canAdvanceStep2 = theme !== "" && (theme !== "custom" || customTheme.trim() !== "");

  const nextStep = () => {
    if (step < TOTAL_STEPS) { setStepDirection("forward"); setStep(step + 1); }
  };
  const prevStep = () => {
    if (step > 1) { setStepDirection("back"); setStep(step - 1); }
  };

  const goToStep = (target: number) => {
    if (target === step) return;
    setStepDirection(target > step ? "forward" : "back");
    if (target < step) { setStep(target); return; }
    if (target === 2 && canAdvanceStep1) setStep(2);
    if (target === 3 && canAdvanceStep1 && canAdvanceStep2) setStep(3);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const finalTheme = theme === "custom" ? customTheme : theme;
    if (!finalTheme) {
      setError("Selecciona o escribe un tema");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName,
          childAgeGroup,
          theme: finalTheme,
          tone,
          length,
          artStyle,
          colorPalette,
          authorName: authorName || undefined,
          dedication: dedication || undefined,
          traits: {
            ...(mascota && { mascota }),
            ...(colorFavorito && { colorFavorito }),
            artStyle: ART_STYLES.find(s => s.value === artStyle)?.prompt,
            colorPalette: COLOR_PALETTES.find(p => p.value === colorPalette)?.prompt,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.gate) {
          setPaywallGate(data.gate);
          setLoading(false);
          return;
        }
        setError(data.error || "Error al crear cuento");
        setLoading(false);
        return;
      }

      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: data.storyId }),
      });

      router.push(`/generando/${data.storyId}`);
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-2">
      {paywallGate && (
        <Paywall gate={paywallGate} onClose={() => setPaywallGate(null)} />
      )}

      {/* ── Compact header: title + badge + step bar ── */}
      <div className="wizard-header-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-gradient flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-brand-500 animate-wand-magic" />
            Nuevo cuento
          </h1>
          {usage && (
            <div>
              {isPremium ? (
                <span className="badge-premium !text-[10px] sm:!text-xs">
                  <Crown className="w-3 h-3" />
                  {usage.totalCreditsAvailable} cr
                </span>
              ) : usage.freeRemaining > 0 ? (
                <span className="badge-success !text-[10px] sm:!text-xs">
                  {usage.freeRemaining} gratis
                </span>
              ) : (
                <span className="badge-warning !text-[10px] sm:!text-xs">
                  Sin cuentos
                </span>
              )}
            </div>
          )}
        </div>

        {/* Step bar — minimal horizontal pills */}
        <div className="flex gap-1.5">
          {STEP_META.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToStep(i + 1)}
              className={`wizard-pill ${
                step === i + 1
                  ? "wizard-pill-active"
                  : step > i + 1
                    ? "wizard-pill-done"
                    : "wizard-pill-pending"
              }`}
            >
              {step > i + 1 && <Check className="w-3 h-3" />}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="wizard-progress-track mt-3">
          <div
            className="wizard-progress-bar"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-700 rounded-2xl px-4 py-3 mb-4 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ═══════ STEP 1: Protagonist ═══════ */}
      {step === 1 && (
        <div key="step-1" className={`card wizard-card ${stepDirection === "forward" ? "wizard-card-forward" : "wizard-card-back"}`}>
          <div className="space-y-4">
            {/* Child name — floating label */}
            <div className="floating-field">
              <input
                type="text"
                id="childName"
                className="floating-input"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder=" "
                required
                maxLength={30}
              />
              <label htmlFor="childName" className="floating-label">
                Nombre del protagonista *
              </label>
            </div>

            {/* Age — visual cards */}
            <div>
              <p className="wizard-section-label">Edad *</p>
              <div className="grid grid-cols-2 gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    type="button"
                    key={ag.value}
                    onClick={() => setChildAgeGroup(ag.value)}
                    className={`wizard-option-card ${
                      childAgeGroup === ag.value ? "wizard-option-selected" : ""
                    }`}
                  >
                    <span className="text-sm font-heading font-bold">{ag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional fields inline */}
            <div className="grid grid-cols-2 gap-3">
              <div className="floating-field">
                <input
                  type="text"
                  id="mascota"
                  className="floating-input"
                  value={mascota}
                  onChange={(e) => setMascota(e.target.value)}
                  placeholder=" "
                  maxLength={30}
                />
                <label htmlFor="mascota" className="floating-label">
                  <PawPrint className="w-3 h-3 inline mr-1" />
                  Mascota
                </label>
              </div>
              <div className="floating-field">
                <input
                  type="text"
                  id="colorFav"
                  className="floating-input"
                  value={colorFavorito}
                  onChange={(e) => setColorFavorito(e.target.value)}
                  placeholder=" "
                  maxLength={30}
                />
                <label htmlFor="colorFav" className="floating-label">
                  Color favorito
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="button"
              onClick={nextStep}
              disabled={!canAdvanceStep1}
              className="btn-primary flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2: Story ═══════ */}
      {step === 2 && (
        <div key="step-2" className={`card wizard-card ${stepDirection === "forward" ? "wizard-card-forward" : "wizard-card-back"}`}>
          <div className="space-y-5">
            {/* Theme — visual grid with icons and colors */}
            <div>
              <p className="wizard-section-label">Tema del cuento *</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`wizard-theme-card ${
                      theme === t.value ? "wizard-theme-selected" : ""
                    }`}
                  >
                    <span className={`wizard-theme-icon-bg bg-gradient-to-br ${THEME_COLORS[t.value] || "from-gray-400/20 to-gray-400/20 text-gray-500"}`}>
                      {THEME_ICONS[t.value] || <Sparkles className="w-5 h-5" />}
                    </span>
                    <span className="text-[11px] font-heading font-bold leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
              {theme === "custom" && (
                <div className="floating-field mt-3">
                  <input
                    type="text"
                    id="customTheme"
                    className="floating-input"
                    value={customTheme}
                    onChange={(e) => setCustomTheme(e.target.value)}
                    placeholder=" "
                    maxLength={100}
                    required
                  />
                  <label htmlFor="customTheme" className="floating-label">
                    Escribe tu tema personalizado
                  </label>
                </div>
              )}
            </div>

            {/* Tone + Length side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="wizard-section-label">Tono</p>
                <div className="flex gap-2 flex-wrap">
                  {TONES.map((t) => (
                    <label
                      key={t.value}
                      className={tone === t.value ? "chip-selected" : "chip-default"}
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
                <p className="wizard-section-label">Largo</p>
                <div className="flex gap-2 flex-wrap">
                  {LENGTHS.map((l) => (
                    <label
                      key={l.value}
                      className={
                        length === l.value
                          ? "chip-selected"
                          : l.premium && !isPremium
                            ? "chip-locked"
                            : "chip-default"
                      }
                      onClick={() => handleSelectLength(l.value)}
                    >
                      <input
                        type="radio"
                        name="length"
                        value={l.value}
                        checked={length === l.value}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      {l.label}
                      {l.premium && !isPremium && (
                        <span className="ml-1 badge-premium !text-[9px] !px-1 !py-0">
                          <Crown className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-5">
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Atras
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={!canAdvanceStep2}
              className="btn-primary flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 3: Style & Book info ═══════ */}
      {step === 3 && (
        <div key="step-3" className={`card wizard-card ${stepDirection === "forward" ? "wizard-card-forward" : "wizard-card-back"}`}>
          <div className="space-y-5">
            {/* Art style + Color palette side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="wizard-section-label">Ilustracion</p>
                <div className="flex gap-2 flex-wrap">
                  {ART_STYLES.map((s) => (
                    <label
                      key={s.value}
                      className={
                        artStyle === s.value
                          ? "chip-selected"
                          : s.premium && !isPremium
                            ? "chip-locked"
                            : "chip-default"
                      }
                      onClick={() => handleSelectArtStyle(s.value)}
                    >
                      <input
                        type="radio"
                        name="artStyle"
                        value={s.value}
                        checked={artStyle === s.value}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      {s.label}
                      {s.premium && !isPremium && (
                        <span className="ml-1 badge-premium !text-[9px] !px-1 !py-0">
                          <Crown className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="wizard-section-label">Colores</p>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTES.map((p) => (
                    <label
                      key={p.value}
                      className={colorPalette === p.value ? "chip-selected" : "chip-default"}
                    >
                      <input
                        type="radio"
                        name="colorPalette"
                        value={p.value}
                        checked={colorPalette === p.value}
                        onChange={(e) => setColorPalette(e.target.value)}
                        className="sr-only"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Book info — author & dedication */}
            <div className="border-t border-brand-100 pt-4">
              <p className="wizard-section-label">Portada del libro</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="floating-field">
                  <input
                    type="text"
                    id="authorName"
                    className="floating-input"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder=" "
                    maxLength={50}
                  />
                  <label htmlFor="authorName" className="floating-label">
                    Autor/a
                  </label>
                </div>
                <div className="floating-field">
                  <input
                    type="text"
                    id="dedication"
                    className="floating-input"
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    placeholder=" "
                    maxLength={100}
                  />
                  <label htmlFor="dedication" className="floating-label">
                    Dedicatoria
                  </label>
                </div>
              </div>
            </div>

            {isPremium && estimatedCost !== null && (
              <div className="card-premium !p-3 text-sm text-brand-700 flex items-center gap-2">
                <Crown className="w-4 h-4 flex-shrink-0" />
                Costara aprox. <strong>{estimatedCost} creditos</strong>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-5">
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Atras
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary text-base !py-3 flex items-center gap-2"
              disabled={loading || (!isPremium && usage !== null && usage.freeRemaining <= 0)}
            >
              <Wand2 className="w-5 h-5" />
              {loading ? "Creando..." : "Crear cuento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
