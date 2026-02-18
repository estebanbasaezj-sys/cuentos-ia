import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SofiaLogo from "@/components/SofiaLogo";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_15%_20%,rgba(45,212,191,0.22),transparent_55%),radial-gradient(ellipse_at_85%_10%,rgba(251,191,36,0.25),transparent_50%),linear-gradient(180deg,#fffdf7_0%,#fff7ed_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_45%,rgba(147,51,234,0.06)_100%)]" />

        <section className="mx-auto flex min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] max-w-6xl flex-col items-center justify-center px-5 py-10 text-center">
          <div className="animate-fade-in mb-7">
            <SofiaLogo size="large" />
          </div>

          <div className="relative w-[300px] sm:w-[360px] md:w-[400px] mb-8 animate-fade-in [animation-delay:0.1s]">
            <div className="absolute -inset-8 rounded-full bg-brand-400/20 blur-3xl animate-blob" />
            <div className="absolute -inset-6 rounded-full bg-amber-300/25 blur-2xl animate-blob [animation-delay:2s]" />

            <div className="relative aspect-[3/4] overflow-hidden rounded-[2.2rem] border border-white/70 shadow-[0_24px_60px_rgba(41,37,36,0.28)]">
              <div className="absolute inset-0 bg-[linear-gradient(165deg,#7e22ce_0%,#b45309_52%,#1f2937_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.22),transparent_42%),radial-gradient(circle_at_75%_80%,rgba(45,212,191,0.25),transparent_35%)]" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.07)_0,rgba(255,255,255,0.07)_2px,transparent_2px,transparent_10px)] opacity-30" />

              <div className="relative z-10 flex h-full flex-col px-8 py-10 text-white">
                <span className="text-[11px] tracking-[0.35em] uppercase text-white/80 font-heading">
                  Cuento Personalizado
                </span>
                <h1 className="mt-6 text-3xl sm:text-4xl leading-tight font-display">
                  La Caratula
                  <br />
                  de Su Historia
                </h1>
                <p className="mt-5 text-sm sm:text-base text-white/85 leading-relaxed">
                  Un cuento unico, ilustrado y narrado para crear recuerdos en familia.
                </p>

                <div className="mt-auto rounded-2xl border border-white/35 bg-black/20 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/75 font-heading">Creado con Sofia</p>
                  <p className="text-sm mt-1 text-white/95">Edicion especial para tu hogar</p>
                </div>
              </div>
            </div>
          </div>

          <p className="animate-fade-in [animation-delay:0.2s] max-w-xl text-gray-600 leading-relaxed mb-6">
            Empieza en menos de 2 minutos y genera el primer cuento gratis.
          </p>

          <div className="animate-fade-in [animation-delay:0.3s] flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary flex-1 !py-3.5 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Empezar gratis
            </Link>
            <Link href="/login" className="btn-secondary flex-1 !py-3.5 flex items-center justify-center gap-2">
              Entrar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
