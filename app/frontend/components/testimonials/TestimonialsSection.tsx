import { TestimonialCard } from './TestimonialCard'

const testimonials = [
  {
    name: 'María González',
    role: 'Cliente frecuente',
    content: 'He reservado en más de 50 restaurantes y esta plataforma es, sin duda, la mejor. El proceso es súper rápido y nunca he tenido problemas.',
    rating: 5,
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Propietario de restaurante',
    content: 'Desde que mi restaurante está en la plataforma, las reservas aumentaron un 40%. El sistema es fácil de usar y muy profesional.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Cliente nueva',
    content: 'Descubrí restaurantes increíbles que no conocía. Las reseñas son muy útiles para decidir dónde ir.',
    rating: 4,
  },
  {
    name: 'Pedro Sánchez',
    role: 'Cliente frecuente',
    content: 'La opción de filtrar por tipo de cocina y ciudad me ahorra mucho tiempo. Recomiendo esta app a todos mis amigos.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Más de 10,000 personas ya disfrutan de la mejor experiencia gastronómica
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            { value: '10K+', label: 'Usuarios activos' },
            { value: '500+', label: 'Restaurantes' },
            { value: '50K+', label: 'Reservas' },
            { value: '4.8', label: 'Rating promedio' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}