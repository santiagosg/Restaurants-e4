import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  console.log('👤 Creando usuarios...');
  const adminUser = await prisma.user.create({
    data: {
      id: '1',
      email: 'admin@restaurants.com',
      password_hash: 'hashed_password_admin',
      full_name: 'Admin System',
      phone: '+54-11-5555-0000',
      role: 'ADMIN',
    },
  });

  const ownerUser1 = await prisma.user.create({
    data: {
      id: '2',
      email: 'owner1@restaurants.com',
      password_hash: 'hashed_password_owner1',
      full_name: 'Carlos Rodríguez',
      phone: '+54-11-5555-1111',
      role: 'RESTAURANT_OWNER',
    },
  });

  const ownerUser2 = await prisma.user.create({
    data: {
      id: '3',
      email: 'owner2@restaurants.com',
      password_hash: 'hashed_password_owner2',
      full_name: 'María González',
      phone: '+54-11-5555-2222',
      role: 'RESTAURANT_OWNER',
    },
  });

  const customerUser1 = await prisma.user.create({
    data: {
      id: '4',
      email: 'customer1@email.com',
      password_hash: 'hashed_password_customer1',
      full_name: 'Juan Pérez',
      phone: '+54-11-5555-3333',
      role: 'CUSTOMER',
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      id: '5',
      email: 'customer2@email.com',
      password_hash: 'hashed_password_customer2',
      full_name: 'Ana Martínez',
      phone: '+54-11-5555-4444',
      role: 'CUSTOMER',
    },
  });

  // Crear restaurantes
  console.log('🏪 Creando restaurantes...');
  const restaurant1 = await prisma.restaurant.create({
    data: {
      id: '1',
      name: 'La Parrilla del Lago',
      description: 'Especialidad en carnes a la parrilla con vista al lago',
      cuisine_type: 'PARRILLA',
      phone: '+54-11-5555-1234',
      address: 'Av. del Lago 1234',
      city: 'Buenos Aires',
      country: 'Argentina',
      zip_code: '1428',
      email: 'parrilla@lago.com',
      website: 'www.parrilladellago.com',
      logo_url: 'https://example.com/logo1.png',
      cover_image_url: 'https://example.com/cover1.jpg',
      average_rating: 4.5,
      total_reviews: 2,
      is_active: true,
      owner_id: ownerUser1.id,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      id: '2',
      name: 'Sabor Italiano',
      description: 'Auténtica cocina italiana con recetas tradicionales',
      cuisine_type: 'ITALIANA',
      phone: '+54-11-5555-5678',
      address: 'Calle Italia 456',
      city: 'Buenos Aires',
      country: 'Argentina',
      zip_code: '1410',
      email: 'italiano@sabor.com',
      website: 'www.saboritaliano.com',
      logo_url: 'https://example.com/logo2.png',
      cover_image_url: 'https://example.com/cover2.jpg',
      average_rating: 4.2,
      total_reviews: 1,
      is_active: true,
      owner_id: ownerUser2.id,
    },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: {
      id: '3',
      name: 'Sushi Zen',
      description: 'Fusion de sushi tradicional y contemporáneo',
      cuisine_type: 'ASIATICA',
      phone: '+54-11-5555-9012',
      address: 'Av. Corrientes 789',
      city: 'Buenos Aires',
      country: 'Argentina',
      zip_code: '1005',
      email: 'sushi@zen.com',
      website: 'www.sushizen.com',
      logo_url: 'https://example.com/logo3.png',
      cover_image_url: 'https://example.com/cover3.jpg',
      average_rating: 4.7,
      total_reviews: 2,
      is_active: true,
      owner_id: ownerUser1.id,
    },
  });

  // Crear categorías para restaurante 1
  console.log('📂 Creando categorías...');
  const cat1Bebidas = await prisma.menuCategory.create({
    data: {
      id: '1',
      restaurant_id: restaurant1.id,
      name: 'Bebidas',
      description: 'Refrescos, jugos, y tragos',
      display_order: 1,
    },
  });

  const cat1Entradas = await prisma.menuCategory.create({
    data: {
      id: '2',
      restaurant_id: restaurant1.id,
      name: 'Entradas',
      description: 'Aperitivos y platos pequeños',
      display_order: 2,
    },
  });

  const cat1Principales = await prisma.menuCategory.create({
    data: {
      id: '3',
      restaurant_id: restaurant1.id,
      name: 'Principales',
      description: 'Platos principales de carne y pescado',
      display_order: 3,
    },
  });

  const cat1Postres = await prisma.menuCategory.create({
    data: {
      id: '4',
      restaurant_id: restaurant1.id,
      name: 'Postres',
      description: 'Dulces y postres caseros',
      display_order: 4,
    },
  });

  // Crear categorías para restaurante 2
  const cat2Antipastos = await prisma.menuCategory.create({
    data: {
      id: '5',
      restaurant_id: restaurant2.id,
      name: 'Antipastos',
      description: 'Entradas italianas tradicionales',
      display_order: 1,
    },
  });

  const cat2Pasta = await prisma.menuCategory.create({
    data: {
      id: '6',
      restaurant_id: restaurant2.id,
      name: 'Pastas',
      description: 'Variados tipos de pasta fresca',
      display_order: 2,
    },
  });

  const cat2Pizza = await prisma.menuCategory.create({
    data: {
      id: '7',
      restaurant_id: restaurant2.id,
      name: 'Pizzas',
      description: 'Pizzas al horno de leña',
      display_order: 3,
    },
  });

  // Crear productos para restaurante 1
  console.log('🍽️ Creando productos...');
  await prisma.product.create({
    data: {
      id: '1',
      restaurant_id: restaurant1.id,
      category_id: cat1Bebidas.id,
      name: 'Limonada Natural',
      description: 'Jugo de limón natural sin azúcar',
      price: 450,
      currency: 'ARS',
      is_available: true,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: true,
      preparation_time: 5,
      calories: 80,
    },
  });

  await prisma.product.create({
    data: {
      id: '2',
      restaurant_id: restaurant1.id,
      category_id: cat1Entradas.id,
      name: 'Bruschetta Clásica',
      description: 'Pan tostado con tomate, albahaca y aceite de oliva',
      price: 1200,
      currency: 'ARS',
      is_available: true,
      is_vegetarian: true,
      preparation_time: 10,
      calories: 180,
    },
  });

  await prisma.product.create({
    data: {
      id: '3',
      restaurant_id: restaurant1.id,
      category_id: cat1Principales.id,
      name: 'Bife de Chorizo',
      description: 'Corte premium a la parrilla con ensalada',
      price: 4500,
      currency: 'ARS',
      is_available: true,
      is_gluten_free: true,
      preparation_time: 25,
      calories: 650,
    },
  });

  await prisma.product.create({
    data: {
      id: '4',
      restaurant_id: restaurant1.id,
      category_id: cat1Postres.id,
      name: 'Flan Casero',
      description: 'Flan tradicional con dulce de leche',
      price: 900,
      currency: 'ARS',
      is_available: true,
      is_vegetarian: true,
      preparation_time: 15,
      calories: 320,
    },
  });

  // Crear productos para restaurante 2
  await prisma.product.create({
    data: {
      id: '5',
      restaurant_id: restaurant2.id,
      category_id: cat2Antipastos.id,
      name: 'Capresse',
      description: 'Tomate y mozzarella fresca con albahaca',
      price: 1500,
      currency: 'ARS',
      is_available: true,
      is_vegetarian: true,
      preparation_time: 10,
      calories: 150,
    },
  });

  await prisma.product.create({
    data: {
      id: '6',
      restaurant_id: restaurant2.id,
      category_id: cat2Pasta.id,
      name: 'Spaghetti Carbonara',
      description: 'Pasta con guanciale, huevo y pecorino',
      price: 2800,
      currency: 'ARS',
      is_available: true,
      preparation_time: 20,
      calories: 550,
    },
  });

  await prisma.product.create({
    data: {
      id: '7',
      restaurant_id: restaurant2.id,
      category_id: cat2Pizza.id,
      name: 'Pizza Margherita',
      description: 'Tomate, mozzarella y albahaca',
      price: 3200,
      currency: 'ARS',
      is_available: true,
      is_vegetarian: true,
      preparation_time: 30,
      calories: 700,
    },
  });

  // Crear productos para restaurante 3 (sin categorías específicas)
  await prisma.product.create({
    data: {
      id: '8',
      restaurant_id: restaurant3.id,
      name: 'California Roll',
      description: 'Salmón, pepino, aguacate y semillas de sésamo',
      price: 3800,
      currency: 'ARS',
      is_available: true,
      preparation_time: 15,
      calories: 280,
    },
  });

  await prisma.product.create({
    data: {
      id: '9',
      restaurant_id: restaurant3.id,
      name: 'Nigiri de Atún',
      description: '12 piezas de nigiri de atún fresco',
      price: 5200,
      currency: 'ARS',
      is_available: true,
      preparation_time: 10,
      calories: 340,
    },
  });

  // Crear reservas
  console.log('📅 Creando reservas...');
  await prisma.reservation.create({
    data: {
      id: '1',
      restaurant_id: restaurant1.id,
      user_id: customerUser1.id,
      reservation_date: new Date('2024-12-25'),
      reservation_time: new Date('2024-12-25T20:00:00'),
      party_size: 4,
      special_requests: 'Cumpleaños, mesa cerca de la ventana',
      status: 'CONFIRMED',
    },
  });

  await prisma.reservation.create({
    data: {
      id: '2',
      restaurant_id: restaurant2.id,
      user_id: customerUser1.id,
      reservation_date: new Date('2024-12-26'),
      reservation_time: new Date('2024-12-26T19:30:00'),
      party_size: 2,
      special_requests: 'Oportunidad romántica',
      status: 'PENDING',
    },
  });

  await prisma.reservation.create({
    data: {
      id: '3',
      restaurant_id: restaurant3.id,
      user_id: customerUser2.id,
      reservation_date: new Date('2024-12-27'),
      reservation_time: new Date('2024-12-27T21:00:00'),
      party_size: 6,
      status: 'CONFIRMED',
    },
  });

  // Crear reseñas
  console.log('⭐ Creando reseñas...');
  await prisma.review.create({
    data: {
      id: '1',
      restaurant_id: restaurant1.id,
      user_id: customerUser1.id,
      rating: 5,
      comment: '¡Excelente comida y el servicio fue impecable! La vista al lago es espectacular.',
    },
  });

  await prisma.review.create({
    data: {
      id: '2',
      restaurant_id: restaurant1.id,
      user_id: customerUser2.id,
      rating: 4,
      comment: 'Muy buen bife, aunque el tiempo de espera fue un poco largo.',
    },
  });

  await prisma.review.create({
    data: {
      id: '3',
      restaurant_id: restaurant2.id,
      user_id: customerUser1.id,
      rating: 4,
      comment: 'La pasta casera está deliciosa, muy auténtica.',
    },
  });

  await prisma.review.create({
    data: {
      id: '4',
      restaurant_id: restaurant3.id,
      user_id: customerUser2.id,
      rating: 5,
      comment: 'El mejor sushi que he probado, calidad excepcional.',
    },
  });

  await prisma.review.create({
    data: {
      id: '5',
      restaurant_id: restaurant2.id,
      user_id: adminUser.id,
      rating: 4,
      comment: 'Pizza al horno de leña muy recomendada.',
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('📊 Resumen:');
  console.log('   - 5 Usuarios');
  console.log('   - 3 Restaurantes');
  console.log('   - 7 Categorías');
  console.log('   - 9 Productos');
  console.log('   - 3 Reservas');
  console.log('   - 5 Reseñas');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
