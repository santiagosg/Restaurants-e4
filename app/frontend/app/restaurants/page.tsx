import { RestaurantList } from '@/components/restaurant/RestaurantList'
import { getRestaurants, getErrorMessage } from '@/lib/api'
import type { RestaurantsQuery } from '@/lib/types'

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string; cuisine_type?: string; city?: string }
}) {
  // Construir query params
  const query: RestaurantsQuery = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit) : 12,
    is_active: true,
  }

  if (searchParams.cuisine_type) {
    query.cuisine_type = searchParams.cuisine_type
  }

  if (searchParams.city) {
    query.city = searchParams.city
  }

  // Fetch data con error handling
  let restaurants = []
  let error = null

  try {
    const response = await getRestaurants(query)
    restaurants = response.data
  } catch (err) {
    error = getErrorMessage(err)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Restaurantes
          </h1>
          <p className="text-gray-600">
            Descubre los mejores restaurantes de la ciudad
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="search"
                placeholder="Buscar restaurantes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              name="cuisine_type"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las cocinas</option>
              <option value="Italiana">Italiana</option>
              <option value="Mexicana">Mexicana</option>
              <option value="Asiática">Asiática</option>
              <option value="Mediterránea">Mediterránea</option>
              <option value="Española">Española</option>
              <option value="Francesa">Francesa</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Estado de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de restaurantes */}
        <RestaurantList restaurants={restaurants} />

        {/* Paginación */}
        {restaurants.length > 0 && query.page && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              disabled={query.page <= 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
              {query.page}
            </span>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
