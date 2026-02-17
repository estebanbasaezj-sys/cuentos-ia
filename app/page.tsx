import Link from "next/link";
import {
  BookOpen,
  Pencil,
  Wand2,
  Palette,
  FileDown,
  Share2,
  Shield,
  PenTool,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SofiaLogo from "@/components/SofiaLogo";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative pb-20 md:pb-0">
        {/* Background mesh */}
        <div className="fixed inset-0 -z-10 bg-mesh" />

        {/* Hero — compact on mobile, spacious on desktop */}
        <section className="relative max-w-6xl mx-auto px-5 py-14 md:py-24 text-center overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-300/15 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent-teal/10 rounded-full blur-3xl animate-blob [animation-delay:3s]" />

          <div className="animate-fade-in flex justify-center mb-5 md:mb-8">
            <SofiaLogo size="large" />
          </div>

          <h1
            className="animate-fade-in [animation-delay:0.1s] text-3xl md:text-6xl font-display font-bold text-gradient mb-4 md:mb-6 leading-tight"
          >
            Cuentos magicos{"\n"}para tus hijos
          </h1>

          <p
            className="animate-fade-in [animation-delay:0.2s] text-base md:text-xl text-gray-500 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Crea cuentos infantiles personalizados con inteligencia artificial.
            Texto unico, ilustraciones hermosas y recuerdos para toda la vida.
          </p>

          <div
            className="animate-fade-in [animation-delay:0.3s] flex gap-3 md:gap-4 justify-center flex-wrap"
          >
            <Link href="/register" className="btn-primary text-base md:text-lg !py-3 md:!py-3.5 !px-8 md:!px-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Empezar gratis
            </Link>
            <a href="#como-funciona" className="btn-secondary text-base md:text-lg !py-3 md:!py-3.5 !px-8 md:!px-10">
              Como funciona?
            </a>
          </div>

          <p
            className="animate-fade-in [animation-delay:0.4s] mt-4 md:mt-5 text-sm text-gray-400 font-heading"
          >
            1 cuento gratuito a la semana. Sin tarjeta de credito.
          </p>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-14 md:py-24 relative">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-center text-gradient mb-10 md:mb-16">
              Como funciona?
            </h2>
            <div className="grid md:grid-cols-3 gap-5 md:gap-8">
              {[
                { icon: Pencil, title: "1. Personaliza", desc: "Ingresa el nombre de tu hijo/a, elige un tema, tono y detalles especiales como su mascota favorita." },
                { icon: Wand2, title: "2. La IA crea", desc: "Nuestra inteligencia artificial escribe un cuento unico con ilustraciones hermosas en menos de 2 minutos." },
                { icon: BookOpen, title: "3. Disfruta", desc: "Lee el cuento, editalo si quieres, descargalo en PDF o compartelo con la familia." },
              ].map((step) => (
                <div
                  key={step.title}
                  className="card-hover text-center"
                >
                  <div className="icon-container-md mx-auto mb-5">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-14 md:py-24">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-center text-gradient mb-10 md:mb-16">
              Todo lo que necesitas
            </h2>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              {[
                { icon: Palette, title: "Ilustraciones unicas", desc: "Cada cuento incluye 4-8 ilustraciones generadas con IA, estilo acuarela infantil." },
                { icon: FileDown, title: "Descarga en PDF", desc: "Descarga cuentos con portada y diseno profesional para imprimir o guardar." },
                { icon: Share2, title: "Comparte con la familia", desc: "Genera links privados con expiracion para compartir con abuelos y tios." },
                { icon: Shield, title: "Seguro para ninos", desc: "Filtros de contenido automaticos. Sin violencia, sin contenido inapropiado." },
                { icon: PenTool, title: "Edita a tu gusto", desc: "Modifica el texto generado y regenera ilustraciones para paginas especificas." },
                { icon: Smartphone, title: "Desde cualquier dispositivo", desc: "Funciona en celular, tablet y computador. Diseno responsive." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="card flex gap-4 items-start"
                >
                  <div className="icon-container-sm flex-shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-800 mb-1">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — desktop inline, mobile sticky bottom */}
        <section className="hidden md:block py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.15),transparent_50%)]" />
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-5">
              Crea el primer cuento de tu hijo hoy
            </h2>
            <p className="text-brand-200 mb-10 text-lg leading-relaxed">
              Es gratis. Toma menos de 2 minutos. Y sera un recuerdo inolvidable.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-heading font-bold py-3.5 px-10 rounded-2xl hover:bg-cream-100 transition-all duration-300 hover:shadow-glow-purple-lg text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Crear mi primer cuento
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-brand-100">
          <p className="text-gray-400 text-sm font-heading">
            &copy; 2025 Sofia. Hecho con amor para familias.
          </p>
        </footer>

        {/* Mobile sticky CTA — fixed bottom bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/90 backdrop-blur-xl border-t border-brand-100/50" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <Link
            href="/register"
            className="btn-primary w-full text-base !py-3.5 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Empezar gratis
          </Link>
        </div>
      </main>
    </>
  );
}
