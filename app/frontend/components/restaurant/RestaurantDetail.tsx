import Link from 'next/link'
import type { RestaurantWithHours, RestaurantHour, ProductWithCategory } from '@/lib/types'
import { RestaurantCardSkeleton } from './RestaurantCard'
import { ProductCard } from '../menu/ProductCard'
import { ReviewCard } from '../reviews/ReviewCard'
import { ReservationCard } from '../reservation/ReservationCard'

interface RestaurantDetailProps {
  restaurant: RestaurantWithHours | null
  menu: ProductWithCategory[] | null
  isLoading?: boolean
  error?: string | null
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function HoursDisplay({ hours }: { hours: RestaurantHour[] | undefined }) {
  if (!hours || hours.length === 0) return null

  return (
    <div className="space-y-2">
      {hours.map((hour) => (
        <div key={hour.day_of_week} className="flex justify-between text-sm">
          <span className="text-gray-600">{DAYS[hour.day_of_week]}</span>
          {hour.is_closed ? (
            <span className="text-red-500 font-medium">Cerrado</span>
          ) : (
            <span className="text-gray-900">
              {hour.open_time?.substring(0, 5)} - {hour.close_time?.substring(0, 5)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function RestaurantDetail({ restaurant, menu, isLoading, error }: RestaurantDetailProps) {
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-64 bg-gray-200" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-64 bg-gray-200 rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error || !restaurant) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Restaurante no encontrado'}
          </h2>
          <p className="text-gray-500 mb-6">
            El restaurante que buscas no existe o no está disponible.
          </p>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ver otros restaurantes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="h-64 sm:h-80 relative" style={{ background: 'linear-gradient(to bottom, #2563eb, #1e40af)' }}>
        {restaurant.cover_image_url && (
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 flex items-end p-6 sm:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Link
              href="/restaurants"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a restaurantes
            </Link>
            <div className="bg-white/95 backdrop-blur rounded-xl p-4 sm:p-6 max-w-lg shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                {restaurant.cuisine_type && (
                  <span className="text-sm text-gray-600">{restaurant.cuisine_type}</span>
                )}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {restaurant.average_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({restaurant.total_reviews} reseñas)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
              {restaurant.description && (
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {restaurant.address && (
                  <div>
                    <span className="text-gray-500">Dirección:</span>
                    <p className="text-gray-900">{restaurant.address}</p>
                    <p className="text-gray-600">{restaurant.city}, {restaurant.country}</p>
                  </div>
                )}
                {restaurant.phone && (
                  <div>
                    <span className="text-gray-500">Teléfono:</span>
                    <p className="text-gray-900">
                      <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:underline">
                        {restaurant.phone}
                      </a>
                    </p>
                  </div>
                )}
                {restaurant.email && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="text-gray-900">
                      <a href={`mailto:${restaurant.email}`} className="text-blue-600 hover:underline">
                        {restaurant.email}
                      </a>
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Horarios</h3>
                <HoursDisplay hours={restaurant.hours} />
              </div>
            </section>

            {/* Menú */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Menú</h2>
              {!menu || menu.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Este restaurante aún no tiene menú disponible.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menu.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* Reseñas - Placeholder */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Reseñas</h2>
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-2xl font-bold text-gray-900">
                    {restaurant.average_rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-gray-500 mb-4">
                  {restaurant.total_reviews} reseñas
                </p>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <ReviewCard key={i} />
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Reserva */}
          <div className="lg:col-span-1">
            <ReservationCard />
          </div>
        </div>
      </div>
    </main>
  )
}
