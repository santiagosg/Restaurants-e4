import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gray-900">
        <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(to bottom right, #1e3a8a, #581c87, #be185d)' }} />
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white space-y-8">
            <Badge className="inline-flex items-center gap-2 bg-white/10 text-white border-white/20 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              Más de 500 restaurantes disponibles
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Descubre los mejores{' '}
              <span style={{
                background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}>
                restaurantes
              </span>
              <br />
              de tu ciudad
            </h1>

            <p className="text-xl text-gray-200 max-w-lg leading-relaxed">
              Reserva tu mesa en segundos. Sin llamadas, sin esperas.
              Simplemente encuentra, reserva y disfruta.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-6 border-y border-white/10">
              {[
                { value: '10K+', label: 'Usuarios' },
                { value: '4.8', label: '★ Rating' },
                { value: '500+', label: 'Restaurantes' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/restaurants" className="flex-1">
                <Button size="lg" className="w-full h-14 text-base">
                  Explorar Restaurantes
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="flex-1 h-14 text-base border-white/30 text-white hover:bg-white/10">
                Crear Cuenta Gratis
              </Button>
            </div>
          </div>

          {/* Right - Search Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">
              Encuentra tu restaurante ideal
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ¿Qué estás buscando?
                </label>
                <Input
                  type="text"
                  placeholder="Nombre del restaurante o tipo de cocina..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ciudad
                  </label>
                  <select className="w-full h-10 rounded-lg border-2 border-white/20 bg-white/10 text-white px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400">
                    <option value="">Todas las ciudades</option>
                    <option value="Madrid">Madrid</option>
                    <option value="Barcelona">Barcelona</option>
                    <option value="Valencia">Valencia</option>
                    <option value="Sevilla">Sevilla</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de cocina
                  </label>
                  <select className="w-full h-10 rounded-lg border-2 border-white/20 bg-white/10 text-white px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400">
                    <option value="">Todas las cocinas</option>
                    <option value="Italiana">Italiana</option>
                    <option value="Mexicana">Mexicana</option>
                    <option value="Asiática">Asiática</option>
                    <option value="Española">Española</option>
                  </select>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full h-12 text-base">
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar Restaurantes
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom wave - SVG simplificado */}
      <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
        <svg
          className="w-full h-auto min-h-20"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ fill: '#f9fafb' }}
        >
          <path d="M0,60 Q360,30 720,60 T1440,60 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  )
}