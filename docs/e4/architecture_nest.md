# Arquitectura NestJS - Sistema de Restaurantes

## 1. Visión General

Este documento define la arquitectura de la aplicación utilizando el framework **NestJS**. La arquitectura sigue los principios de **SOLID**, **Clean Architecture** y **Domain-Driven Design** (DDD).

### 1.1. Características Principales

| Característica | Descripción |
|----------------|-------------|
| Framework | NestJS con TypeScript |
| ORM | Prisma |
| Base de Datos | PostgreSQL |
| Cache | Redis (cache-manager) |
| Validación | class-validator |
| Documentación | Swagger/OpenAPI |
| Autenticación | JWT (jsonwebtoken) |
| Encriptación | bcrypt |
| Logs | Pino Logger |

---

## 2. Estructura del Proyecto

### 2.1. Diagrama en Árbol

```
src/
├── app.module.ts                          # Módulo raíz
├── main.ts                                # Punto de entrada
│
├── config/                                # Configuración global
│   ├── config.module.ts
│   ├── database.config.ts
│   ├── cache.config.ts                     # Configuración Redis
│   ├── jwt.config.ts
│   └── app.config.ts
│
├── prisma/                                # Configuración Prisma
│   ├── schema.prisma                      # Schema de la base de datos
│   ├── seed.ts                            # Seed inicial de datos
│   └── migrations/                       # Migraciones de Prisma
│
├── common/                                # Módulos compartidos
│   ├── common.module.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── validation-exception.filter.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── rate-limit.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   ├── logging.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   ├── response.dto.ts
│   │   └── base-response.dto.ts
│   └── utils/
│       ├── logger.util.ts
│       └── date.util.ts
│
├── auth/                                  # Módulo de autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── tokens.dto.ts
│   └── interfaces/
│       └── tokens.interface.ts
│
├── users/                                 # Módulo de usuarios
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── change-password.dto.ts
│   │   ├── user-response.dto.ts
│   │   └── users-query.dto.ts
│   └── models/
│       └── user.model.ts                  # Modelo Prisma extendido
│
├── restaurants/                           # Módulo de restaurantes
│   ├── restaurants.module.ts
│   ├── restaurants.controller.ts
│   ├── restaurants.service.ts
│   ├── dto/
│   │   ├── create-restaurant.dto.ts
│   │   ├── update-restaurant.dto.ts
│   │   ├── restaurant-response.dto.ts
│   │   ├── restaurants-query.dto.ts
│   │   └── update-hours.dto.ts
│   ├── models/
│   │   ├── restaurant.model.ts
│   │   └── restaurant-hours.model.ts
│   └── sub-modules/
│       ├── tables/                        # Sub-módulo de mesas
│       │   ├── tables.module.ts
│       │   ├── tables.controller.ts
│       │   ├── tables.service.ts
│       │   ├── dto/
│       │   │   ├── create-table.dto.ts
│       │   │   ├── update-table.dto.ts
│       │   │   ├── table-response.dto.ts
│       │   │   └── tables-query.dto.ts
│       │   └── models/
│       │       └── table.model.ts
│       │
│       └── availability/                  # Sub-módulo de disponibilidad
│           ├── availability.module.ts
│           ├── availability.controller.ts
│           ├── availability.service.ts
│           ├── dto/
│           │   ├── check-availability.dto.ts
│           │   └── availability-response.dto.ts
│           └── models/
│               └── availability.model.ts
│
├── menu/                                  # Módulo de menú
│   ├── menu.module.ts
│   ├── dto/
│   │   └── shared.dto.ts                 # DTOs compartidos
│   │
│   └── sub-modules/
│       ├── categories/                    # Sub-módulo de categorías
│       │   ├── categories.module.ts
│       │   ├── categories.controller.ts
│       │   ├── categories.service.ts
│       │   ├── dto/
│       │   │   ├── create-category.dto.ts
│       │   │   ├── update-category.dto.ts
│       │   │   ├── category-response.dto.ts
│       │   │   └── categories-query.dto.ts
│       │   └── models/
│       │       └── menu-category.model.ts
│       │
│       └── products/                      # Sub-módulo de productos
│           ├── products.module.ts
│           ├── products.controller.ts
│           ├── products.service.ts
│           ├── dto/
│           │   ├── create-product.dto.ts
│           │   ├── update-product.dto.ts
│           │   ├── product-response.dto.ts
│           │   └── products-query.dto.ts
│           └── models/
│               └── product.model.ts
│
├── reservations/                          # Módulo de reservas
│   ├── reservations.module.ts
│   ├── reservations.controller.ts
│   ├── reservations.service.ts
│   ├── dto/
│   │   ├── create-reservation.dto.ts
│   │   ├── update-reservation.dto.ts
│   │   ├── reservation-response.dto.ts
│   │   └── reservations-query.dto.ts
│   └── models/
│       └── reservation.model.ts
│
├── orders/                                # Módulo de pedidos
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   ├── create-order-item.dto.ts
│   │   ├── update-order-status.dto.ts
│   │   ├── order-response.dto.ts
│   │   └── orders-query.dto.ts
│   └── models/
│       ├── order.model.ts
│       └── order-item.model.ts
│
├── payments/                              # Módulo de pagos
│   ├── payments.module.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   ├── strategies/                       # Estrategias de pago
│   │   ├── payment-strategy.interface.ts
│   │   ├── credit-card.strategy.ts
│   │   ├── cash.strategy.ts
│   │   └── digital-wallet.strategy.ts
│   ├── dto/
│   │   ├── create-payment.dto.ts
│   │   ├── refund-payment.dto.ts
│   │   ├── payment-response.dto.ts
│   │   └── credit-card-data.dto.ts
│   └── models/
│       └── payment.model.ts
│
├── reviews/                               # Módulo de reseñas
│   ├── reviews.module.ts
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   ├── dto/
│   │   ├── create-review.dto.ts
│   │   ├── update-review.dto.ts
│   │   ├── review-response.dto.ts
│   │   └── reviews-query.dto.ts
│   └── models/
│       └── review.model.ts
│
└── infrastructure/                        # Infraestructura externa
    ├── email/
    │   ├── email.module.ts
    │   ├── email.service.ts
    │   └── templates/
    └── storage/
        ├── storage.module.ts
        ├── storage.service.ts
        └── strategies/
            ├── s3.strategy.ts
            └── local.strategy.ts
```

