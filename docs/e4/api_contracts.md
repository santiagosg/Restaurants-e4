# Contratos API REST - Sistema de Restaurantes

## 1. Visión General

Este documento define los contratos REST para todas las operaciones del backend de restaurantes. La API sigue principios RESTful y utiliza:

- **Base URL:** `https://api.restaurants.com/v1`
- **Autenticación:** Bearer Token (JWT)
- **Content-Type:** `application/json`
- **Versionado:** Versionamiento por URL (`/v1/`)

---

## 2. Convenciones Generales

### 2.1. Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Solicitud exitosa (GET, PUT, PATCH) |
| `201` | Created | Recurso creado exitosamente (POST) |
| `204` | No Content | Operación exitosa sin cuerpo de respuesta (DELETE) |
| `400` | Bad Request | Datos de solicitud inválidos |
| `401` | Unauthorized | Token inválido o expirado |
| `403` | Forbidden | Permisos insuficientes |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto con estado existente |
| `422` | Unprocessable Entity | Datos semánticamente inválidos |
| `429` | Too Many Requests | Límite de rate excedido |
| `500` | Internal Server Error | Error del servidor |

### 2.2. Estructura de Respuestas

```json
{
  "success": true|false,
  "data": { ... }|null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }|null
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }|null
}
```

### 2.3. Paginación

Las respuestas listadas incluyen metadata de paginación:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

**Query params de paginación:**
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | integer | 1 | Número de página |
| `per_page` | integer | 20 | Items por página (1-100) |

### 2.4. Ordenamiento

**Query params de ordenamiento:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `sort_by` | string | Campo por el cual ordenar |
| `sort_order` | string | `asc` o `desc` (default: `asc`) |

### 2.5. Filtros Comunes

**Query params de filtros:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `q` | string | Búsqueda general |
| `created_from` | date | Filtrar por fecha desde |
| `created_to` | date | Filtrar por fecha hasta |
| `ids` | string[] | Filtrar por IDs (comma-separated) |

---

## 3. Autenticación

### 3.1. Iniciar Sesión

**POST** `/auth/login`

Autentica un usuario y retorna un token de acceso.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "secure_password123"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "role": "CUSTOMER",
      "is_active": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "Bearer"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Credenciales incorrectas |
| `422` | Email o contraseña faltantes |

---

### 3.2. Registrar Usuario

**POST** `/auth/register`

Registra un nuevo usuario en el sistema.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "role": "CUSTOMER",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "Bearer"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `409` | Email ya registrado |
| `422` | Contraseña no cumple requisitos |

---

### 3.3. Refrescar Token

**POST** `/auth/refresh`

Renueva el token de acceso usando el refresh token.

**Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Refresh token inválido o expirado |
| `422` | Refresh token faltante |

---

### 3.4. Cerrar Sesión

**POST** `/auth/logout`

Invalida el token de acceso actual.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada exitosamente"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |

---

## 4. Usuarios

### 4.1. Obtener Perfil del Usuario

**GET** `/users/me`

Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `404` | Usuario no encontrado |

---

### 4.2. Actualizar Perfil del Usuario

**PATCH** `/users/me`

Actualiza información del perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "full_name": "John Updated Doe",
  "phone": "+1987654321"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Updated Doe",
    "phone": "+1987654321",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T11:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `422` | Datos inválidos |

---

### 4.3. Cambiar Contraseña

**POST** `/users/me/change-password`

