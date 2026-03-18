import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('MenuController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockOwner = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'owner@example.com',
    full_name: 'Restaurant Owner',
    role: 'RESTAURANT_OWNER',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCustomer = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    email: 'customer@example.com',
    full_name: 'Customer User',
    role: 'CUSTOMER',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAdmin = {
    id: '770e8400-e29b-41d4-a716-446655440002',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'ADMIN',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  let ownerToken: string;
  let customerToken: string;
  let adminToken: string;
  let testRestaurantId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = {
      imports: [AppModule],
      providers: [PrismaService],
    };

    app = await Test.createTestingModule(moduleFixture).compile();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.cleanDatabase();

    // Create test users
    await prisma.user.create({ data: mockOwner });
    await prisma.user.create({ data: mockCustomer });
    await prisma.user.create({ data: mockAdmin });

    // Get tokens
    const ownerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@example.com', password: 'password123' });

    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    ownerToken = ownerLogin.body.data.tokens.access_token;
    customerToken = customerLogin.body.data.tokens.access_token;
    adminToken = adminLogin.body.data.tokens.access_token;

    // Create test restaurant
    testRestaurantId = '880e8400-e29b-41d4-a716-446655440003';
    await prisma.restaurant.create({
      data: {
        id: testRestaurantId,
        owner_id: mockOwner.id,
        name: 'Test Restaurant',
        cuisine_type: 'Italian',
        address: '123 Test St',
        city: 'Madrid',
        country: 'Spain',
        zip_code: '28001',
        phone: '+34912345678',
        email: 'test@restaurant.com',
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean products and categories after each test
    await prisma.product.deleteMany();
    await prisma.menuCategory.deleteMany();
  });

  // ==========================================================================
  // CATEGORIES
  // ==========================================================================

  describe('GET /restaurants/:id/menu/categories', () => {
    beforeEach(async () => {
      // Create test categories
      await prisma.menuCategory.create({
        data: {
          id: '990e8400-e29b-41d4-a716-446655440004',
          restaurant_id: testRestaurantId,
          name: 'Appetizers',
          description: 'Start your meal',
          display_order: 1,
        },
      });

      await prisma.menuCategory.create({
        data: {
          id: 'aa0e8400-e29b-41d4-a716-446655440005',
          restaurant_id: testRestaurantId,
          name: 'Main Courses',
          description: 'Delicious mains',
          display_order: 2,
        },
      });

      await prisma.menuCategory.create({
        data: {
          id: 'bb0e8400-e29b-41d4-a716-446655440006',
          restaurant_id: testRestaurantId,
          name: 'Desserts',
          description: 'Sweet endings',
          display_order: 3,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería listar categorías del menú', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/categories`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(3);
        expect(body.data[0].name).toBe('Appetizers');
        expect(body.data[1].name).toBe('Main Courses');
        expect(body.data[2].name).toBe('Desserts');
      });

      it('debería listar solo categorías activas', async () => {
        await prisma.menuCategory.update({
          where: { id: '990e8400-e29b-41d4-a716-446655440004' },
          data: { is_active: false },
        });

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/categories`)
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        response.body.data.forEach((category: any) => {
          expect(category.name).not.toBe('Appetizers');
        });
      });

      it('debería ordenar por display_order', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/categories`)
          .expect(200);

        expect(response.body.data[0].display_order).toBe(1);
        expect(response.body.data[1].display_order).toBe(2);
        expect(response.body.data[2].display_order).toBe(3);
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/invalid-id/menu/categories')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/00000000-0000-0000-0000-000000000000/menu/categories')
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('POST /restaurants/:id/menu/categories', () => {
    describe('Casos exitosos', () => {
      it('debería crear una nueva categoría', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/categories`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Beverages',
            description: 'Drinks and refreshments',
            display_order: 4,
          })
          .expect(201);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBeDefined();
        expect(body.data.restaurant_id).toBe(testRestaurantId);
        expect(body.data.name).toBe('Beverages');
        expect(body.data.description).toBe('Drinks and refreshments');
        expect(body.data.display_order).toBe(4);
        expect(body.data.is_active).toBe(true);
      });

      it('debería crear categoría sin descripción', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/categories`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Salads',
            display_order: 5,
          })
          .expect(201);

        expect(response.body.data.name).toBe('Salads');
        expect(response.body.data.description).toBeNull();
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta crear categoría', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/categories`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Unauthorized',
            display_order: 1,
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/categories`)
          .send({
            name: 'No Auth',
            display_order: 1,
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si name no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/categories`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            display_order: 1,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si name excede 100 caracteres', async () => {
        const longName = 'A'.repeat(101);
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/categories`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: longName,
            display_order: 1,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si display_order es menor que 0', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/categories`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Category',
            display_order: -1,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('PATCH /restaurants/:restaurantId/menu/categories/:categoryId', () => {
    beforeEach(async () => {
      testCategoryId = 'cc0e8400-e29b-41d4-a716-446655440007';
      await prisma.menuCategory.create({
        data: {
          id: testCategoryId,
          restaurant_id: testRestaurantId,
          name: 'Original Name',
          description: 'Original Description',
          display_order: 1,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería actualizar nombre de categoría', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Updated Name',
          })
          .expect(200);

        expect(response.body.data.name).toBe('Updated Name');
        expect(response.body.data.description).toBe('Original Description');
      });

      it('debería actualizar display_order', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            display_order: 10,
          })
          .expect(200);

        expect(response.body.data.display_order).toBe(10);
      });

      it('debería desactivar categoría', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            is_active: false,
          })
          .expect(200);

        expect(response.body.data.is_active).toBe(false);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta actualizar', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Attempted Update',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });
  });

  describe('DELETE /restaurants/:restaurantId/menu/categories/:categoryId', () => {
    beforeEach(async () => {
      testCategoryId = 'dd0e8400-e29b-41d4-a716-446655440008';
      await prisma.menuCategory.create({
        data: {
          id: testCategoryId,
          restaurant_id: testRestaurantId,
          name: 'Deletable Category',
          display_order: 1,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería eliminar categoría', async () => {
        await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}/menu/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(204);

        const deleted = await prisma.menuCategory.findUnique({
          where: { id: testCategoryId },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Casos de error - Reglas de negocio', () => {
      it('debería retornar 422 si categoría tiene productos', async () => {
        // Create a product in the category
        await prisma.product.create({
          data: {
            id: 'ee0e8400-e29b-41d4-a716-446655440009',
            restaurant_id: testRestaurantId,
            category_id: testCategoryId,
            name: 'Test Product',
            price: 10.00,
          },
        });

        const response = await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}/menu/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  // ==========================================================================
  // PRODUCTS
  // ==========================================================================

  describe('GET /restaurants/:id/menu/products', () => {
    beforeEach(async () => {
      // Create category and products
      const category = await prisma.menuCategory.create({
        data: {
          id: 'ff0e8400-e29b-41d4-a716-44665544000a',
          restaurant_id: testRestaurantId,
          name: 'Main Courses',
          display_order: 1,
        },
      });

      await prisma.product.create({
        data: {
          id: '010e8400-e29b-41d4-a716-44665544000b',
          restaurant_id: testRestaurantId,
          category_id: category.id,
          name: 'Pizza Margherita',
          description: 'Classic tomato and mozzarella',
          price: 12.50,
          is_available: true,
          is_vegetarian: true,
        },
      });

      await prisma.product.create({
        data: {
          id: '020e8400-e29b-41d4-a716-44665544000c',
          restaurant_id: testRestaurantId,
          category_id: category.id,
          name: 'Pasta Carbonara',
          description: 'Creamy bacon pasta',
          price: 14.00,
          is_available: true,
          is_vegetarian: false,
        },
      });

      await prisma.product.create({
        data: {
          id: '030e8400-e29b-41d4-a716-44665544000d',
          restaurant_id: testRestaurantId,
          category_id: category.id,
          name: 'Lasagna',
          description: 'Layered pasta with meat sauce',
          price: 15.00,
          is_available: false,
          is_vegetarian: false,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería listar productos del menú con paginación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/products?page=1&per_page=2`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(2);
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.per_page).toBe(2);
        expect(body.pagination.total).toBe(3);
      });

      it('debería listar solo productos disponibles', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/products?available_only=true`)
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        response.body.data.forEach((product: any) => {
          expect(product.is_available).toBe(true);
        });
      });

      it('debería filtrar por categoría', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/products?category_id=ff0e8400-e29b-41d4-a716-44665544000a`)
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        response.body.data.forEach((product: any) => {
          expect(product.category_id).toBe('ff0e8400-e29b-41d4-a716-44665544000a');
        });
      });

      it('debería filtrar productos vegetarianos', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/products?vegetarian=true`)
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].name).toBe('Pizza Margherita');
      });

      it('debería incluir nombre de categoría', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/menu/products`)
          .expect(200);

        expect(response.body.data[0].category).toBeDefined();
        expect(response.body.data[0].category.name).toBe('Main Courses');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/invalid-id/menu/products')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/00000000-0000-0000-0000-000000000000/menu/products')
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('POST /restaurants/:id/menu/products', () => {
    let testCategoryId: string;

    beforeEach(async () => {
      testCategoryId = '040e8400-e29b-41d4-a716-44665544000e';
      await prisma.menuCategory.create({
        data: {
          id: testCategoryId,
          restaurant_id: testRestaurantId,
          name: 'Appetizers',
          display_order: 1,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería crear un nuevo producto', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            category_id: testCategoryId,
            name: 'Bruschetta',
            description: 'Toasted bread with tomatoes',
            price: 8.50,
            is_available: true,
            is_vegetarian: true,
            is_vegan: true,
          })
          .expect(201);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBeDefined();
        expect(body.data.restaurant_id).toBe(testRestaurantId);
        expect(body.data.category_id).toBe(testCategoryId);
        expect(body.data.name).toBe('Bruschetta');
        expect(body.data.price).toBe(8.50);
        expect(body.data.currency).toBe('USD');
        expect(body.data.is_available).toBe(true);
        expect(body.data.is_vegetarian).toBe(true);
        expect(body.data.is_vegan).toBe(true);
        expect(body.data.is_gluten_free).toBe(false);
      });

      it('debería crear producto con campos mínimos', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            category_id: testCategoryId,
            name: 'Simple Item',
            price: 10.00,
          })
          .expect(201);

        expect(response.body.data.name).toBe('Simple Item');
        expect(response.body.data.description).toBeNull();
        expect(response.body.data.image_url).toBeNull();
        expect(response.body.data.is_available).toBe(true);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta crear producto', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            category_id: testCategoryId,
            name: 'Unauthorized',
            price: 10.00,
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .send({
            category_id: testCategoryId,
            name: 'No Auth',
            price: 10.00,
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si category_id no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Product',
            price: 10.00,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si name no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            category_id: testCategoryId,
            price: 10.00,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si price no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            category_id: testCategoryId,
            name: 'Product',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si price es menor que 0', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            category_id: testCategoryId,
            name: 'Product',
            price: -5.00,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si categoría no existe', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/menu/products`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            category_id: '00000000-0000-0000-0000-000000000000',
            name: 'Product',
            price: 10.00,
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('PATCH /restaurants/:restaurantId/menu/products/:productId', () => {
    let testProductId: string;
    let testCategoryId: string;

    beforeEach(async () => {
      testCategoryId = '050e8400-e29b-41d4-a716-44665544000f';
      await prisma.menuCategory.create({
        data: {
          id: testCategoryId,
          restaurant_id: testRestaurantId,
          name: 'Main Courses',
          display_order: 1,
        },
      });

      testProductId = '060e8400-e29b-41d4-a716-446655440010';
      await prisma.product.create({
        data: {
          id: testProductId,
          restaurant_id: testRestaurantId,
          category_id: testCategoryId,
          name: 'Original Product',
          price: 15.00,
          is_available: true,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería actualizar nombre de producto', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/products/${testProductId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Updated Product',
          })
          .expect(200);

        expect(response.body.data.name).toBe('Updated Product');
      });

      it('debería actualizar precio de producto', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/products/${testProductId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            price: 18.50,
          })
          .expect(200);

        expect(response.body.data.price).toBe(18.50);
      });

      it('debería actualizar disponibilidad', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/products/${testProductId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            is_available: false,
          })
          .expect(200);

        expect(response.body.data.is_available).toBe(false);
      });

      it('debería actualizar múltiples campos', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/products/${testProductId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Complete Update',
            description: 'New description',
            price: 20.00,
            is_available: false,
            is_vegetarian: true,
            is_vegan: true,
          })
          .expect(200);

        expect(response.body.data.name).toBe('Complete Update');
        expect(response.body.data.description).toBe('New description');
        expect(response.body.data.price).toBe(20.00);
        expect(response.body.data.is_available).toBe(false);
        expect(response.body.data.is_vegetarian).toBe(true);
        expect(response.body.data.is_vegan).toBe(true);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta actualizar', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}/menu/products/${testProductId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Attempted Update',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });
  });

  describe('DELETE /restaurants/:restaurantId/menu/products/:productId', () => {
    let testProductId: string;
    let testCategoryId: string;

    beforeEach(async () => {
      testCategoryId = '070e8400-e29b-41d4-a716-446655440011';
      await prisma.menuCategory.create({
        data: {
          id: testCategoryId,
          restaurant_id: testRestaurantId,
          name: 'Main Courses',
          display_order: 1,
        },
      });

      testProductId = '080e8400-e29b-41d4-a716-446655440012';
      await prisma.product.create({
        data: {
          id: testProductId,
          restaurant_id: testRestaurantId,
          category_id: testCategoryId,
          name: 'Deletable Product',
          price: 10.00,
          is_available: true,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería eliminar producto', async () => {
        await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}/menu/products/${testProductId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(204);

        const deleted = await prisma.product.findUnique({
          where: { id: testProductId },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta eliminar', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}/menu/products/${testProductId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });
  });
});
