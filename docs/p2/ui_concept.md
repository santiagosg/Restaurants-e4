# UI Concept - Landing del Restaurante (P2)

## Visión General

La landing del restaurante es una página pública que muestra la información completa de un restaurante específico, permitiendo a los usuarios:
- Explorar el menú
- Ver reseñas
- Realizar reservas
- Contactar con el restaurante

---

## Estructura de Secciones

### 1. Hero Section

**Propósito:** Primer impacto visual y CTA principal

**Contenido:**
- Imagen de portada grande (`cover_image_url`)
- Logo del restaurante (`logo_url`)
- Nombre del restaurante
- Rating promedio con estrellas y total de reseñas
- Tipo de cocina
- Botón CTA principal: "Reservar Mesa"
- Botón secundario: "Ver Menú"

**Datos de la API:**
```
GET /restaurants/:id
- name
- cover_image_url
- logo_url
- average_rating
- total_reviews
- cuisine_type
```

---

### 2. Información Básica

**Propósito:** Datos esenciales del restaurante

**Contenido:**
- Descripción del restaurante
- Dirección completa
- Teléfono (clickeable)
- Email (clickeable)
- Sitio web (link externo)
- Horarios de atención (por día de la semana)
- Mapa de ubicación

**Datos de la API:**
```
GET /restaurants/:id/hours
- description
- address
- city
- country
- zip_code
- phone
- email
- website
- hours[] (day_of_week, open_time, close_time, is_closed)
```

---

### 3. Sección de Menú

**Propósito:** Mostrar los productos disponibles del restaurante

**Contenido:**
- Filtros por categoría
- Tags de filtros: Todos, Entrantes, Principales, Postres, Bebidas, etc.
- Grid de tarjetas de productos

**Tarjeta de Producto:**
- Imagen del producto
- Nombre
- Descripción
- Precio
- Badges: Vegetariano, Vegano, Sin Gluten
- Tiempo de preparación (opcional)
- Calorías (opcional)

**Datos de la API:**
```
GET /products/restaurant/:restaurantId
- id
- name
- description
- price
- currency
- image_url
- category (name)
- is_available
- is_vegetarian
- is_vegan
- is_gluten_free
- preparation_time
- calories
```

**Estado:**
- Mostrar solo productos con `is_available: true`

---

### 4. Sección de Reseñas

**Propósito:** Social proof y confianza

**Contenido:**
- Rating promedio grande con estrellas
- Total de reseñas
- Distribución de ratings (barra de progreso por estrella: 1★, 2★, 3★, 4★, 5★)
- Lista de reseñas recientes (paginada)

**Tarjeta de Reseña:**
- Nombre del usuario (avatar + nombre)
- Rating en estrellas
- Fecha de la reseña
- Comentario
- Botón "Ver más" para reseñas largas

**Datos de la API:**
```
GET /reviews/restaurant/:restaurantId/average
- average_rating
- total_reviews
- rating_distribution[] (rating, count, percentage)

GET /reviews/restaurant/:restaurantId?limit=6
- id
- rating
- comment
- created_at
- user (full_name)
```

**Acciones:**
- Botón "Cargar más reseñas" (paginación)
- Modal para escribir reseña (requiere autenticación)

---

### 5. Sección de Reserva

**Propósito:** Permitir a los usuarios hacer reservas

**Contenido:**
- Formulario de reserva:
  - Fecha (date picker)
  - Hora (time picker - filtrada por horarios del restaurante)
  - Número de personas (select: 1, 2, 3, 4, 5, 6, 7, 8+)
  - Solicitudes especiales (textarea)
- Información de disponibilidad
- Botón "Confirmar Reserva"

**Validaciones:**
- La fecha debe ser futura
- La hora debe estar dentro del horario del restaurante para ese día
- Número máximo de personas según disponibilidad

**Datos de la API:**
```
POST /reservations
Body:
{
  restaurant_id: string,
  user_id: string, (si autenticado)
  reservation_date: Date,
  reservation_time: Date,
  party_size: number,
  special_requests?: string
}

Respuesta:
{
  id,
  restaurant_id,
  reservation_date,
  reservation_time,
  party_size,
  status: "PENDING",
  created_at
}
```