---

## 3. Configuración Prisma

### 3.1. Schema Prisma

**Archivo:** `prisma/schema.prisma`

```prisma
// Generador de Prisma Client
generator client {
  provider = "prisma-client-js"
}

// Fuente de datos - PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enumeraciones
enum Role {
  ADMIN
  RESTAURANT_OWNER
  STAFF
  CUSTOMER
}

enum OrderType {
  DINE_IN
  TAKEOUT
  DELIVERY
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  SERVED
  CANCELLED
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  SEATED
  CANCELLED
  NO_SHOW
}

enum PaymentMethod {
  CASH
  CREDIT_CARD
  DEBIT_CARD
  DIGITAL_WALLET
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// Modelos

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password_hash String
  full_name     String
  phone         String?
  role          Role     @default(CUSTOMER)
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relaciones
  owned_restaurants    Restaurant[]    @relation("RestaurantOwner")
  reservations         Reservation[]
  orders               Order[]
  reviews              Review[]

  @@map("users")
}

model Restaurant {
  id               String  @id @default(uuid())
  owner_id         String
  name             String
  description      String? @db.Text
  cuisine_type     String
  address          String
  city             String
  country          String
  zip_code         String?
  phone            String
  email            String
  website          String?
  logo_url         String? @db.VarChar(500)
  cover_image_url  String? @db.VarChar(500)
  average_rating   Decimal @default(0) @db.Decimal(3, 2)
  total_reviews    Int     @default(0)
  is_active        Boolean @default(true)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  // Relaciones
  owner             User              @relation("RestaurantOwner", fields: [owner_id], references: [id], onDelete: Restrict)
  hours             RestaurantHour[]
  tables            Table[]
  menu_categories   MenuCategory[]
  products          Product[]
  reservations      Reservation[]
  orders            Order[]
  reviews           Review[]

  @@unique([owner_id, name])
  @@map("restaurants")
}

model RestaurantHour {
  id            String   @id @default(uuid())
  restaurant_id String
  day_of_week   Int
  open_time     String?  @db.Time
  close_time    String?  @db.Time
  is_closed     Boolean  @default(false)

  // Relaciones
  restaurant Restaurant @relation(fields: [restaurant_id], references: [id], onDelete: Cascade)

  @@map("restaurant_hours")
}

model Table {
  id            String  @id @default(uuid())
  restaurant_id String
  table_number  Int
  capacity      Int
  location      String?
  is_active     Boolean @default(true)

  // Relaciones
  restaurant Restaurant @relation(fields: [restaurant_id], references: [id], onDelete: Cascade)
  reservations Reservation[]

  @@unique([restaurant_id, table_number])
  @@map("tables")
}

model MenuCategory {
  id            String  @id @default(uuid())
  restaurant_id String
  name          String
  description   String? @db.Text
  display_order Int
  is_active     Boolean @default(true)

  // Relaciones
  restaurant Restaurant @relation(fields: [restaurant_id], references: [id], onDelete: Cascade)
  products  Product[]

  @@map("menu_categories")
}

model Product {
  id               String   @id @default(uuid())
  restaurant_id    String
  category_id      String
  name             String
  description      String?  @db.Text
  price            Decimal  @db.Decimal(10, 2)
  currency         String   @default("USD") @db.VarChar(3)
  image_url        String?  @db.VarChar(500)
  is_available     Boolean  @default(true)
  preparation_time Int?
  calories         Int?
  is_vegetarian    Boolean  @default(false)
  is_vegan         Boolean  @default(false)
  is_gluten_free   Boolean  @default(false)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  // Relaciones
  restaurant MenuCategory @relation(fields: [category_id], references: [id], onDelete: Restrict)

  @@map("products")
}

model Reservation {
  id                String            @id @default(uuid())
  restaurant_id     String
  user_id           String
  table_id          String
  reservation_date   DateTime          @db.Date
  reservation_time   String            @db.Time
  party_size        Int
  special_requests  String?           @db.Text
  status            ReservationStatus @default(PENDING)
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt

  // Relaciones
  restaurant Restaurant @relation(fields: [restaurant_id], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [user_id], references: [id], onDelete: Restrict)
  table      Table      @relation(fields: [table_id], references: [id], onDelete: Restrict)
  orders     Order[]

  @@map("reservations")
}

model Order {
  id              String      @id @default(uuid())
  restaurant_id   String
  reservation_id  String?
  user_id         String
  order_number    String      @unique
  order_type      OrderType
  subtotal        Decimal     @db.Decimal(10, 2)
  tax_amount      Decimal     @db.Decimal(10, 2)
  discount_amount Decimal     @db.Decimal(10, 2) @default(0)
  total_amount    Decimal     @db.Decimal(10, 2)
  currency        String      @default("USD") @db.VarChar(3)
  status          OrderStatus @default(PENDING)
  notes           String?     @db.Text
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  // Relaciones
  restaurant  Restaurant   @relation(fields: [restaurant_id], references: [id], onDelete: Cascade)
  reservation Reservation? @relation(fields: [reservation_id], references: [id], onDelete: SetNull)
  user        User         @relation(fields: [user_id], references: [id], onDelete: Restrict)
  items       OrderItem[]
  payments    Payment[]
  reviews     Review[]

  @@map("orders")
}

model OrderItem {
  id                   String   @id @default(uuid())
  order_id             String
  product_id           String
  quantity             Int
  unit_price           Decimal  @db.Decimal(10, 2)
  subtotal             Decimal  @db.Decimal(10, 2)
  special_instructions String?  @db.Text
  created_at           DateTime @default(now())

  // Relaciones
  order   Order @relation(fields: [order_id], references: [id], onDelete: Cascade)
  product Product @relation(fields: [product_id], references: [id], onDelete: Restrict)

  @@map("order_items")
}

model Payment {
  id               String        @id @default(uuid())
  order_id         String
  amount           Decimal       @db.Decimal(10, 2)
  currency         String        @default("USD") @db.VarChar(3)
  payment_method   PaymentMethod
  payment_status   PaymentStatus @default(PENDING)
  transaction_id   String?       @db.VarChar(100)
  paid_at          DateTime?
  refunded_amount  Decimal?      @db.Decimal(10, 2) @default(0)
  refund_transaction_id String?   @db.VarChar(100)
  refunded_at      DateTime?

  // Relaciones
  order Order @relation(fields: [order_id], references: [id], onDelete: Cascade)

  @@map("payments")
}

model Review {
  id            String   @id @default(uuid())
  restaurant_id String
  user_id       String
  order_id      String?
  rating        Int
  comment       String?  @db.Text
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relaciones
  restaurant Restaurant @relation(fields: [restaurant_id], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [user_id], references: [id], onDelete: Cascade)
  order      Order?     @relation(fields: [order_id], references: [id], onDelete: SetNull)

  @@map("reviews")
}
```

