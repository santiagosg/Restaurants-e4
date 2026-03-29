import type { ProductWithCategory } from '@/lib/types'

interface ProductCardProps {
  product: ProductWithCategory
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* Imagen */}
      <div className="aspect-video bg-gray-100 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.is_vegetarian && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Veg
            </span>
          )}
          {product.is_vegan && (
            <span className="bg-green-700 text-white text-xs px-2 py-0.5 rounded-full">
              Vegan
            </span>
          )}
          {product.is_gluten_free && (
            <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">
              GF
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.preparation_time && (
            <span className="text-xs text-gray-500">
              {product.preparation_time} min
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Skeleton para ProductCard
export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
      </div>
    </div>
  )
}
