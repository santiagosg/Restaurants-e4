import Link from 'next/link'
import type { Restaurant } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/ui/RatingStars'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="group bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Imagen */}
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        {restaurant.cover_image_url ? (
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <svg className="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {/* Badge destacado */}
        {restaurant.average_rating >= 4.5 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-yellow-400 text-yellow-900 border-0 font-semibold">
              ★ Top Rated
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 flex-1 pr-2">
            {restaurant.name}
          </h3>
        </div>

        {restaurant.cuisine_type && (
          <Badge variant="secondary" className="mb-3">
            {restaurant.cuisine_type}
          </Badge>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <RatingStars
              rating={restaurant.average_rating}
              size="sm"
              showCount
              count={restaurant.total_reviews}
            />
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-20">{restaurant.city}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Componente Skeleton mejorado
export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse relative">
        <div className="absolute top-3 left-3 h-6 w-20 bg-gray-300 rounded-full animate-pulse" />
      </div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
        <div className="h-5 bg-gray-200 rounded animate-pulse mb-3 w-1/3" />
        <div className="h-px bg-gray-200 animate-pulse mb-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-8" />
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      </div>
    </div>
  )
}