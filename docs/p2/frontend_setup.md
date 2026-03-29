# Frontend Setup - Proyecto P2

## Stack Tecnológico

- **Framework:** Next.js (App Router)
- **React:** 19
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS
- **Router:** Next.js App Router
- **Data Fetching:** React Query / SWR (por definir)

---

## Comandos para Crear el Proyecto

### Opción 1: Creación interactiva

```bash
# Desde la raíz del proyecto Restaurants-e4
mkdir -p app/frontend
cd app/frontend

# Crear proyecto Next.js con App Router, TypeScript y Tailwind
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git

# Aceptar todas las opciones por defecto
# Would you like to use TypeScript? Yes
# Would you like to use ESLint? Yes
# Would you like to use Tailwind CSS? Yes
# Would you like to use `src/` directory? No (usamos app/)
# Would you like to use App Router? Yes
# Would you like to customize the default import alias? @/*
```

### Opción 2: Comandos no interactivos

```bash
# Desde la raíz del proyecto Restaurants-e4
mkdir -p app/frontend
cd app/frontend

# Crear proyecto con flags no interactivos
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git --yes
```

### Instalación de dependencias adicionales (post-creación)

```bash
cd app/frontend

# React Query para data fetching (opcional, sugerido)
pnpm add @tanstack/react-query

# Iconos (opcional, sugerido)
pnpm add lucide-react

# Formularios y validación (opcional, sugerido)
pnpm add react-hook-form zod @hookform/resolvers

# Fecha y hora (opcional)
pnpm add date-fns
```

---

## Estructura de Carpetas y Archivos

```
app/frontend/
├── app/
│   ├── layout.tsx                 # Layout principal de la app
│   ├── page.tsx                   # Home page (/)
│   ├── restaurants/
│   │   ├── page.tsx               # Lista de restaurantes (/restaurants)
│   │   └── [id]/
│   │       └── page.tsx           # Detalle de restaurante (/restaurants/:id)
│   └── globals.css                # Estilos globales de Tailwind
│
├── components/
│   ├── layout/                    # Componentes de layout
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   ├── restaurant/                # Componentes específicos de restaurantes
│   │   ├── RestaurantCard.tsx
│   │   ├── RestaurantGrid.tsx
│   │   ├── RestaurantHero.tsx
│   │   └── RestaurantInfo.tsx
│   ├── menu/                     # Componentes de menú
│   │   ├── MenuSection.tsx
│   │   ├── ProductCard.tsx
│   │   └── CategoryFilter.tsx
│   ├── reviews/                  # Componentes de reseñas
│   │   ├── ReviewsSection.tsx
│   │   ├── ReviewCard.tsx
│   │   └── RatingSummary.tsx
│   ├── reservation/               # Componentes de reserva
│   │   ├── ReservationSection.tsx
│   │   ├── ReservationForm.tsx
│   │   └── ReservationModal.tsx
│   ├── ui/                       # Componentes UI reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Alert.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Rating.tsx
│   │   └── Avatar.tsx
│   └── shared/                   # Componentes compartidos
│       ├── SearchInput.tsx
│       ├── Select.tsx
│       └── DatePicker.tsx
│
├── lib/
│   ├── api/                      # Cliente API
│   │   ├── client.ts             # Cliente HTTP (fetch/axios)
│   │   ├── restaurants.ts        # Endpoints de restaurantes
│   │   ├── products.ts           # Endpoints de productos
│   │   ├── reviews.ts            # Endpoints de reseñas
│   │   └── reservations.ts       # Endpoints de reservas
│   ├── types/                    # Tipos TypeScript
│   │   ├── restaurant.ts
│   │   ├── product.ts
│   │   ├── review.ts
│   │   └── reservation.ts
│   └── utils/                    # Utilidades
│       ├── cn.ts                 # Classnames utility (clsx + tailwind-merge)
│       ├── date.ts               # Utilidades de fecha
│       └── format.ts             # Utilidades de formato
│
├── hooks/
│   ├── use-restaurants.ts         # Hook para restaurantes
│   ├── use-menu.ts               # Hook para menú
│   ├── use-reviews.ts            # Hook para reseñas
│   └── use-reservation.ts        # Hook para reservas
│
├── context/
│   └── AuthContext.tsx            # Context de autenticación
│
├── public/
│   ├── images/                   # Imágenes estáticas
│   └── icons/                    # Iconos estáticos
│
├── .eslintrc.json                # Configuración ESLint
├── .gitignore
├── next.config.js                # Configuración Next.js
├── package.json
├── postcss.config.js             # Configuración PostCSS
├── tailwind.config.ts            # Configuración Tailwind
└── tsconfig.json                 # Configuración TypeScript
```