### 3.2. Prisma Service

**Archivo:** `src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_' && key !== 'constructor',
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as string];
        if (model && typeof model.deleteMany === 'function') {
          return model.deleteMany();
        }
      }),
    );
  }
}
```

### 3.3. Prisma Module

**Archivo:** `src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 4. Configuración de Cache con Redis

### 4.1. Cache Config

**Archivo:** `src/config/cache.config.ts`

```typescript
import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig: CacheModuleOptions = {
  store: 'cache-manager-redis-store',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  ttl: 60, // Time to live en segundos
  isGlobal: true,
  max: 1000, // Máximo de items en cache
};
```

### 4.2. Cache Interceptor

**Archivo:** `src/common/interceptors/cache.interceptor.ts`

```typescript
import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheInterceptor extends CacheInterceptor {
  constructor(
    reflector: Reflector,
  ) {
    super(reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const httpMethod = request.method;
    const url = request.url;

    // Solo cachear peticiones GET
    if (httpMethod !== 'GET') {
      return undefined;
    }

    // Cache por usuario si está autenticado
    const userId = request.user?.id;
    if (userId) {
      return `${url}:${userId}`;
    }

    return super.trackBy(context);
  }
}
```

### 4.3. Decoradores de Cache

#### @CacheTTL

**Archivo:** `src/common/decorators/cache-ttl.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_METADATA = 'cache_ttl';

export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
```

#### @CacheKey

**Archivo:** `src/common/decorators/cache-key.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';

export const CacheKey = (key: string | ((...args: any[]) => string)) =>
  SetMetadata(CACHE_KEY_METADATA, key);
```

#### @CacheDisable

**Archivo:** `src/common/decorators/cache-disable.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const CACHE_DISABLE_METADATA = 'cache_disable';

export const CacheDisable = () => SetMetadata(CACHE_DISABLE_METADATA, true);
```

### 4.4. Uso de Cache en Servicios

**Archivo:** `src/restaurants/restaurants.service.ts` (ejemplo)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findById(id: string): Promise<Restaurant> {
    // Intentar obtener del cache
    const cached = await this.cacheManager.get<Restaurant>(`restaurant:${id}`);
    if (cached) {
      return cached;
    }

    // Si no está en cache, buscar en DB
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, full_name: true, email: true } },
        hours: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    // Guardar en cache (30 minutos)
    await this.cacheManager.set(`restaurant:${id}`, restaurant, 1800);

    return restaurant;
  }

  async update(id: string, ownerId: string, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    // Actualizar en DB
    const restaurant = await this.prisma.restaurant.update({
      where: { id },
      data: updateRestaurantDto,
    });

    // Invalidar cache del restaurante
    await this.cacheManager.del(`restaurant:${id}`);

    // Invalidar listado de restaurantes (pattern)
    const keys = await this.cacheManager.store.keys('restaurants:*');
    await Promise.all(keys.map(key => this.cacheManager.del(key)));

    return restaurant;
  }
}
```

### 4.5. Uso de Cache en Controladores

**Archivo:** `src/restaurants/restaurants.controller.ts` (ejemplo)

```typescript
import { Controller, Get, UseInterceptors, CacheKey, CacheTTL, CacheDisable } from '@nestjs/common';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('restaurants')
@UseInterceptors(CacheInterceptor) // Interceptor global para el controlador
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @CacheTTL(300) // 5 minutos para el listado
  findAll(@Query() query: RestaurantsQueryDto) {
    return this.restaurantsService.findAll(query);
  }

  @Get(':id')
  @CacheKey((request) => `restaurant:${request.params.id}`) // Key personalizado
  @CacheTTL(1800) // 30 minutos para item individual
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Get(':id/menu')
  @CacheTTL(600) // 10 minutos para el menú
  getMenu(@Param('id') id: string) {
    return this.restaurantsService.getMenu(id);
  }

  @Get(':id/availability')
  @CacheDisable() // Deshabilitar cache para disponibilidad (datos en tiempo real)
  checkAvailability(@Param('id') id: string, @Query() query: any) {
    return this.restaurantsService.checkAvailability(id, query);
  }
}
```

### 4.6. Estrategias de Cache

| Estrategia | Caso de Uso | TTL Sugerido |
|-------------|---------------|---------------|
| **Restaurantes** | Listado público | 5 minutos |
| **Detalle Restaurante** | Perfil individual | 30 minutos |
| **Menú** | Productos y categorías | 10 minutos |
| **Disponibilidad** | Mesas disponibles | Sin cache |
| **Reservas** | Listado de usuario | 2 minutos |
| **Pedidos** | Historial | Sin cache |
| **Reviews** | Reseñas por rating | 15 minutos |

### 4.7. Comandos Redis

| Comando | Descripción |
|---------|-------------|
| `FLUSHDB` | Limpiar todas las keys de la DB actual |
| `KEYS *` | Listar todas las keys |
| `GET <key>` | Obtener valor de una key |
| `DEL <key>` | Eliminar una key |
| `EXPIRE <key> <seconds>` | Establecer TTL |
| `TTL <key>` | Ver TTL restante |

### 4.8. Variables de Entorno

```env
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
CACHE_TTL=60
```

---

## 5. Módulos Principales

### 4.1. AppModule

**Archivo:** `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';

// Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuModule } from './menu/menu.module';
import { ReservationsModule } from './reservations/reservations.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CommonModule } from './common/common.module';

// Pipes & Guards
import { ValidationPipe } from './common/pipes/validation.pipe';
import { ThrottlerGuard } from './common/guards/rate-limit.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    //
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenuModule,
    ReservationsModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    CommonModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
```

**Responsabilidades:**
- Configuración global de la aplicación
- Registro de todos los módulos
- Configuración de pipes y guards globales

---

### 4.2. AuthModule

**Archivo:** `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        },
      }),
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**Componentes:**

| Archivo | Responsabilidad |
|---------|-----------------|
| `auth.controller.ts` | Manejar peticiones HTTP de auth |
| `auth.service.ts` | Lógica de negocio de autenticación |
| `jwt.strategy.ts` | Estrategia JWT para Passport |
| `jwt-refresh.strategy.ts` | Estrategia de refresh token |
| `dto/` | Validación de datos de entrada |

**Responsabilidades:**
- Gestión de registro de usuarios
- Autenticación de usuarios (login)
- Generación y validación de tokens JWT
- Refresh de tokens
- Gestión de contraseñas (hash, validación)

---

### 4.3. UsersModule

**Archivo:** `src/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

**Componentes:**

| Archivo | Responsabilidad |
|---------|-----------------|
| `users.controller.ts` | Manejar peticiones HTTP de usuarios |
| `users.service.ts` | Lógica de negocio de usuarios |
| `models/user.model.ts` | Tipos y helpers para usuarios |
| `dto/` | Validación de datos de usuario |

**Responsabilidades:**
- Gestión de perfiles de usuario
- Actualización de datos personales
- Cambio de contraseñas
- Consulta de información de usuarios
- Validación de roles

---

### 4.4. RestaurantsModule

**Archivo:** `src/restaurants/restaurants.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { TablesModule } from './sub-modules/tables/tables.module';
import { AvailabilityModule } from './sub-modules/availability/availability.module';

@Module({
  imports: [TablesModule, AvailabilityModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
```

**Componentes:**

| Archivo | Responsabilidad |
|---------|-----------------|
| `restaurants.controller.ts` | Manejar peticiones HTTP de restaurantes |
| `restaurants.service.ts` | Lógica de negocio de restaurantes |
| `models/restaurant.model.ts` | Tipos para restaurantes |
| `models/restaurant-hours.model.ts` | Tipos para horarios |
| `dto/` | Validación de datos de restaurantes |

**Sub-módulos:**
- `TablesModule`: Gestión de mesas
- `AvailabilityModule`: Consulta de disponibilidad

**Responsabilidades:**
- CRUD de restaurantes
- Gestión de horarios
- Búsqueda y filtrado
- Validación de propietarios
- Cálculo de ratings promedio

---

### 4.5. MenuModule

**Archivo:** `src/menu/menu.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CategoriesModule } from './sub-modules/categories/categories.module';
import { ProductsModule } from './sub-modules/products/products.module';

@Module({
  imports: [CategoriesModule, ProductsModule],
  exports: [CategoriesModule, ProductsModule],
})
export class MenuModule {}
```

**Sub-módulos:**

#### CategoriesModule

```typescript
import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
```

| Archivo | Responsabilidad |
|---------|-----------------|
| `categories.controller.ts` | Manejar peticiones de categorías |
| `categories.service.ts` | Lógica de negocio de categorías |
| `models/menu-category.model.ts` | Tipos para categorías |
| `dto/` | Validación de datos |

**Responsabilidades:**
- CRUD de categorías de menú
- Ordenamiento de categorías
- Filtrado por restaurante
- Validación de estado (activo/inactivo)

#### ProductsModule

```typescript
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

| Archivo | Responsabilidad |
|---------|-----------------|
| `products.controller.ts` | Manejar peticiones de productos |
| `products.service.ts` | Lógica de negocio de productos |
| `models/product.model.ts` | Tipos para productos |
| `dto/` | Validación de datos |

**Responsabilidades:**
- CRUD de productos
- Búsqueda por nombre/descripción
- Filtrado por categoría, disponibilidad, dieta
- Validación de precios
- Consulta de detalles de producto

---

### 4.6. ReservationsModule

**Archivo:** `src/reservations/reservations.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
```

**Componentes:**

| Archivo | Responsabilidad |
|---------|-----------------|
| `reservations.controller.ts` | Manejar peticiones de reservas |
| `reservations.service.ts` | Lógica de negocio de reservas |
| `models/reservation.model.ts` | Tipos para reservas |
| `dto/` | Validación de datos de reservas |

**Responsabilidades:**
- Creación de reservas
- Asignación de mesas automáticas
- Validación de disponibilidad
- Gestión de estados (PENDING, CONFIRMED, SEATED, CANCELLED, NO_SHOW)
- Cancelación de reservas
- Notificaciones por email

---

### 4.7. OrdersModule

**Archivo:** `src/orders/orders.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

**Componentes:**

| Archivo | Responsabilidad |
|---------|-----------------|
| `orders.controller.ts` | Manejar peticiones de pedidos |
| `orders.service.ts` | Lógica de negocio de pedidos |
| `models/order.model.ts` | Tipos para pedidos |
| `models/order-item.model.ts` | Tipos para items |
| `dto/` | Validación de datos de pedidos |

**Responsabilidades:**
- Creación de pedidos
- Cálculo de totales (subtotal, tax, descuento)
- Gestión de ítems de pedido
- Transiciones de estado (PENDING → CONFIRMED → PREPARING → READY → SERVED)
- Asociar a reservas
- Historial de pedidos

---

### 4.8. PaymentsModule

**Archivo:** `src/payments/payments.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentStrategyFactory } from './strategies/payment-strategy.factory';
import { CreditCardStrategy } from './strategies/credit-card.strategy';
import { CashStrategy } from './strategies/cash.strategy';
import { DigitalWalletStrategy } from './strategies/digital-wallet.strategy';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentStrategyFactory,
    CreditCardStrategy,
    CashStrategy,
    DigitalWalletStrategy,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

**Componentes:**

| Archivo | Responsabilidad |
|---------|-----------------|
| `payments.controller.ts` | Manejar peticiones de pagos |
| `payments.service.ts` | Lógica de negocio de pagos |
| `strategies/payment-strategy.interface.ts` | Interfaz de estrategia |
| `strategies/credit-card.strategy.ts` | Estrategia tarjeta crédito |
| `strategies/cash.strategy.ts` | Estrategia efectivo |
| `strategies/digital-wallet.strategy.ts` | Estrategia wallet digital |
| `models/payment.model.ts` | Tipos para pagos |
| `dto/` | Validación de datos de pagos |

**Patrón:** Strategy Pattern

**Responsabilidades:**
- Procesamiento de pagos
- Integración con pasarelas de pago
- Reembolsos (parciales/totales)
- Gestión de estados de pago
- Manejo de errores de pago
- Logging de transacciones

---

### 4.9. ReviewsModule

**Archivo:** `src/reviews/reviews.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
```

**Componentes:**

| Archivo | Responsabilidad |
|---------|-----------------|
| `reviews.controller.ts` | Manejar peticiones de reseñas |
| `reviews.service.ts` | Lógica de negocio de reseñas |
| `models/review.model.ts` | Tipos para reseñas |
| `dto/` | Validación de datos de reseñas |

**Responsabilidades:**
- Creación de reseñas
- Validación de que el usuario realizó el pedido
- Validación de ratings (1-5)
- Actualización de ratings promedio del restaurante
- Edición de reseñas propias
- Eliminación de reseñas
- Filtrado por rating

---

### 4.10. CommonModule

**Archivo:** `src/common/common.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { ValidationPipe } from './pipes/validation.pipe';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';

@Module({
  imports: [ThrottlerModule.forRootAsync({ useFactory: () => [{ ttl: 60000, limit: 100 }] })],
  providers: [
    // Guards
    JwtAuthGuard,
    RolesGuard,
    RateLimitGuard,
    // Pipes
    ValidationPipe,
    // Interceptors
    TransformInterceptor,
    LoggingInterceptor,
    CacheInterceptor,
    // Filters
    HttpExceptionFilter,
    ValidationExceptionFilter,
  ],
  exports: [JwtAuthGuard, RolesGuard, ValidationPipe],
})
export class CommonModule {}
```

**Componentes:**

| Directorio | Componentes |
|-----------|-------------|
| `decorators/` | `@Roles()`, `@Public()`, `@CurrentUser()` |
| `guards/` | `JwtAuthGuard`, `RolesGuard`, `RateLimitGuard` |
| `interceptors/` | `TransformInterceptor`, `LoggingInterceptor`, `CacheInterceptor` |
| `pipes/` | `ValidationPipe` |
| `filters/` | `HttpExceptionFilter`, `ValidationExceptionFilter` |
| `dto/` | DTOs compartidos |
| `utils/` | Utilidades generales |

**Responsabilidades:**
- Autenticación y autorización
- Validación de datos
- Transformación de respuestas
- Logging de solicitudes
- Manejo centralizado de excepciones
- Rate limiting

---

## 5. Servicios con Prisma

### 5.1. UsersService

**Archivo:** `src/users/users.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

import type { User } from '@prisma/client';
import type { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createUserDto.password_hash);

    try {
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password_hash: hashedPassword,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email ya registrado');
      }
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Contraseña actual incorrecta');
    }

    const hashedPassword = await this.hashPassword(changePasswordDto.new_password);

    await this.prisma.user.update({
      where: { id },
      data: { password_hash: hashedPassword },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validateRole(userId: string, requiredRole: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === requiredRole;
  }
}
```

---

### 5.2. RestaurantsService

**Archivo:** `src/restaurants/restaurants.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import type { Restaurant, RestaurantHour } from '@prisma/client';
import type { CreateRestaurantDto, UpdateRestaurantDto, RestaurantsQueryDto } from './dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: RestaurantsQueryDto) {
    const { page = 1, per_page = 20, q, city, cuisine_type, min_rating, sort_by = 'created_at', sort_order = 'desc' } = query;

    const where: any = { is_active: true };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (cuisine_type) where.cuisine_type = cuisine_type;
    if (min_rating !== undefined) where.average_rating = { gte: min_rating };

    const [data, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { [sort_by]: sort_order },
        include: {
          owner: {
            select: { id: true, full_name: true, email: true },
          },
        },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    const total_pages = Math.ceil(total / per_page);

    return {
      data,
      pagination: {
        page,
        per_page,
        total,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<Restaurant> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true },
        },
        hours: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    return restaurant;
  }

  async create(ownerId: string, createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const { hours, ...restaurantData } = createRestaurantDto;

    return this.prisma.restaurant.create({
      data: {
        ...restaurantData,
        owner_id: ownerId,
        hours: hours ? {
          create: hours,
        } : undefined,
      },
      include: { hours: true },
    });
  }

  async update(id: string, ownerId: string, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    await this.verifyOwnership(id, ownerId);

    return this.prisma.restaurant.update({
      where: { id },
      data: updateRestaurantDto,
    });
  }

  async updateHours(id: string, ownerId: string, hoursData: { hours: any[] }): Promise<RestaurantHour[]> {
    await this.verifyOwnership(id, ownerId);

    // Eliminar horas existentes y crear nuevas
    await this.prisma.restaurantHour.deleteMany({
      where: { restaurant_id: id },
    });

    return this.prisma.restaurantHour.createMany({
      data: hoursData.hours.map((hour) => ({
        ...hour,
        restaurant_id: id,
      })),
    }).then(() => this.prisma.restaurantHour.findMany({ where: { restaurant_id: id } }));
  }

  async updateRating(restaurantId: string): Promise<void> {
    const reviews = await this.prisma.review.findMany({
      where: { restaurant_id: restaurantId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await this.prisma.restaurant.update({
        where: { id: restaurantId },
        data: { average_rating: 0, total_reviews: 0 },
      });
      return;
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        average_rating: parseFloat(averageRating.toFixed(2)),
        total_reviews: reviews.length,
      },
    });
  }

  async isOwner(userId: string, restaurantId: string): Promise<boolean> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { owner_id: true },
    });

    return restaurant?.owner_id === userId;
  }

  private async verifyOwnership(restaurantId: string, userId: string): Promise<void> {
    const isOwner = await this.isOwner(userId, restaurantId);

    if (!isOwner) {
      throw new ForbiddenException('No eres propietario de este restaurante');
    }
  }
}
```

---

### 5.3. TablesService

**Archivo:** `src/restaurants/sub-modules/tables/tables.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

