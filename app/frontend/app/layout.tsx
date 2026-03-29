import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Restaurants - Descubre y reserva los mejores restaurantes',
  description: 'Plataforma para descubrir restaurantes, ver menús y hacer reservas.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <div className="min-h-screen flex flex-col">
          {/* Navbar */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Restaurants
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/restaurants"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Restaurantes
                </Link>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Iniciar sesión
                </button>
              </nav>
            </div>
          </header>

          {/* Contenido principal */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
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