---

## Archivo: `app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Restaurants - Descubre y reserva los mejores restaurantes',
  description: 'Plataforma para descubrir restaurantes, ver menús y hacer reservas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Layout global */}
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Navbar - será implementado */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-gray-900">
                Restaurants
              </a>
              <nav className="flex items-center gap-6">
                <a href="/restaurants" className="text-gray-600 hover:text-gray-900">
                  Restaurantes
                </a>
                {/* Auth buttons serán implementados */}
                <button className="text-gray-600 hover:text-gray-900">
                  Iniciar sesión
                </button>
              </nav>
            </div>
          </header>

          {/* Contenido principal */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer - será implementado */}
          <footer className="bg-gray-900 text-gray-400 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p>&copy; {new Date().getFullYear()} Restaurants. Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
```

---

## Archivo: `app/page.tsx`

```tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Descubre los mejores restaurantes
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8">
            Reserva tu mesa en segundos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/restaurants"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Ver Restaurantes
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Crear Cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Featured Restaurants - Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Restaurantes Destacados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skeletons para restaurantes */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Placeholder */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step === 1 ? 'Buscar' : step === 2 ? 'Reservar' : 'Disfrutar'}
                </h3>
                <p className="text-gray-600">
                  {step === 1 ? 'Encuentra el restaurante perfecto para ti' :
                   step === 2 ? 'Haz tu reserva en pocos clics' :
                   'Disfruta de una experiencia memorable'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
```

---

## Archivo: `app/restaurants/page.tsx`

```tsx
export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Restaurantes
        </h1>

        {/* Filtros - Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar restaurantes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Todas las cocinas</option>
              <option>Italiana</option>
              <option>Mexicana</option>
              <option>Asiática</option>
            </select>
          </div>
        </div>

        {/* Grid de restaurantes - Placeholder con Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="h-4 bg-gray-200 rounded w-12" />
                  <div className="h-4 bg-gray-200 rounded w-8" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Paginación - Placeholder */}
        <div className="flex justify-center mt-8 gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600">
            Anterior
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            1
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600">
            2
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600">
            3
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600">
            Siguiente
          </button>
        </div>
      </div>
    </main>
  )
}
```

---

## Archivo: `app/restaurants/[id]/page.tsx`

```tsx
export default function RestaurantDetailPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section - Placeholder */}
      <section className="h-64 bg-gradient-to-b from-blue-600 to-blue-800 relative">
        <div className="absolute inset-0 flex items-end p-6">
          <div className="bg-white/95 backdrop-blur rounded-lg p-4 max-w-md">
            <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del Restaurante - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </section>

        {/* Menú - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-32 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reseñas - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse" />
          <div className="flex items-center gap-8 mb-6 pb-6 border-b">
            <div className="h-16 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Reserva - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="mt-6 h-12 bg-gray-200 rounded animate-pulse" />
        </section>
      </div>
    </main>
  )
}
```

---

## Configuraciones Adicionales

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

### `tsconfig.json` - Modificaciones sugeridas

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/context/*": ["./context/*"],
      "@/types/*": ["./lib/types/*"]
    }
  }
}
```

---

## Pasos Siguientes

1. Crear el proyecto con los comandos anteriores
2. Instalar dependencias adicionales (React Query, lucide-react, etc.)
3. Crear los archivos de estructura de carpetas
4. Implementar los componentes UI base (Button, Card, Alert, etc.)
5. Implementar el cliente API
6. Crear los componentes de negocio (RestaurantCard, ProductCard, etc.)
7. Integrar con la API del backend E4