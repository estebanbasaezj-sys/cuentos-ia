import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">📖✨</div>
          <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">
            Cuentos mágicos para tus hijos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crea cuentos infantiles personalizados con inteligencia artificial.
            Texto único, ilustraciones hermosas y recuerdos para toda la vida.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-primary text-lg !py-3 !px-8">
              Empezar gratis
            </Link>
            <a href="#como-funciona" className="btn-secondary text-lg !py-3 !px-8">
              ¿Cómo funciona?
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">1 cuento gratuito al día. Sin tarjeta de crédito.</p>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">
              ¿Cómo funciona?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "✏️", title: "1. Personaliza", desc: "Ingresa el nombre de tu hijo/a, elige un tema, tono y detalles especiales como su mascota favorita." },
                { icon: "🤖", title: "2. La IA crea", desc: "Nuestra inteligencia artificial escribe un cuento único con ilustraciones hermosas en menos de 2 minutos." },
                { icon: "📚", title: "3. Disfruta", desc: "Lee el cuento, edítalo si quieres, descárgalo en PDF o compártelo con la familia." },
              ].map((step) => (
                <div key={step.title} className="card text-center">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold text-purple-700 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">
              Todo lo que necesitas
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: "🎨", title: "Ilustraciones únicas", desc: "Cada cuento incluye 4-6 ilustraciones generadas con IA, estilo acuarela infantil." },
                { icon: "📄", title: "Descarga en PDF", desc: "Descarga cuentos con portada y diseño profesional para imprimir o guardar." },
                { icon: "🔗", title: "Comparte con la familia", desc: "Genera links privados con expiración para compartir con abuelos y tíos." },
                { icon: "🛡️", title: "Seguro para niños", desc: "Filtros de contenido automáticos. Sin violencia, sin contenido inapropiado." },
                { icon: "✍️", title: "Edita a tu gusto", desc: "Modifica el texto generado y regenera ilustraciones para páginas específicas." },
                { icon: "📱", title: "Desde cualquier dispositivo", desc: "Funciona en celular, tablet y computador. Diseño responsive." },
              ].map((f) => (
                <div key={f.title} className="card flex gap-4 items-start">
                  <span className="text-3xl">{f.icon}</span>
                  <div>
                    <h3 className="font-bold text-purple-700 mb-1">{f.title}</h3>
                    <p className="text-gray-600 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-purple-700 py-16 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Crea el primer cuento de tu hijo hoy</h2>
            <p className="text-purple-200 mb-8">
              Es gratis. Toma menos de 2 minutos. Y será un recuerdo inolvidable.
            </p>
            <Link href="/register" className="bg-white text-purple-700 font-bold py-3 px-8 rounded-xl hover:bg-purple-50 transition-colors text-lg inline-block">
              Crear mi primer cuento
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-orange-100 py-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Cuentos IA. Hecho con amor para familias.</p>
        </footer>
      </main>
    </>
  );
}
