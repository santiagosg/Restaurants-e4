# Routes - Frontend P2

## Tabla de Contenidos

1. [Home (`/`)](#home)
2. [Restaurantes (`/restaurants`)](#restaurantes)
3. [Detalle de Restaurante (`/restaurants/[id]`)](#detalle-de-restaurante)

---

## Home (`/`)

### Propósito

Página principal de la aplicación que presenta una vista general de la plataforma y permite descubrir restaurantes.

### Datos que Consume

```
GET /restaurants
Query params: limit=6, is_active=true

Respuesta:
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      description?: string,
      cuisine_type?: string,
      city: string,
      cover_image_url?: string,
      logo_url?: string,
      average_rating: number,
      total_reviews: number,
      is_active: boolean
    }
  ],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

### Componentes Principales

```
HomePage
├── Navbar
│   ├── Logo
│   ├── Navigation Links
│   └── AuthButtons (Login/Signup)
├── HeroSection
│   ├── Headline: "Descubre los mejores restaurantes"
│   ├── Subheadline: "Reserva tu mesa en segundos"
│   └── CTA Buttons: "Ver Restaurantes", "Crear Cuenta"
├── FeaturedRestaurants
│   ├── SectionHeader: "Restaurantes Destacados"
│   └── RestaurantGrid (6 items)
├── HowItWorks
│   ├── StepCard: "Buscar"
│   ├── StepCard: "Reservar"
│   └── StepCard: "Disfrutar"
├── CategoriesSection
│   ├── CategoryCard: "Italiana"
│   ├── CategoryCard: "Mexicana"
│   ├── CategoryCard: "Asiática"
│   ├── CategoryCard: "Mediterránea"
│   └── CategoryCard: "Ver todas"
└── Footer
```

### Estados

#### Loading State
```tsx
<FeaturedRestaurants.Skeleton>
  <RestaurantCard.Skeleton /> × 6
</FeaturedRestaurants.Skeleton>
```

#### Error State
```tsx
<FeaturedRestaurants.Error>
  <Alert variant="error" />
  <Button onClick={retry}>Reintentar</Button>
</FeaturedRestaurants.Error>
```

#### Empty State
```tsx
<FeaturedRestaurants.Empty>
  <Illustration type="no-restaurants" />
  <Text>No hay restaurantes disponibles</Text>
</FeaturedRestaurants.Empty>
```

---

## Restaurantes (`/restaurants`)

### Propósito

Página de listado y búsqueda de restaurantes con filtros avanzados.

### Datos que Consume

```
GET /restaurants
Query params:
- page: number (default: 1)
- limit: number (default: 12)
- sortBy: 'name' | 'rating' | 'reviews' | 'newest'
- sortOrder: 'asc' | 'desc'
- cuisine_type?: string
- city?: string
- minRating?: number
- is_active: true

Respuesta:
{
  success: true,
  data: RestaurantResponseDto[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

### Componentes Principales

```
RestaurantsPage
├── Navbar
├── SearchFiltersSidebar
│   ├── SearchInput
│   ├── CuisineTypeFilter (select)
│   ├── CityFilter (select)
│   ├── RatingFilter (range slider)
│   └── ClearFiltersButton
├── RestaurantsGrid
│   └── RestaurantCard (paginado)
├── Pagination
│   ├── PrevButton
│   ├── PageNumbers
│   └── NextButton
└── Footer
```

**RestaurantCard:**
```tsx
interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    description?: string
    cuisine_type?: string
    city: string
    cover_image_url?: string
    logo_url?: string
    average_rating: number
    total_reviews: number
  }
}
```

### Estados

#### Loading State
```tsx
<RestaurantsGrid.Skeleton>
  <RestaurantCard.Skeleton /> × 12
</RestaurantsGrid.Skeleton>
```

#### Error State
```tsx
<RestaurantsGrid.Error>
  <Alert variant="error" message="Error al cargar restaurantes" />
  <Button onClick={retry}>Reintentar</Button>
  <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
</RestaurantsGrid.Error>
```

#### Empty State (con filtros)
```tsx
<RestaurantsGrid.Empty type="filtered">
  <Illustration type="no-results" />
  <Text>No se encontraron restaurantes con estos filtros</Text>
  <Button onClick={clearFilters}>Limpiar filtros</Button>
</RestaurantsGrid.Empty>
```

#### Empty State (sin filtros)
```tsx
<RestaurantsGrid.Empty type="none">
  <Illustration type="no-restaurants" />
  <Text>No hay restaurantes disponibles</Text>
</RestaurantsGrid.Empty>
```

---

## Detalle de Restaurante (`/restaurants/[id]`)

### Propósito

Página completa de un restaurante específico con toda la información, menú, reseñas y formulario de reserva.

### Datos que Consume

```
# Datos del restaurante
GET /restaurants/:id/hours

Respuesta:
{
  success: true,
  data: {
    id, name, description, cuisine_type, address, city, country,
    phone, email, website, logo_url, cover_image_url,
    average_rating, total_reviews, is_active,
    hours: [
      { day_of_week, open_time, close_time, is_closed }
    ]
  }
}

# Menú del restaurante
GET /products/restaurant/:restaurantId

Respuesta:
{
  success: true,
  data: [
    {
      id, name, description, price, currency, image_url,
      category: { id, name },
      is_available, is_vegetarian, is_vegan, is_gluten_free,
      preparation_time, calories
    }
  ]
}

# Estadísticas de reseñas
GET /reviews/restaurant/:restaurantId/average

Respuesta:
{
  success: true,
  data: {
    average_rating: number,
    total_reviews: number,
    rating_distribution: [
      { rating: 5, count: number, percentage: number },
      ...
    ]
  }
}

# Lista de reseñas
GET /reviews/restaurant/:restaurantId?page=1&limit=6

Respuesta:
{
  success: true,
  data: [
    {
      id, rating, comment, created_at,
      user: { full_name }
    }
  ],
  pagination: { total, page, limit, totalPages }
}
```

### Componentes Principales

```
RestaurantDetailPage
├── Navbar (con link de retorno)
├── HeroSection
│   ├── BackgroundImage (cover_image_url)
│   ├── Logo (logo_url)
│   ├── RestaurantInfo
│   │   ├── Name
│   │   ├── CuisineType
│   │   ├── RatingBadge
│   │   └── ReviewsCount
│   └── CTAButtons
│       ├── "Reservar Mesa" (scroll to reserva)
│       └── "Ver Menú" (scroll to menú)
├── RestaurantInfoSection
│   ├── Description
│   ├── ContactCard
│   │   ├── Address (con link a mapa)
│   │   ├── Phone (tel:)
│   │   └── Email (mailto:)
│   ├── HoursCard
│   │   └── HoursList (por día)
│   └── WebsiteLink
├── MenuSection
│   ├── CategoryFilterTabs
│   │   ├── "Todos"
│   │   ├── Category 1
│   │   ├── Category 2
│   │   └── ...
│   └── ProductsGrid
│       └── ProductCard
│           ├── Image
│           ├── Name
│           ├── Description
│           ├── Price
│           ├── DietaryBadges
│           │   ├── Vegetarian
│           │   ├── Vegan
│           │   └── GlutenFree
│           └── PrepTime
├── ReviewsSection
│   ├── RatingSummary
│   │   ├── AverageRating (grande con estrellas)
│   │   ├── TotalReviews
│   │   └── RatingDistribution (barra por estrella)
│   ├── ReviewsList
│   │   └── ReviewCard
│   │       ├── UserAvatar
│   │       ├── UserName
│   │       ├── RatingStars
│   │       ├── Date
│   │       └── Comment
│   ├── LoadMoreButton (si hay más)
│   └── WriteReviewButton (requiere auth)
├── ReservationSection
│   ├── ReservationForm
│   │   ├── DatePicker
│   │   │   └── Validation: fecha futura
│   │   ├── TimePicker
│   │   │   └── Validation: dentro de horarios
│   │   ├── PartySizeSelect (1-8+)
│   │   ├── SpecialRequestsTextArea
│   │   └── SubmitButton
│   └── ReservationModal (al confirmar)
│       ├── SuccessState
│       └── ErrorState
└── Footer
```

### Estados

#### Loading State (page)
```tsx
<RestaurantDetailPage.Skeleton>
  <HeroSection.Skeleton />
  <RestaurantInfoSection.Skeleton />
  <MenuSection.Skeleton />
  <ReviewsSection.Skeleton />
  <ReservationSection.Skeleton />
</RestaurantDetailPage.Skeleton>
```

#### Error State (404)
```tsx
<RestaurantDetailPage.NotFound>
  <Illustration type="not-found" />
  <Text>Restaurante no encontrado</Text>
  <Button to="/restaurants">Ver otros restaurantes</Button>
</RestaurantDetailPage.NotFound>
```

#### Error State (general)
```tsx
<RestaurantDetailPage.Error>
  <Alert variant="error" />
  <Button onClick={retry}>Reintentar</Button>
</RestaurantDetailPage.Error>
```

#### Menu Section - Empty
```tsx
<MenuSection.Empty>
  <Illustration type="empty-menu" />
  <Text>Este restaurante aún no tiene menú disponible</Text>
</MenuSection.Empty>
```

#### Reviews Section - Empty
```tsx
<ReviewsSection.Empty>
  <Text>Aún no hay reseñas para este restaurante</Text>
  <Button onClick={openReviewModal}>¡Sé el primero en opinar!</Button>
</ReviewsSection.Empty>
```

#### Reservation - Success
```tsx
<ReservationModal.Success>
  <Icon type="check-circle" />
  <Heading>¡Reserva confirmada!</Heading>
  <Text>Tu reserva #123456 ha sido creada exitosamente.</Text>
  <ReservationDetails>
    <Detail>Fecha: {date}</Detail>
    <Detail>Hora: {time}</Detail>
    <Detail>Personas: {partySize}</Detail>
  </ReservationDetails>
  <Button onClose>Entendido</Button>
</ReservationModal.Success>
```

#### Reservation - Error
```tsx
<ReservationModal.Error>
  <Icon type="error" />
  <Heading>Error al crear reserva</Heading>
  <Text>Lo sentimos, no pudimos procesar tu reserva.</Text>
  <ErrorMessage>{error}</ErrorMessage>
  <Button variant="outline" onClick={close}>Cerrar</Button>
  <Button onClick={retry}>Reintentar</Button>
</ReservationModal.Error>
```

---

## Notas de Implementación

### React Router v6

```tsx
// App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'restaurants', element: <RestaurantsPage /> },
      { path: 'restaurants/:id', element: <RestaurantDetailPage /> }
    ]
  }
])
```

### Data Fetching Strategy

- **React Query** para caché y estado de loading/error
- **Parallel queries** para endpoints independientes
- **Suspense boundaries** para componentes individuales

### Skeletons Pattern

Cada sección debe tener su propio skeleton para una experiencia de carga gradual.

---

## Componentes Compartidos

| Componente | Uso |
|-----------|-----|
| `Navbar` | Todas las páginas |
| `Footer` | Todas las páginas |
| `RestaurantCard` | Home, RestaurantsPage |
| `RatingBadge` | RestaurantCard, RestaurantDetailPage |
| `Alert` | Todos los estados de error |
| `Modal` | Reservation, Reviews |
| `Skeleton` | Todos los estados de carga |
| `Illustration` | Estados vacíos y de error |