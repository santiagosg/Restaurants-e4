# Restaurants Backend - API NestJS + Prisma

## 📋 Estructura del Proyecto

```
backend-restaurants/
├── .env                      # Variables de entorno
├── .env.example              # Plantilla de variables
├── docker-compose.yml         # Configuración PostgreSQL en Docker
├── README.md                # Este archivo
├── package.json             # Dependencias (pendiente crear)
├── tsconfig.json           # Configuración TypeScript (pendiente crear)
└── src/                    # Código fuente
    ├── app.module.ts         # Módulo principal
    ├── main.ts              # Punto de entrada
    ├── prisma/
    │   ├── schema.prisma   # Modelo de datos
    │   └── client.ts      # Cliente Prisma
    ├── common/             # Servicios y DTOs compartidos
    ├── auth/               # Módulo de autenticación (pendiente)
    ├── users/              # Gestión de usuarios (parcial)
    ├── roles/              # Gestión de roles (parcial)
    ├── restaurants/         # Módulo de restaurantes (completo)
    │   └── sub-modules/
    │       ├── tables/     # Gestión de mesas (pendiente)
    │       └── availability/# Disponibilidad (pendiente)
    ├── menu/               # Módulo de menú (completo)
    │   └── sub-modules/
    │       ├── categories/  # Categorías del menú (completo)
    │       └── products/   # Productos del menú (completo)
    ├── reservations/        # Módulo de reservas (completo)
    ├── orders/             # Módulo de pedidos (pendiente)
    ├── payments/           # Módulo de pagos (pendiente)
    ├── reviews/            # Módulo de reseñas (completo)
    └── infrastructure/      # Infraestructura
        ├── email/          # Servicios de email (pendiente)
        └── storage/       # Gestión de archivos (pendiente)
```

## 🚀 Iniciar la Base de Datos

### 1. Iniciar PostgreSQL en Docker

```bash
docker-compose up -d
```

**Credenciales de la base de datos:**
- **Host:** `localhost`
- **Puerto:** `5432`
- **Usuario:** `restaurants_user`
- **Contraseña:** `restaurants_password`
- **Base de datos:** `restaurants_db`
- **URL de conexión:** `postgresql://restaurants_user:restaurants_password@localhost:5432/restaurants_db?schema=public`

### 2. Verificar que el contenedor está corriendo

```bash
docker ps
```

Deberías ver un contenedor llamado `restaurants-db` con estado `Up`.

### 3. Aplicar migraciones de Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma db push
```

### 4. (Opcional) Ver la base de datos

```bash
# Abrir Prisma Studio para ver los datos
npx prisma studio
```

## 📦 Instalar Dependencias

**Requiere pnpm:**
```bash
npm install -g pnpm
```

**Instalar dependencias del proyecto:**
```bash
pnpm install
```

## 🔧 Configuración

El archivo `.env` ya está configurado con las credenciales de la base de datos Docker.

## ▶️ Iniciar el Servidor

```bash
# Modo desarrollo
pnpm run start:dev

# Modo producción
pnpm run build
pnpm run start:prod
```

La API estará disponible en: `http://localhost:3000`

## 📚 Documentación API

Una vez iniciado el servidor, accede a la documentación Swagger en:
```
http://localhost:3000/api
```

## 🛠 Comandos Prisma Útiles

```bash
# Generar cliente
npx prisma generate

# Sincronizar schema con DB
npx prisma db push

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (¡cuidado, borra todos los datos!)
npx prisma migrate reset

# Formatear schema
npx prisma format

# Verificar schema
npx prisma validate
```

## 🔐 Variables de Entorno

Las variables de configuración están en `.env`:

| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | Configurada para Docker |
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno de ejecución | development |
| `JWT_SECRET` | Clave secreta para JWT | Configure en producción |
| `JWT_EXPIRES_IN` | Expiración del token JWT | 7d |

## 📝 Módulos Implementados

| Módulo | Estado | Endpoints |
|--------|--------|-----------|
| restaurants | ✅ Completo | CRUD + Rating |
| menu/categories | ✅ Completo | CRUD |
| menu/products | ✅ Completo | CRUD + Filtros dietéticos |
| reservations | ✅ Completo | CRUD + Gestión de estados |
| reviews | ✅ Completo | CRUD + Estadísticas |
| users | 🔧 Parcial | Esqueleto (pendiente implementar) |
| roles | 🔧 Parcial | Esqueleto (pendiente implementar) |
| auth | ⏳ Pendiente | - |
| orders | ⏳ Pendiente | - |
| payments | ⏳ Pendiente | - |
| tables | ⏳ Pendiente | - |
| availability | ⏳ Pendiente | - |

## 🛑 Detener el Servidor

```bash
# Detener Docker (base de datos)
docker-compose down

# Detener NestJS
Ctrl + C (en la terminal del servidor)
```
