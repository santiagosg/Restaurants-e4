import { RestaurantCard, RestaurantCardSkeleton } from './RestaurantCard'
import type { Restaurant } from '@/lib/types'

interface RestaurantListProps {
  restaurants: Restaurant[]
  isLoading?: boolean
}

export function RestaurantList({ restaurants, isLoading = false }: RestaurantListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron restaurantes
        </h3>
        <p className="text-gray-500 text-center max-w-sm">
          Intenta ajustar los filtros de búsqueda para ver resultados.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}
