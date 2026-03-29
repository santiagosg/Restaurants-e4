import { HeroSection } from '@/components/home/HeroSection'
import { TestimonialsSection } from '@/components/testimonials/TestimonialsSection'
import { RestaurantCardSkeleton } from '@/components/restaurant/RestaurantCard'

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      {/* Hero Section Mejorada */}
      <HeroSection />

      {/* Featured Restaurants */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Restaurantes Destacados
              </h2>
              <p className="text-gray-600 text-lg">
                Los más populares de la semana
              </p>
            </div>
            <a
              href="/restaurants"
              className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/restaurants"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors border-2 border-blue-200 hover:border-blue-300"
            >
              Ver todos los restaurantes
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works - Mejorado */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En solo 3 simples pasos podrás reservar en el mejor restaurante
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Buscar',
                description: 'Encuentra el restaurante perfecto filtrando por ubicación, tipo de cocina y precio.',
              },
              {
                step: 2,
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Reservar',
                description: 'Selecciona fecha, hora y número de personas. Confirma en segundos.',
              },
              {
                step: 3,
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Disfrutar',
                description: 'Llega al restaurante y disfruta de una experiencia memorable con tu mesa reservada.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative group text-center"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
                )}
                {/* Number circle */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)' }}>
                    <div className="text-blue-100/30">
                      {item.icon}
                    </div>
                    <span className="absolute text-3xl font-extrabold">
                      {item.step}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Final */}
      <section className="py-20" style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            ¿Listo para descubrir tu próximo restaurante favorito?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya disfrutan de la mejor experiencia gastronómica.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/restaurants"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors text-lg"
            >
              Empezar a explorar
            </a>
            <a
              href="#"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors text-lg"
            >
              Como funciona
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}