import type { Table } from '@prisma/client';
import type { CreateTableDto, UpdateTableDto, TablesQueryDto } from './dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId: string, user: any, query: TablesQueryDto): Promise<Table[]> {
    const { is_active, min_capacity, location } = query;

    const where: any = { restaurant_id: restaurantId, is_active: true };

    if (is_active !== undefined) where.is_active = is_active;
    if (min_capacity !== undefined) where.capacity = { gte: min_capacity };
    if (location !== undefined) where.location = location;

    return this.prisma.table.findMany({ where });
  }

  async findById(restaurantId: string, tableId: string): Promise<Table> {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.restaurant_id !== restaurantId) {
      throw new NotFoundException('Mesa no encontrada');
    }

    return table;
  }

  async create(restaurantId: string, ownerId: string, createTableDto: CreateTableDto): Promise<Table> {
    // Verificar propietario
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { owner_id: true },
    });

    if (restaurant?.owner_id !== ownerId) {
      throw new ForbiddenException('No eres propietario de este restaurante');
    }

    // Verificar número de mesa único
    const existingTable = await this.prisma.table.findUnique({
      where: {
        restaurant_id_table_number: {
          restaurant_id: restaurantId,
          table_number: createTableDto.table_number,
        },
      },
    });

    if (existingTable) {
      throw new ConflictException('Número de mesa ya existe');
    }

    return this.prisma.table.create({
      data: {
        ...createTableDto,
        restaurant_id: restaurantId,
      },
    });
  }

  async update(restaurantId: string, tableId: string, ownerId: string, updateTableDto: UpdateTableDto): Promise<Table> {
    await this.verifyOwnership(restaurantId, ownerId);

    return this.prisma.table.update({
      where: { id: tableId },
      data: updateTableDto,
    });
  }

  async delete(restaurantId: string, tableId: string, ownerId: string): Promise<void> {
    await this.verifyOwnership(restaurantId, ownerId);

    // Verificar si tiene reservas activas
    const hasActiveReservations = await this.prisma.reservation.findFirst({
      where: {
        table_id: tableId,
        reservation_date: { gte: new Date() },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (hasActiveReservations) {
      throw new ConflictException('La mesa tiene reservas activas');
    }

    await this.prisma.table.delete({
      where: { id: tableId },
    });
  }

  private async verifyOwnership(restaurantId: string, userId: string): Promise<void> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { owner_id: true },
    });

    if (restaurant?.owner_id !== userId) {
      throw new ForbiddenException('No eres propietario de este restaurante');
    }
  }
}
```

---

### 5.4. ReservationsService

**Archivo:** `src/reservations/reservations.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../infrastructure/email/email.service';