Cambia la contraseña del usuario autenticado.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "current_password": "SecurePass123!",
  "new_password": "NewSecurePass456!"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "message": "Contraseña cambiada exitosamente"
  },
  "meta": {
    "timestamp": "2024-01-15T11:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Contraseña actual incorrecta |
| `422` | Nueva contraseña no cumple requisitos |

---

## 5. Restaurantes

### 5.1. Listar Restaurantes

**GET** `/restaurants`

Obtiene una lista paginada de restaurantes activos.

**Query Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | integer | Número de página (default: 1) |
| `per_page` | integer | Items por página (default: 20) |
| `q` | string | Búsqueda por nombre/descripción |
| `city` | string | Filtrar por ciudad |
| `cuisine_type` | string | Tipo de cocina |
| `min_rating` | decimal | Calificación mínima |
| `sort_by` | string | Campo de ordenamiento |
| `sort_order` | string | `asc` o `desc` |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "La Cucina Italiana",
      "description": "Auténtica cocina italiana con ingredientes frescos",
      "cuisine_type": "Italian",
      "address": "123 Calle Principal",
      "city": "Madrid",
      "country": "España",
      "zip_code": "28001",
      "phone": "+34912345678",
      "email": "info@lacucina.com",
      "website": "https://www.lacucina.com",
      "logo_url": "https://cdn.example.com/logos/cucina.png",
      "cover_image_url": "https://cdn.example.com/covers/cucina.jpg",
      "average_rating": 4.5,
      "total_reviews": 150,
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Parámetros de consulta inválidos |

---

### 5.2. Obtener Restaurante por ID

**GET** `/restaurants/{restaurant_id}`

Obtiene los detalles de un restaurante específico.

**Path Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `restaurant_id` | string | ID del restaurante |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "La Cucina Italiana",
    "description": "Auténtica cocina italiana con ingredientes frescos",
    "cuisine_type": "Italian",
    "address": "123 Calle Principal",
    "city": "Madrid",
    "country": "España",
    "zip_code": "28001",
    "phone": "+34912345678",
    "email": "info@lacucina.com",
    "website": "https://www.lacucina.com",
    "logo_url": "https://cdn.example.com/logos/cucina.png",
    "cover_image_url": "https://cdn.example.com/covers/cucina.jpg",
    "average_rating": 4.5,
    "total_reviews": 150,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "owner": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "Mario Rossi",
      "email": "mario@lacucina.com"
    },
    "hours": [
      {
        "day_of_week": 0,
        "open_time": "12:00:00",
        "close_time": "23:00:00",
        "is_closed": false
      },
      {
        "day_of_week": 6,
        "open_time": null,
        "close_time": null,
        "is_closed": true
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `404` | Restaurante no encontrado |

---

### 5.3. Crear Restaurante

**POST** `/restaurants`

Crea un nuevo restaurante (solo para propietarios).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "name": "Nuevo Restaurante",
  "description": "Descripción del restaurante",
  "cuisine_type": "Mexican",
  "address": "456 Avenida Nueva",
  "city": "Barcelona",
  "country": "España",
  "zip_code": "08001",
  "phone": "+34987654321",
  "email": "contacto@nuevo.com",
  "website": "https://www.nuevo.com",
  "logo_url": "https://cdn.example.com/logos/nuevo.png",
  "cover_image_url": "https://cdn.example.com/covers/nuevo.jpg",
  "hours": [
    {
      "day_of_week": 0,
      "open_time": "12:00",
      "close_time": "23:00",
      "is_closed": false
    }
  ]
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "owner_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nuevo Restaurante",
    "description": "Descripción del restaurante",
    "cuisine_type": "Mexican",
    "address": "456 Avenida Nueva",
    "city": "Barcelona",
    "country": "España",
    "zip_code": "08001",
    "phone": "+34987654321",
    "email": "contacto@nuevo.com",
    "website": "https://www.nuevo.com",
    "logo_url": "https://cdn.example.com/logos/nuevo.png",
    "cover_image_url": "https://cdn.example.com/covers/nuevo.jpg",
    "average_rating": 0,
    "total_reviews": 0,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | Usuario sin permisos de propietario |
| `422` | Datos inválidos |

---

### 5.4. Actualizar Restaurante

**PATCH** `/restaurants/{restaurant_id}`

Actualiza información de un restaurante existente (solo propietario).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `restaurant_id` | string | ID del restaurante |

**Body:**

```json
{
  "name": "Restaurante Actualizado",
  "description": "Nueva descripción",
  "phone": "+34999999999"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "owner_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Restaurante Actualizado",
    "description": "Nueva descripción",
    "cuisine_type": "Mexican",
    "address": "456 Avenida Nueva",
    "city": "Barcelona",
    "country": "España",
    "zip_code": "08001",
    "phone": "+34999999999",
    "email": "contacto@nuevo.com",
    "website": "https://www.nuevo.com",
    "logo_url": "https://cdn.example.com/logos/nuevo.png",
    "cover_image_url": "https://cdn.example.com/covers/nuevo.jpg",
    "average_rating": 0,
    "total_reviews": 0,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T11:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Restaurante no encontrado |
| `422` | Datos inválidos |

---

### 5.5. Actualizar Horarios del Restaurante

**PUT** `/restaurants/{restaurant_id}/hours`

Actualiza los horarios de un restaurante.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `restaurant_id` | string | ID del restaurante |

**Body:**

```json
{
  "hours": [
    {
      "day_of_week": 0,
      "open_time": "12:00",
      "close_time": "23:00",
      "is_closed": false
    },
    {
      "day_of_week": 6,
      "open_time": null,
      "close_time": null,
      "is_closed": true
    }
  ]
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "hours": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440001",
        "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
        "day_of_week": 0,
        "open_time": "12:00:00",
        "close_time": "23:00:00",
        "is_closed": false
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440002",
        "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
        "day_of_week": 6,
        "open_time": null,
        "close_time": null,
        "is_closed": true
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T11:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Restaurante no encontrado |

---

## 6. Mesas

### 6.1. Listar Mesas de un Restaurante

**GET** `/restaurants/{restaurant_id}/tables`

Obtiene todas las mesas de un restaurante.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `restaurant_id` | string | ID del restaurante |

**Query Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `is_active` | boolean | Filtrar por estado |
| `min_capacity` | integer | Capacidad mínima |
| `location` | string | Ubicación de la mesa |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "table_number": 1,
      "capacity": 4,
      "location": "Interior",
      "is_active": true
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440002",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "table_number": 2,
      "capacity": 2,
      "location": "Terraza",
      "is_active": true
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T11:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | Sin permisos |
| `404` | Restaurante no encontrado |

---

### 6.2. Crear Mesa

**POST** `/restaurants/{restaurant_id}/tables`

Crea una nueva mesa en el restaurante (solo propietario).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "table_number": 3,
  "capacity": 6,
  "location": "VIP"
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440003",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "table_number": 3,
    "capacity": 6,
    "location": "VIP",
    "is_active": true
  },
  "meta": {
    "timestamp": "2024-01-15T11:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `409` | Número de mesa ya existe |
| `422` | Datos inválidos |

---

### 6.3. Actualizar Mesa

**PATCH** `/restaurants/{restaurant_id}/tables/{table_id}`

Actualiza información de una mesa.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "capacity": 8,
  "location": "Interior VIP",
  "is_active": false
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440003",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "table_number": 3,
    "capacity": 8,
    "location": "Interior VIP",
    "is_active": false
  },
  "meta": {
    "timestamp": "2024-01-15T11:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Mesa no encontrada |

---

### 6.4. Eliminar Mesa

**DELETE** `/restaurants/{restaurant_id}/tables/{table_id}`

Elimina una mesa del restaurante.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (204):**

```
(no content)
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Mesa no encontrada |
| `409` | La mesa tiene reservas activas |

---

## 7. Categorías de Menú

### 7.1. Listar Categorías

**GET** `/restaurants/{restaurant_id}/menu/categories`

Obtiene todas las categorías del menú de un restaurante.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `is_active` | boolean | Filtrar por estado |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Entrantes",
      "description": "Deliciosos platillos para comenzar",
      "display_order": 1,
      "is_active": true
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440002",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Platos Principales",
      "description": "Nuestras especialidades",
      "display_order": 2,
      "is_active": true
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `404` | Restaurante no encontrado |

---

### 7.2. Crear Categoría

**POST** `/restaurants/{restaurant_id}/menu/categories`

Crea una nueva categoría de menú (solo propietario).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "name": "Postres",
  "description": "Dulces finales",
  "display_order": 3
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440003",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Postres",
    "description": "Dulces finales",
    "display_order": 3,
    "is_active": true
  },
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `422` | Datos inválidos |

---

### 7.3. Actualizar Categoría

**PATCH** `/restaurants/{restaurant_id}/menu/categories/{category_id}`

Actualiza una categoría de menú.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "name": "Postres Especiales",
  "display_order": 4,
  "is_active": false
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440003",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Postres Especiales",
    "description": "Dulces finales",
    "display_order": 4,
    "is_active": false
  },
  "meta": {
    "timestamp": "2024-01-15T12:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Categoría no encontrada |

---

### 7.4. Eliminar Categoría

**DELETE** `/restaurants/{restaurant_id}/menu/categories/{category_id}`

Elimina una categoría de menú.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (204):**

```
(no content)
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Categoría no encontrada |
| `409` | La categoría tiene productos asociados |

---

## 8. Productos

### 8.1. Listar Productos

**GET** `/restaurants/{restaurant_id}/menu/products`

Obtiene todos los productos del menú de un restaurante.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `category_id` | string | Filtrar por categoría |
| `is_available` | boolean | Filtrar por disponibilidad |
| `is_vegetarian` | boolean | Productos vegetarianos |
| `is_vegan` | boolean | Productos veganos |
| `is_gluten_free` | boolean | Productos sin gluten |
| `q` | string | Búsqueda por nombre/descripción |
| `sort_by` | string | Campo de ordenamiento |
| `sort_order` | string | `asc` o `desc` |
| `page` | integer | Número de página |
| `per_page` | integer | Items por página |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440001",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "name": "Bruschetta",
      "description": "Pan tostado con tomate y albahaca",
      "price": 8.50,
      "currency": "USD",
      "image_url": "https://cdn.example.com/products/bruschetta.jpg",
      "is_available": true,
      "preparation_time": 15,
      "calories": 180,
      "is_vegetarian": true,
      "is_vegan": true,
      "is_gluten_free": false,
      "created_at": "2024-01-15T12:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Parámetros de consulta inválidos |
| `401` | Token inválido o expirado |
| `404` | Restaurante no encontrado |

---

### 8.2. Obtener Producto por ID

**GET** `/restaurants/{restaurant_id}/menu/products/{product_id}`

Obtiene los detalles de un producto específico.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440001",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Bruschetta",
    "description": "Pan tostado con tomate y albahaca",
    "price": 8.50,
    "currency": "USD",
    "image_url": "https://cdn.example.com/products/bruschetta.jpg",
    "is_available": true,
    "preparation_time": 15,
    "calories": 180,
    "is_vegetarian": true,
    "is_vegan": true,
    "is_gluten_free": false,
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "category": {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "name": "Entrantes"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `404` | Producto no encontrado |

---

### 8.3. Crear Producto

**POST** `/restaurants/{restaurant_id}/menu/products`

Crea un nuevo producto en el menú (solo propietario).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
  "name": "Caprese",
  "description": "Queso mozzarella con tomate y albahaca",
  "price": 9.50,
  "currency": "USD",
  "image_url": "https://cdn.example.com/products/caprese.jpg",
  "is_available": true,
  "preparation_time": 10,
  "calories": 200,
  "is_vegetarian": true,
  "is_vegan": false,
  "is_gluten_free": false
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Caprese",
    "description": "Queso mozzarella con tomate y albahaca",
    "price": 9.50,
    "currency": "USD",
    "image_url": "https://cdn.example.com/products/caprese.jpg",
    "is_available": true,
    "preparation_time": 10,
    "calories": 200,
    "is_vegetarian": true,
    "is_vegan": false,
    "is_gluten_free": false,
    "created_at": "2024-01-15T12:30:00Z",
    "updated_at": "2024-01-15T12:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T12:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Categoría no encontrada |
| `422` | Datos inválidos |

---

### 8.4. Actualizar Producto

**PATCH** `/restaurants/{restaurant_id}/menu/products/{product_id}`

Actualiza información de un producto.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "name": "Caprese Especial",
  "price": 10.50,
  "is_available": false
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "category_id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Caprese Especial",
    "description": "Queso mozzarella con tomate y albahaca",
    "price": 10.50,
    "currency": "USD",
    "image_url": "https://cdn.example.com/products/caprese.jpg",
    "is_available": false,
    "preparation_time": 10,
    "calories": 200,
    "is_vegetarian": true,
    "is_vegan": false,
    "is_gluten_free": false,
    "created_at": "2024-01-15T12:30:00Z",
    "updated_at": "2024-01-15T13:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T13:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Producto no encontrado |
| `422` | Datos inválidos |

---

### 8.5. Eliminar Producto

**DELETE** `/restaurants/{restaurant_id}/menu/products/{product_id}`

Elimina un producto del menú.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (204):**

```
(no content)
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No eres propietario del restaurante |
| `404` | Producto no encontrado |
| `409` | El producto tiene pedidos asociados |

---

## 9. Reservas

### 9.1. Listar Reservas

**GET** `/reservations`

Obtiene una lista paginada de reservas.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `restaurant_id` | string | Filtrar por restaurante |
| `status` | string | Estado de la reserva |
| `date_from` | date | Fecha de inicio |
| `date_to` | date | Fecha fin |
| `page` | integer | Número de página |
| `per_page` | integer | Items por página |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440001",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "table_id": "990e8400-e29b-41d4-a716-446655440001",
      "reservation_date": "2024-02-15",
      "reservation_time": "20:00:00",
      "party_size": 4,
      "special_requests": "Cumpleaños",
      "status": "CONFIRMED",
      "created_at": "2024-01-15T14:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "restaurant": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Nuevo Restaurante"
      },
      "table": {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "table_number": 1,
        "capacity": 4
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 25,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-15T14:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Parámetros de consulta inválidos |
| `401` | Token inválido o expirado |

---

### 9.2. Obtener Reserva por ID

**GET** `/reservations/{reservation_id}`

Obtiene los detalles de una reserva específica.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440001",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "table_id": "990e8400-e29b-41d4-a716-446655440001",
    "reservation_date": "2024-02-15",
    "reservation_time": "20:00:00",
    "party_size": 4,
    "special_requests": "Cumpleaños",
    "status": "CONFIRMED",
    "created_at": "2024-01-15T14:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z",
    "restaurant": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Nuevo Restaurante",
      "address": "456 Avenida Nueva",
      "city": "Barcelona"
    },
    "table": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "table_number": 1,
      "capacity": 4,
      "location": "Interior"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T14:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para ver esta reserva |
| `404` | Reserva no encontrada |

---

### 9.3. Crear Reserva

**POST** `/reservations`

Crea una nueva reserva.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
  "party_size": 4,
  "reservation_date": "2024-02-20",
  "reservation_time": "19:30",
  "special_requests": "Cumpleaños"
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "table_id": "990e8400-e29b-41d4-a716-446655440001",
    "reservation_date": "2024-02-20",
    "reservation_time": "19:30:00",
    "party_size": 4,
    "special_requests": "Cumpleaños",
    "status": "PENDING",
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z",
    "table": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "table_number": 1,
      "capacity": 4
    }
  },
  "meta": {
    "timestamp": "2024-01-15T14:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `404` | Restaurante no encontrado |
| `409` | Mesas no disponibles para la fecha/hora |
| `422` | Datos inválidos |

---

### 9.4. Actualizar Reserva

**PATCH** `/reservations/{reservation_id}`

Actualiza información de una reserva.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "party_size": 6,
  "special_requests": "Cumpleaños - ventana favor"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "table_id": "990e8400-e29b-41d4-a716-446655440003",
    "reservation_date": "2024-02-20",
    "reservation_time": "19:30:00",
    "party_size": 6,
    "special_requests": "Cumpleaños - ventana favor",
    "status": "PENDING",
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T15:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T15:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para modificar esta reserva |
| `404` | Reserva no encontrada |
| `409` | No hay disponibilidad para la nueva fecha/hora |
| `422` | Estado de reserva no permite modificaciones |

---

### 9.5. Cancelar Reserva

**PATCH** `/reservations/{reservation_id}/cancel`

Cancela una reserva existente.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "table_id": "990e8400-e29b-41d4-a716-446655440003",
    "reservation_date": "2024-02-20",
    "reservation_time": "19:30:00",
    "party_size": 6,
    "special_requests": "Cumpleaños - ventana favor",
    "status": "CANCELLED",
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T15:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T15:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para cancelar esta reserva |
| `404` | Reserva no encontrada |
| `409` | La reserva ya está cancelada o completada |

---

## 10. Pedidos

### 10.1. Listar Pedidos

**GET** `/orders`

Obtiene una lista paginada de pedidos.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `restaurant_id` | string | Filtrar por restaurante |
| `status` | string | Estado del pedido |
| `order_type` | string | Tipo de pedido |
| `date_from` | date | Fecha de inicio |
| `date_to` | date | Fecha fin |
| `page` | integer | Número de página |
| `per_page` | integer | Items por página |
| `sort_by` | string | Campo de ordenamiento |
| `sort_order` | string | `asc` o `desc` |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440001",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "reservation_id": null,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "order_number": "ORD-2024-00001",
      "order_type": "DINE_IN",
      "subtotal": 42.00,
      "tax_amount": 4.20,
      "discount_amount": 0,
      "total_amount": 46.20,
      "currency": "USD",
      "status": "CONFIRMED",
      "notes": "Sin cebolla",
      "created_at": "2024-01-15T16:00:00Z",
      "updated_at": "2024-01-15T16:15:00Z",
      "restaurant": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Nuevo Restaurante"
      },
      "items": [
        {
          "id": "ee0e8400-e29b-41d4-a716-446655440001",
          "product_id": "bb0e8400-e29b-41d4-a716-446655440001",
          "quantity": 2,
          "unit_price": 8.50,
          "subtotal": 17.00,
          "special_instructions": null,
          "product": {
            "id": "bb0e8400-e29b-41d4-a716-446655440001",
            "name": "Bruschetta"
          }
        },
        {
          "id": "ee0e8400-e29b-41d4-a716-446655440002",
          "product_id": "bb0e8400-e29b-41d4-a716-446655440003",
          "quantity": 1,
          "unit_price": 25.00,
          "subtotal": 25.00,
          "special_instructions": "Bien cocido",
          "product": {
            "id": "bb0e8400-e29b-41d4-a716-446655440003",
            "name": "Pasta Carbonara"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-15T16:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Parámetros de consulta inválidos |
| `401` | Token inválido o expirado |

---

### 10.2. Obtener Pedido por ID

**GET** `/orders/{order_id}`

Obtiene los detalles de un pedido específico.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440001",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "reservation_id": null,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "ORD-2024-00001",
    "order_type": "DINE_IN",
    "subtotal": 42.00,
    "tax_amount": 4.20,
    "discount_amount": 0,
    "total_amount": 46.20,
    "currency": "USD",
    "status": "CONFIRMED",
    "notes": "Sin cebolla",
    "created_at": "2024-01-15T16:00:00Z",
    "updated_at": "2024-01-15T16:15:00Z",
    "restaurant": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Nuevo Restaurante"
    },
    "items": [
      {
        "id": "ee0e8400-e29b-41d4-a716-446655440001",
        "product_id": "bb0e8400-e29b-41d4-a716-446655440001",
        "quantity": 2,
        "unit_price": 8.50,
        "subtotal": 17.00,
        "special_instructions": null,
        "product": {
          "id": "bb0e8400-e29b-41d4-a716-446655440001",
          "name": "Bruschetta",
          "image_url": "https://cdn.example.com/products/bruschetta.jpg"
        }
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T16:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para ver este pedido |
| `404` | Pedido no encontrado |

---

### 10.3. Crear Pedido

**POST** `/orders`

Crea un nuevo pedido.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
  "order_type": "DINE_IN",
  "items": [
    {
      "product_id": "bb0e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    },
    {
      "product_id": "bb0e8400-e29b-41d4-a716-446655440003",
      "quantity": 1,
      "special_instructions": "Bien cocido"
    }
  ],
  "notes": "Sin cebolla en todo el pedido",
  "reservation_id": "cc0e8400-e29b-41d4-a716-446655440002"
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "reservation_id": "cc0e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "ORD-2024-00002",
    "order_type": "DINE_IN",
    "subtotal": 42.00,
    "tax_amount": 4.20,
    "discount_amount": 0,
    "total_amount": 46.20,
    "currency": "USD",
    "status": "PENDING",
    "notes": "Sin cebolla en todo el pedido",
    "created_at": "2024-01-15T16:30:00Z",
    "updated_at": "2024-01-15T16:30:00Z",
    "items": [
      {
        "id": "ee0e8400-e29b-41d4-a716-446655440003",
        "order_id": "dd0e8400-e29b-41d4-a716-446655440002",
        "product_id": "bb0e8400-e29b-41d4-a716-446655440001",
        "quantity": 2,
        "unit_price": 8.50,
        "subtotal": 17.00,
        "special_instructions": null,
        "product": {
          "id": "bb0e8400-e29b-41d4-a716-446655440001",
          "name": "Bruschetta"
        }
      },
      {
        "id": "ee0e8400-e29b-41d4-a716-446655440004",
        "order_id": "dd0e8400-e29b-41d4-a716-446655440002",
        "product_id": "bb0e8400-e29b-41d4-a716-446655440003",
        "quantity": 1,
        "unit_price": 25.00,
        "subtotal": 25.00,
        "special_instructions": "Bien cocido",
        "product": {
          "id": "bb0e8400-e29b-41d4-a716-446655440003",
          "name": "Pasta Carbonara"
        }
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T16:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `404` | Restaurante o producto no encontrado |
| `422` | Datos inválidos (productos no disponibles) |

---

### 10.4. Actualizar Estado del Pedido

**PATCH** `/orders/{order_id}/status`

Actualiza el estado de un pedido (solo propietario/staff).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "status": "PREPARING"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "reservation_id": "cc0e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "ORD-2024-00002",
    "order_type": "DINE_IN",
    "subtotal": 42.00,
    "tax_amount": 4.20,
    "discount_amount": 0,
    "total_amount": 46.20,
    "currency": "USD",
    "status": "PREPARING",
    "notes": "Sin cebolla en todo el pedido",
    "created_at": "2024-01-15T16:30:00Z",
    "updated_at": "2024-01-15T17:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T17:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para modificar pedidos |
| `404` | Pedido no encontrado |
| `422` | Transición de estado inválida |

---

### 10.5. Cancelar Pedido

**PATCH** `/orders/{order_id}/cancel`

Cancela un pedido existente.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "reservation_id": "cc0e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "ORD-2024-00002",
    "order_type": "DINE_IN",
    "subtotal": 42.00,
    "tax_amount": 4.20,
    "discount_amount": 0,
    "total_amount": 46.20,
    "currency": "USD",
    "status": "CANCELLED",
    "notes": "Sin cebolla en todo el pedido",
    "created_at": "2024-01-15T16:30:00Z",
    "updated_at": "2024-01-15T17:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T17:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para cancelar este pedido |
| `404` | Pedido no encontrado |
| `409` | El pedido ya está cancelado o completado |

---

## 11. Pagos

### 11.1. Obtener Pagos de un Pedido

**GET** `/orders/{order_id}/payments`

Obtiene todos los pagos asociados a un pedido.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440001",
      "order_id": "dd0e8400-e29b-41d4-a716-446655440002",
      "amount": 46.20,
      "currency": "USD",
      "payment_method": "CREDIT_CARD",
      "payment_status": "COMPLETED",
      "transaction_id": "txn_abc123xyz",
      "paid_at": "2024-01-15T18:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T18:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para ver estos pagos |
| `404` | Pedido no encontrado |

---

### 11.2. Procesar Pago

**POST** `/orders/{order_id}/payments`

Procesa un pago para un pedido.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "amount": 46.20,
  "payment_method": "CREDIT_CARD",
  "payment_data": {
    "card_number": "4111111111111111",
    "card_expiry": "12/25",
    "card_cvv": "123",
    "card_holder": "John Doe"
  }
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "ff0e8400-e29b-41d4-a716-446655440002",
    "order_id": "dd0e8400-e29b-41d4-a716-446655440002",
    "amount": 46.20,
    "currency": "USD",
    "payment_method": "CREDIT_CARD",
    "payment_status": "COMPLETED",
    "transaction_id": "txn_def456uvw",
    "paid_at": "2024-01-15T18:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T18:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `402` | Pago rechazado |
| `404` | Pedido no encontrado |
| `409` | Monto excede total del pedido |

---

### 11.3. Reembolsar Pago

**POST** `/payments/{payment_id}/refund`

Procesa un reembolso para un pago existente.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "amount": 23.10,
  "reason": "Parcial - cliente insatisfecho"
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "ff0e8400-e29b-41d4-a716-446655440002",
    "order_id": "dd0e8400-e29b-41d4-a716-446655440002",
    "amount": 46.20,
    "refunded_amount": 23.10,
    "currency": "USD",
    "payment_method": "CREDIT_CARD",
    "payment_status": "REFUNDED",
    "transaction_id": "txn_def456uvw",
    "refund_transaction_id": "ref_ghi789",
    "paid_at": "2024-01-15T18:30:00Z",
    "refunded_at": "2024-01-15T19:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T19:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No tienes permisos para reembolsar |
| `404` | Pago no encontrado |
| `409` | Monto a reembolsar excede disponible |

---

## 12. Reseñas

### 12.1. Listar Reseñas

**GET** `/restaurants/{restaurant_id}/reviews`

Obtiene todas las reseñas de un restaurante.

**Query Parameters:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `min_rating` | integer | Calificación mínima (1-5) |
| `max_rating` | integer | Calificación máxima (1-5) |
| `sort_by` | string | Campo de ordenamiento |
| `sort_order` | string | `asc` o `desc` |
| `page` | integer | Número de página |
| `per_page` | integer | Items por página |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "gg0e8400-e29b-41d4-a716-446655440001",
      "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "order_id": "dd0e8400-e29b-41d4-a716-446655440001",
      "rating": 5,
      "comment": "Excelente comida y servicio! El personal fue muy amable y los platos estaban deliciosos. Definitivamente volveremos.",
      "created_at": "2024-01-15T20:00:00Z",
      "updated_at": "2024-01-15T20:00:00Z",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "avatar_url": "https://cdn.example.com/avatars/john.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-15T20:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Parámetros de consulta inválidos |
| `404` | Restaurante no encontrado |

---

### 12.2. Obtener Reseña por ID

**GET** `/reviews/{review_id}`

Obtiene los detalles de una reseña específica.

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "gg0e8400-e29b-41d4-a716-446655440001",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_id": "dd0e8400-e29b-41d4-a716-446655440001",
    "rating": 5,
    "comment": "Excelente comida y servicio! El personal fue muy amable y los platos estaban deliciosos. Definitivamente volveremos.",
    "created_at": "2024-01-15T20:00:00Z",
    "updated_at": "2024-01-15T20:00:00Z",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "avatar_url": "https://cdn.example.com/avatars/john.jpg"
    },
    "restaurant": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Nuevo Restaurante"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T20:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `404` | Reseña no encontrada |

---

### 12.3. Crear Reseña

**POST** `/reviews`

Crea una nueva reseña.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
  "order_id": "dd0e8400-e29b-41d4-a716-446655440001",
  "rating": 4,
  "comment": "Buena experiencia en general. La comida estuvo deliciosa aunque el servicio fue un poco lento."
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "data": {
    "id": "gg0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_id": "dd0e8400-e29b-41d4-a716-446655440001",
    "rating": 4,
    "comment": "Buena experiencia en general. La comida estuvo deliciosa aunque el servicio fue un poco lento.",
    "created_at": "2024-01-15T20:30:00Z",
    "updated_at": "2024-01-15T20:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T20:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `404` | Restaurante no encontrado |
| `409` | Ya existe una reseña para este pedido |
| `422` | Rating debe estar entre 1 y 5 |

---

### 12.4. Actualizar Reseña

**PATCH** `/reviews/{review_id}`

Actualiza una reseña existente.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**

```json
{
  "rating": 5,
  "comment": "Excelente experiencia! La comida estuvo deliciosa y el servicio mejoró desde mi última visita."
}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "gg0e8400-e29b-41d4-a716-446655440002",
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_id": "dd0e8400-e29b-41d4-a716-446655440001",
    "rating": 5,
    "comment": "Excelente experiencia! La comida estuvo deliciosa y el servicio mejoró desde mi última visita.",
    "created_at": "2024-01-15T20:30:00Z",
    "updated_at": "2024-01-15T21:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T21:00:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Datos de solicitud inválidos |
| `401` | Token inválido o expirado |
| `403` | No eres el autor de esta reseña |
| `404` | Reseña no encontrada |
| `422` | Rating debe estar entre 1 y 5 |

---

### 12.5. Eliminar Reseña

**DELETE** `/reviews/{review_id}`

Elimina una reseña existente.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta Exitosa (204):**

```
(no content)
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `403` | No eres el autor de esta reseña |
| `404` | Reseña no encontrada |

---

## 13. Disponibilidad

### 13.1. Consultar Disponibilidad de Mesas

**GET** `/restaurants/{restaurant_id}/availability`

Consulta la disponibilidad de mesas para una fecha y hora específicas.

**Query Parameters:**

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `date` | date | Sí | Fecha de la consulta |
| `time` | time | Sí | Hora de la consulta |
| `party_size` | integer | Sí | Número de personas |
| `location` | string | No | Ubicación de la mesa |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "data": {
    "restaurant_id": "770e8400-e29b-41d4-a716-446655440002",
    "date": "2024-02-20",
    "time": "19:30:00",
    "party_size": 4,
    "is_available": true,
    "available_tables": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "table_number": 1,
        "capacity": 4,
        "location": "Interior"
      },
      {
        "id": "990e8400-e29b-41d4-a716-446655440005",
        "table_number": 5,
        "capacity": 4,
        "location": "Terraza"
      }
    ],
    "suggested_times": [
      "19:00",
      "19:15",
      "19:30",
      "19:45",
      "20:00"
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T21:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Errores Comunes:**

| Código | Descripción |
|--------|-------------|
| `400` | Parámetros de consulta inválidos |
| `404` | Restaurante no encontrado |

---

## 14. Errores Comunes

### 14.1. Estructura de Error

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible del error",
    "details": {
      "field": "email",
      "reason": "already_exists"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### 14.2. Códigos de Error

| Código | HTTP | Descripción |
|--------|------|-------------|
| `UNAUTHORIZED` | 401 | Token inválido o expirado |
| `FORBIDDEN` | 403 | Permisos insuficientes |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 400 | Error de validación |
| `DUPLICATE_ENTRY` | 409 | Entrada duplicada |
| `CONFLICT` | 409 | Conflicto con estado existente |
| `PAYMENT_FAILED` | 402 | Pago rechazado |
| `RATE_LIMIT_EXCEEDED` | 429 | Límite de solicitudes excedido |
| `INTERNAL_SERVER_ERROR` | 500 | Error interno del servidor |

### 14.3. Errores de Validación

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de solicitud inválidos",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Formato de email inválido"
        },
        {
          "field": "password",
          "message": "La contraseña debe tener al menos 8 caracteres"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

---

## 15. Rate Limiting

### 15.1. Límites

| Tipo de Usuario | Límite | Período |
|-----------------|--------|---------|
| Anónimo | 100 | 1 hora |
| Autenticado | 1000 | 1 hora |
| Propietario | 5000 | 1 hora |

### 15.2. Headers de Rate Limit

| Header | Descripción |
|--------|-------------|
| `X-RateLimit-Limit` | Límite total de solicitudes |
| `X-RateLimit-Remaining` | Solicitudes restantes |
| `X-RateLimit-Reset` | Timestamp cuando se resetea el límite |

---

## 16. Versionado

### 16.1. Cambios por Versión

| Versión | Cambios |
|---------|---------|
| `v1` | Versión inicial de la API |

### 16.2. Deprecación

Los endpoints deprecados incluyen el header:

```
Deprecation: true
Sunset: 2025-01-01
Link: <https://api.restaurants.com/v2/endpoint>; rel="successor-version"
```

---

*Documento versión 1.0 - Última actualización: 2026-03-18*
