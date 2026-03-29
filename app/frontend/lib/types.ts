// Tipos basados en la API del backend E4

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BaseResponse<T> {
  success: boolean
  data: T
  meta?: {
    timestamp: string
    request_id: string
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: Pagination
}

// Restaurant
export interface Restaurant {
  id: string
  owner_id: string
  name: string
  description?: string
  cuisine_type?: string
  address: string
  city: string
  country: string
  zip_code?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  cover_image_url?: string
  average_rating: number
  total_reviews: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RestaurantHour {
  day_of_week: number // 0 = Domingo, 6 = Sábado
  open_time?: string
  close_time?: string
  is_closed: boolean
}

export interface RestaurantWithHours extends Restaurant {
  hours?: RestaurantHour[]
}

// Menu Categories
export interface MenuCategory {
  id: string
  restaurant_id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
}

// Products
export interface Product {
  id: string
  restaurant_id: string
  category_id?: string
  name: string
  description?: string
  price: number
  currency: string
  image_url?: string
  is_available: boolean
  preparation_time?: number
  calories?: number
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithCategory extends Product {
  category?: MenuCategory
}

// Reviews
export interface Review {
  id: string
  restaurant_id: string
  user_id: string
  order_id?: string
  rating: number // 1-5
  comment?: string
  created_at: string
  updated_at: string
}

export interface RatingStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    rating: number
    count: number
    percentage: number
  }[]
}

// Reservations
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW'

export interface Reservation {
  id: string
  restaurant_id: string
  user_id: string
  table_id?: string
  reservation_date: string
  reservation_time: string
  party_size: number
  special_requests?: string
  status: ReservationStatus
  created_at: string
  updated_at: string
}

// Query params
export interface RestaurantsQuery {
  page?: number
  limit?: number
  sortBy?: 'name' | 'rating' | 'reviews' | 'newest'
  sortOrder?: 'asc' | 'desc'
  cuisine_type?: string
  city?: string
  minRating?: number
  is_active?: boolean
}