**Notas:**
- Si el usuario no está autenticado, pedir login antes de reservar
- Mostrar confirmación con número de reserva

---

### 6. Sección de Galeria

**Propósito:** Show visual del ambiente

**Contenido:**
- Grid de imágenes del restaurante
- Carousel de imágenes destacadas
- Lightbox al hacer clic en una imagen

**Datos de la API:**
```
GET /restaurants/:id
- cover_image_url
- logo_url
```

**Nota:** Las imágenes adicionales podrían venir de un campo `gallery_urls` en el futuro.

---

### 7. Footer

**Propósito:** Información adicional y enlaces

**Contenido:**
- Links: Inicio, Menú, Reseñas, Contacto
- Redes sociales (iconos)
- Información legal: Política de privacidad, Términos de servicio
- Copyright

**Datos de la API:**
```
GET /restaurants/:id
- website
- email
- phone
```

---

## Componentes Reutilizables

### RatingDisplay
- Muestra rating con estrellas (1-5)
- Opcional: número de reseñas

### ProductCard
- Tarjeta de producto para el menú
- Responsive: 1 columna (mobile), 2-3 columnas (desktop)

### ReviewCard
- Tarjeta de reseña
- Avatar + nombre del usuario
- Rating + comentario + fecha

### Modal
- Para reserva completada
- Para escribir reseña
- Para lightbox de galería

### DatePicker
- Date picker personalizado
- Bloquear fechas pasadas

### TimePicker
- Time picker filtrado por horarios del restaurante

---

## Estado Global (Context)

### RestaurantContext
- `restaurant: RestaurantResponseDto` - Datos del restaurante
- `menu: ProductWithCategoryDto[]` - Menú del restaurante
- `reviews: ReviewResponseDto[]` - Reseñas
- `ratingStats: RatingStats` - Estadísticas de ratings
- `loading: boolean` - Estado de carga

### FilterContext
- `selectedCategory: string | null` - Categoría seleccionada
- `priceRange: [number, number]` - Rango de precios
- `dietaryFilters: string[]` - Filtros dietéticos (vegano, vegetariano, gluten-free)

### AuthContext
- `user: User | null` - Usuario autenticado
- `isAuthenticated: boolean` - Estado de autenticación

---

## Mapeo de Endpoints por Sección

| Sección | Endpoint | Método | Uso |
|---------|----------|--------|-----|
| Hero | `/restaurants/:id` | GET | Datos principales |
| Info Básica | `/restaurants/:id/hours` | GET | Horarios |
| Menú | `/products/restaurant/:restaurantId` | GET | Productos |
| Reseñas | `/reviews/restaurant/:restaurantId/average` | GET | Stats |
| Reseñas | `/reviews/restaurant/:restaurantId` | GET | Lista |
| Reserva | `/reservations` | POST | Crear reserva |

---

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Adaptaciones
- Mobile:
  - Menú en acordeón por categoría
  - Grid de 1 columna
  - Botón flotante de reserva (FAB)
- Tablet:
  - Grid de 2 columnas
  - Menú lateral
- Desktop:
  - Grid de 3 columnas
  - Layout de ancho completo

---

## Accesibilidad

- Navegación por teclado
- Texto alternativo para imágenes
- Contraste de colores mínimo AA
- Etiquetas ARIA para elementos interactivos
- Focus visible en todos los elementos interactivos

---

## Optimización

- Lazy loading de imágenes
- Skeleton screens durante carga
- Caching de respuestas de API
- Paginación para listas grandes
- Optimización de imágenes (WebP)
- Code splitting por sección

---

## Futuras Extensiones

- Sistema de favoritos para usuarios autenticados
- Notificaciones de disponibilidad
- Integración con Google Maps
- Chat en vivo con el restaurante
- Sistema de pedidos (takeout/delivery)
- Promociones y descuentos
- Reserva de eventos especiales