import type { Reservation, ReservationStatus } from '@prisma/client';
import type { CreateReservationDto, UpdateReservationDto, ReservationsQueryDto } from './dto';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(user: any, query: ReservationsQueryDto) {
    const { page = 1, per_page = 20, restaurant_id, status, date_from, date_to } = query;

    const where: any = {};

    // Si es propietario, ver sus restaurantes; si es cliente, sus reservas
    if (user.role === 'RESTAURANT_OWNER') {
      where.restaurant = { owner_id: user.id };
    } else {
      where.user_id = user.id;
    }

    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (status) where.status = status;
    if (date_from) where.reservation_date = { ...where.reservation_date, gte: date_from };
    if (date_to) where.reservation_date = { ...where.reservation_date, lte: date_to };

    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { reservation_date: 'desc' },
        include: {
          restaurant: { select: { id: true, name: true, address: true, city: true } },
          table: { select: { id: true, table_number: true, capacity: true, location: true } },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    const total_pages = Math.ceil(total / per_page);

    return {
      data,
      pagination: {
        page,
        per_page,
        total,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    };
  }

  async findById(id: string, user: any): Promise<Reservation> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        restaurant: { select: { id: true, name: true, address: true, city: true, phone: true } },
        table: { select: { id: true, table_number: true, capacity: true, location: true } },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    // Verificar permisos
    if (user.role === 'CUSTOMER' && reservation.user_id !== user.id) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (user.role === 'RESTAURANT_OWNER' && reservation.restaurant.owner_id !== user.id) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return reservation;
  }

  async create(userId: string, createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { restaurant_id, party_size, reservation_date, reservation_time } = createReservationDto;

    // Verificar disponibilidad
    const isAvailable = await this.checkAvailability(restaurant_id, reservation_date, reservation_time, party_size);

    if (!isAvailable) {
      throw new ConflictException('No hay disponibilidad para la fecha y hora seleccionadas');
    }

    // Asignar mesa automáticamente
    const table = await this.assignTable(restaurant_id, party_size);

    const reservation = await this.prisma.reservation.create({
      data: {
        ...createReservationDto,
        user_id: userId,
        table_id: table.id,
        status: 'PENDING',
      },
      include: {
        restaurant: true,
        table: true,
      },
    });

    // Enviar email de confirmación
    await this.emailService.sendReservationConfirmation(reservation);

    return reservation;
  }

  async update(id: string, user: any, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findById(id, user);

    if (reservation.status !== 'PENDING') {
      throw new ConflictException('No se puede modificar una reserva que no esté pendiente');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
    });
  }

  async cancel(id: string, user: any): Promise<Reservation> {
    const reservation = await this.findById(id, user);

    if (reservation.status === 'CANCELLED') {
      throw new ConflictException('La reserva ya está cancelada');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async checkAvailability(restaurantId: string, date: string, time: string, partySize: number): Promise<boolean> {
    // Verificar si el restaurante está abierto
    const dayOfWeek = new Date(date).getDay();
    const hours = await this.prisma.restaurantHour.findFirst({
      where: { restaurant_id: restaurantId, day_of_week: dayOfWeek },
    });

    if (!hours || hours.is_closed) {
      return false;
    }

    if (time < hours.open_time || time > hours.close_time) {
      return false;
    }

    // Verificar mesas disponibles
    const tables = await this.prisma.table.findMany({
      where: {
        restaurant_id: restaurantId,
        capacity: { gte: partySize },
        is_active: true,
      },
    });

    if (tables.length === 0) {
      return false;
    }

    // Verificar reservas existentes
    const reservedTables = await this.prisma.reservation.findMany({
      where: {
        restaurant_id: restaurantId,
        reservation_date: date,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { table_id: true },
    });

    const availableTables = tables.filter(
      (table) => !reservedTables.some((r) => r.table_id === table.id),
    );

    return availableTables.length > 0;
  }

  private async assignTable(restaurantId: string, partySize: number): Promise<any> {
    const tables = await this.prisma.table.findMany({
      where: {
        restaurant_id: restaurantId,
        capacity: { gte: partySize },
        is_active: true,
      },
      orderBy: { capacity: 'asc' },
      take: 1,
    });

    if (tables.length === 0) {
      throw new ConflictException('No hay mesas disponibles');
    }

    return tables[0];
  }
}
```

---

### 5.5. OrdersService

**Archivo:** `src/orders/orders.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../menu/sub-modules/products/products.service';

import type { Order, OrderItem, OrderStatus } from '@prisma/client';
import type { CreateOrderDto, UpdateOrderStatusDto, OrdersQueryDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async findAll(user: any, query: OrdersQueryDto) {
    const { page = 1, per_page = 20, restaurant_id, status, order_type, date_from, date_to } = query;

    const where: any = {};

    if (user.role === 'RESTAURANT_OWNER') {
      where.restaurant = { owner_id: user.id };
    } else {
      where.user_id = user.id;
    }

    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (status) where.status = status;
    if (order_type) where.order_type = order_type;
    if (date_from) where.created_at = { ...where.created_at, gte: date_from };
    if (date_to) where.created_at = { ...where.created_at, lte: date_to };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { created_at: 'desc' },
        include: {
          restaurant: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, image_url: true } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const total_pages = Math.ceil(total / per_page);

    return {
      data,
      pagination: {
        page,
        per_page,
        total,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    };
  }

  async findById(id: string, user: any): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: { select: { id: true, name: true } },
        reservation: { select: { id: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, image_url: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar permisos
    if (user.role === 'CUSTOMER' && order.user_id !== user.id) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (user.role === 'RESTAURANT_OWNER' && order.restaurant.owner_id !== user.id) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { restaurant_id, items, reservation_id } = createOrderDto;

    // Validar productos y obtener precios
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.productsService.findById(restaurant_id, item.product_id);

        if (!product.is_available) {
          throw new BadRequestException(`Producto ${product.name} no está disponible`);
        }

        return {
          ...item,
          unit_price: product.price,
          subtotal: product.price * item.quantity,
        };
      }),
    );

    // Calcular totales
    const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = subtotal * 0.10; // 10% IVA
    const totalAmount = subtotal + taxAmount;

    // Crear orden con items
    return this.prisma.order.create({
      data: {
        user_id: userId,
        restaurant_id,
        reservation_id,
        order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        order_type: createOrderDto.order_type,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: createOrderDto.notes,
        items: {
          create: validatedItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
            special_instructions: item.special_instructions,
          })),
        },
      },
      include: { items: { include: { product: { select: { id: true, name: true } } } } },
    });
  }

  async updateStatus(id: string, user: any, status: OrderStatus): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true, restaurant: { select: { owner_id: true } } },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (user.role === 'RESTAURANT_OWNER' && order.restaurant.owner_id !== user.id) {
      throw new BadRequestException('No tienes permisos para modificar este pedido');
    }

    // Validar transición de estado
    if (!this.canTransition(order.status, status)) {
      throw new BadRequestException(`No se puede cambiar de ${order.status} a ${status}`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async cancel(id: string, user: any): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true, user_id: true },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (user.role === 'CUSTOMER' && order.user_id !== user.id) {
      throw new BadRequestException('No tienes permisos para cancelar este pedido');
    }

    if (order.status === 'CANCELLED' || order.status === 'SERVED') {
      throw new BadRequestException('No se puede cancelar este pedido');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  private canTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY'],
      READY: ['SERVED'],
      SERVED: [],
      CANCELLED: [],
    };

    return transitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
```

---

## 6. Enumeraciones

```typescript
// src/common/enums/role.enum.ts
export enum Role {
  ADMIN = 'ADMIN',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// src/common/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

// src/common/enums/order-type.enum.ts
export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEOUT = 'TAKEOUT',
  DELIVERY = 'DELIVERY',
}

// src/common/enums/reservation-status.enum.ts
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SEATED = 'SEATED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

// src/common/enums/payment-method.enum.ts
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// src/common/enums/payment-status.enum.ts
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
```

---

## 7. Patrones de Diseño Utilizados

| Patrón | Módulo | Descripción |
|--------|--------|-------------|
| **Strategy** | Payments | Estrategias de pago (tarjeta, efectivo, wallet) |
| **Factory** | Payments | PaymentStrategyFactory |
| **Repository** | Prisma | PrismaService como repositorio |
| **Decorator** | Guards, Services | @Roles, @Public, @CurrentUser |
| **Interceptor** | Common | Transform, Logging, Cache |
| **Pipe** | Common | Validación de datos |
| **Singleton** | PrismaService | Instancia única de Prisma Client |

---

## 8. Comandos Prisma

| Comando | Descripción |
|---------|-------------|
| `npx prisma generate` | Generar Prisma Client |
| `npx prisma migrate dev` | Crear y aplicar migración |
| `npx prisma migrate deploy` | Aplicar migraciones en producción |
| `npx prisma db push` | Sincronizar schema con DB (dev) |
| `npx prisma studio` | Abrir UI de Prisma Studio |
| `npx prisma migrate reset` | Resetear base de datos |
| `npx prisma seed` | Ejecutar seed |
| `npx prisma format` | Formatear schema.prisma |

---

*Documento versión 1.0 - Última actualización: 2026-03-18*
