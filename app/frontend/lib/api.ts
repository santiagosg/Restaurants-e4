import type {
  BaseResponse,
  PaginatedResponse,
  Restaurant,
  RestaurantWithHours,
  ProductWithCategory,
  RestaurantsQuery,
} from './types'

// Configuración de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Tipo de error personalizado
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Cliente HTTP base
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Verificar si la respuesta es OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        errorData?.message || `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Error de red u otro error
    throw new ApiError(
      error instanceof Error ? error.message : 'Error de conexión',
      undefined,
      error
    )
  }
}

// ============================================================================
// RESTAURANTS
// ============================================================================

/**
 * Obtiene una lista paginada de restaurantes
 *
 * @param query - Parámetros de consulta opcionales
 * @returns Lista paginada de restaurantes
 */
export async function getRestaurants(
  query: RestaurantsQuery = {}
): Promise<PaginatedResponse<Restaurant>> {
  const queryParams = new URLSearchParams()

  // Parámetros de paginación
  if (query.page) queryParams.append('page', query.page.toString())
  if (query.limit) queryParams.append('limit', query.limit.toString())

  // Parámetros de ordenamiento
  if (query.sortBy) queryParams.append('sortBy', query.sortBy)
  if (query.sortOrder) queryParams.append('sortOrder', query.sortOrder)

  // Filtros
  if (query.cuisine_type) queryParams.append('cuisine_type', query.cuisine_type)
  if (query.city) queryParams.append('city', query.city)
  if (query.minRating) queryParams.append('minRating', query.minRating.toString())

  // Solo restaurantes activos por defecto
  if (query.is_active !== false) {
    queryParams.append('is_active', 'true')
  }

  const queryString = queryParams.toString()
  const endpoint = `/restaurants${queryString ? `?${queryString}` : ''}`

  return fetchAPI<PaginatedResponse<Restaurant>>(endpoint)
}

/**
 * Obtiene un restaurante por su ID
 *
 * @param id - ID del restaurante
 * @returns Datos del restaurante
 */
export async function getRestaurantById(
  id: string
): Promise<BaseResponse<Restaurant>> {
  if (!id) {
    throw new ApiError('El ID del restaurante es requerido', 400)
  }

  return fetchAPI<BaseResponse<Restaurant>>(`/restaurants/${id}`)
}

/**
 * Obtiene un restaurante con sus horarios
 *
 * @param id - ID del restaurante
 * @returns Datos del restaurante con horarios
 */
export async function getRestaurantWithHours(
  id: string
): Promise<BaseResponse<RestaurantWithHours>> {
  if (!id) {
    throw new ApiError('El ID del restaurante es requerido', 400)
  }

  return fetchAPI<BaseResponse<RestaurantWithHours>>(`/restaurants/${id}/hours`)
}

// ============================================================================
// MENU / PRODUCTS
// ============================================================================

/**
 * Obtiene el menú completo de un restaurante
 *
 * @param restaurantId - ID del restaurante
 * @returns Menú del restaurante
 */
export async function getMenuByRestaurantId(
  restaurantId: string
): Promise<BaseResponse<ProductWithCategory[]>> {
  if (!restaurantId) {
    throw new ApiError('El ID del restaurante es requerido', 400)
  }

  return fetchAPI<BaseResponse<ProductWithCategory[]>>(
    `/products/restaurant/${restaurantId}`
  )
}

/**
 * Obtiene un producto por su ID
 *
 * @param id - ID del producto
 * @returns Datos del producto
 */
export async function getProductById(id: string): Promise<BaseResponse<ProductWithCategory>> {
  if (!id) {
    throw new ApiError('El ID del producto es requerido', 400)
  }

  return fetchAPI<BaseResponse<ProductWithCategory>>(`/products/${id}`)
}

// ============================================================================
// REVIEWS
// ============================================================================

/**
 * Obtiene las estadísticas de ratings de un restaurante
 *
 * @param restaurantId - ID del restaurante
 * @returns Estadísticas de ratings
 */
export async function getRestaurantRatingStats(restaurantId: string) {
  if (!restaurantId) {
    throw new ApiError('El ID del restaurante es requerido', 400)
  }

  return fetchAPI(
    `/reviews/restaurant/${restaurantId}/average`
  )
}

/**
 * Obtiene las reseñas de un restaurante
 *
 * @param restaurantId - ID del restaurante
 * @param page - Página a obtener (opcional)
 * @param limit - Límite de resultados (opcional)
 * @returns Lista paginada de reseñas
 */
export async function getRestaurantReviews(
  restaurantId: string,
  page = 1,
  limit = 6
) {
  if (!restaurantId) {
    throw new ApiError('El ID del restaurante es requerido', 400)
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  return fetchAPI(
    `/reviews/restaurant/${restaurantId}?${queryParams.toString()}`
  )
}

// ============================================================================
// RESERVATIONS
// ============================================================================

/**
 * Crea una nueva reserva
 *
 * @param data - Datos de la reserva
 * @returns Datos de la reserva creada
 */
export async function createReservation(data: {
  restaurant_id: string
  user_id?: string
  reservation_date: string
  reservation_time: string
  party_size: number
  special_requests?: string
}) {
  return fetchAPI('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Obtiene las reservas de un usuario
 *
 * @param userId - ID del usuario
 * @returns Lista de reservas del usuario
 */
export async function getUserReservations(userId: string) {
  if (!userId) {
    throw new ApiError('El ID del usuario es requerido', 400)
  }

  return fetchAPI(`/reservations/user/${userId}`)
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Verifica si un error es un ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Obtiene un mensaje de error amigable para mostrar al usuario
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    // Si es un error de la API, usamos el mensaje del error o un default según el status
    if (error.status === 404) {
      return 'El recurso solicitado no fue encontrado'
    }
    if (error.status === 500) {
      return 'Error en el servidor. Por favor, intenta más tarde'
    }
    if (error.status === 401) {
      return 'No estás autorizado para realizar esta acción'
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado'
}
