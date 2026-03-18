import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('RestaurantsController (e2e)', () => {
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
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean restaurants after each test
    await prisma.restaurant.deleteMany();
  });

  describe('GET /restaurants', () => {
    describe('Casos exitosos', () => {
      beforeEach(async () => {
        // Create test restaurants
        await prisma.restaurant.create({
          data: {
            id: '880e8400-e29b-41d4-a716-446655440003',
            owner_id: mockOwner.id,
            name: 'La Cucina Italiana',
            cuisine_type: 'Italian',
            address: '123 Main St',
            city: 'Madrid',
            country: 'Spain',
            zip_code: '28001',
            phone: '+34912345678',
            email: 'italian@restaurant.com',
            average_rating: 4.5,
            total_reviews: 100,
          },
        });

        await prisma.restaurant.create({
          data: {
            id: '990e8400-e29b-41d4-a716-446655440004',
            owner_id: mockOwner.id,
            name: 'El Asador',
            cuisine_type: 'Spanish',
            address: '456 Oak Ave',
            city: 'Barcelona',
            country: 'Spain',
            zip_code: '08001',
            phone: '+34923456789',
            email: 'spanish@restaurant.com',
            average_rating: 4.2,
            total_reviews: 75,
          },
        });

        await prisma.restaurant.create({
          data: {
            id: 'aa0e8400-e29b-41d4-a716-446655440005',
            owner_id: mockOwner.id,
            name: 'Tokyo Ramen',
            cuisine_type: 'Japanese',
            address: '789 Pine Rd',
            city: 'Madrid',
            country: 'Spain',
            zip_code: '28002',
            phone: '+34934567890',
            email: 'japanese@restaurant.com',
            average_rating: 4.8,
            total_reviews: 150,
          },
        });
      });

      it('debería listar restaurantes con paginación', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?page=1&per_page=2')
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(2);
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.per_page).toBe(2);
        expect(body.pagination.total).toBe(3);
        expect(body.pagination.total_pages).toBe(2);
      });

      it('debería filtrar por ciudad', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?city=Madrid')
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        response.body.data.forEach((restaurant: any) => {
          expect(restaurant.city).toBe('Madrid');
        });
      });

      it('debería filtrar por tipo de cocina', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?cuisine_type=Italian')
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].name).toBe('La Cucina Italiana');
      });

      it('debería ordenar por rating descendente', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?sort_by=rating&sort_order=desc')
          .expect(200);

        expect(response.body.data[0].name).toBe('Tokyo Ramen');
        expect(response.body.data[0].average_rating).toBeGreaterThan(
          response.body.data[1].average_rating,
        );
      });

      it('debería buscar por nombre', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?search=Asador')
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].name).toContain('Asador');
      });

      it('debería incluir solo restaurantes activos por defecto', async () => {
        await prisma.restaurant.update({
          where: { id: '880e8400-e29b-41d4-a716-446655440003' },
          data: { is_active: false },
        });

        const response = await request(app.getHttpServer())
          .get('/restaurants')
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        response.body.data.forEach((restaurant: any) => {
          expect(restaurant.is_active).toBe(true);
        });
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si page no es número positivo', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?page=0')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si per_page excede 100', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?per_page=101')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si sort_by no es válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?sort_by=invalid_field')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si sort_order no es válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants?sort_order=invalid')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('GET /restaurants/:id', () => {
    describe('Casos exitosos', () => {
      beforeEach(async () => {
        testRestaurantId = 'bb0e8400-e29b-41d4-a716-446655440006';
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
            description: 'A wonderful Italian restaurant',
            website: 'https://testrestaurant.com',
            logo_url: 'https://testrestaurant.com/logo.png',
            cover_image_url: 'https://testrestaurant.com/cover.png',
            average_rating: 4.5,
            total_reviews: 50,
          },
        });
      });

      it('debería obtener detalles de un restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(testRestaurantId);
        expect(body.data.name).toBe('Test Restaurant');
        expect(body.data.description).toBe('A wonderful Italian restaurant');
        expect(body.data.website).toBe('https://testrestaurant.com');
        expect(body.data.average_rating).toBe(4.5);
      });

      it('debería incluir horarios del restaurante', async () => {
        await prisma.restaurantHour.createMany({
          data: [
            {
              id: 'cc0e8400-e29b-41d4-a716-446655440007',
              restaurant_id: testRestaurantId,
              day_of_week: 1,
              open_time: '12:00',
              close_time: '15:00',
              is_closed: false,
            },
            {
              id: 'dd0e8400-e29b-41d4-a716-446655440008',
              restaurant_id: testRestaurantId,
              day_of_week: 1,
              open_time: '19:00',
              close_time: '23:00',
              is_closed: false,
            },
          ],
        });

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}`)
          .expect(200);

        expect(response.body.data.hours).toBeDefined();
        expect(response.body.data.hours.length).toBeGreaterThan(0);
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/invalid-id')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 404 si restaurante está inactivo', async () => {
        const restaurant = await prisma.restaurant.create({
          data: {
            id: 'ee0e8400-e29b-41d4-a716-446655440009',
            owner_id: mockOwner.id,
            name: 'Inactive Restaurant',
            cuisine_type: 'Italian',
            address: '123 Inactive St',
            city: 'Madrid',
            country: 'Spain',
            zip_code: '28001',
            phone: '+34912345678',
            email: 'inactive@restaurant.com',
            is_active: false,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${restaurant.id}`)
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('POST /restaurants', () => {
    describe('Casos exitosos', () => {
      it('debería crear un nuevo restaurante como owner', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'New Restaurant',
            cuisine_type: 'Italian',
            address: '123 New St',
            city: 'Madrid',
            country: 'Spain',
            zip_code: '28001',
            phone: '+34912345678',
            email: 'new@restaurant.com',
            description: 'A new Italian restaurant',
            website: 'https://newrestaurant.com',
          })
          .expect(201);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBeDefined();
        expect(body.data.name).toBe('New Restaurant');
        expect(body.data.owner_id).toBe(mockOwner.id);
        expect(body.data.is_active).toBe(true);
        expect(body.data.average_rating).toBe(0);
        expect(body.data.total_reviews).toBe(0);
      });

      it('debería crear restaurante con campos opcionales', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Simple Restaurant',
            cuisine_type: 'Spanish',
            address: '456 Simple St',
            city: 'Barcelona',
            country: 'Spain',
            phone: '+34923456789',
            email: 'simple@restaurant.com',
          })
          .expect(201);

        expect(response.body.data.name).toBe('Simple Restaurant');
        expect(response.body.data.description).toBeNull();
        expect(response.body.data.website).toBeNull();
        expect(response.body.data.zip_code).toBeNull();
      });

      it('debería asignar is_active: true por defecto', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Active Restaurant',
            cuisine_type: 'French',
            address: '789 Active St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34934567890',
            email: 'active@restaurant.com',
          })
          .expect(201);

        expect(response.body.data.is_active).toBe(true);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta crear restaurante', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Unauthorized Restaurant',
            cuisine_type: 'Italian',
            address: '123 Unauthorized St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'unauthorized@restaurant.com',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .send({
            name: 'No Auth Restaurant',
            cuisine_type: 'Italian',
            address: '123 No Auth St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'noauth@restaurant.com',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si name no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            cuisine_type: 'Italian',
            address: '123 St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'test@restaurant.com',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si name excede 100 caracteres', async () => {
        const longName = 'A'.repeat(101);
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: longName,
            cuisine_type: 'Italian',
            address: '123 St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'test@restaurant.com',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si email tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Test Restaurant',
            cuisine_type: 'Italian',
            address: '123 St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'invalid-email',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si phone tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Test Restaurant',
            cuisine_type: 'Italian',
            address: '123 St',
            city: 'Madrid',
            country: 'Spain',
            phone: 'invalid-phone',
            email: 'test@restaurant.com',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 409 si email ya existe', async () => {
        await prisma.restaurant.create({
          data: {
            id: 'ff0e8400-e29b-41d4-a716-44665544000a',
            owner_id: mockOwner.id,
            name: 'Existing Restaurant',
            cuisine_type: 'Italian',
            address: '123 Existing St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'duplicate@restaurant.com',
          },
        });

        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Another Restaurant',
            cuisine_type: 'Spanish',
            address: '456 Another St',
            city: 'Barcelona',
            country: 'Spain',
            phone: '+34923456789',
            email: 'duplicate@restaurant.com',
          })
          .expect(409);

        expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
      });

      it('debería retornar 409 si nombre ya existe para el mismo owner', async () => {
        await prisma.restaurant.create({
          data: {
            id: '010e8400-e29b-41d4-a716-44665544000b',
            owner_id: mockOwner.id,
            name: 'Unique Name',
            cuisine_type: 'Italian',
            address: '123 Unique St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'unique@restaurant.com',
          },
        });

        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Unique Name',
            cuisine_type: 'Spanish',
            address: '456 Duplicate St',
            city: 'Barcelona',
            country: 'Spain',
            phone: '+34923456789',
            email: 'another@restaurant.com',
          })
          .expect(409);

        expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
      });
    });
  });

  describe('PATCH /restaurants/:id', () => {
    let testRestaurantId: string;

    beforeEach(async () => {
      testRestaurantId = '020e8400-e29b-41d4-a716-44665544000c';
      await prisma.restaurant.create({
        data: {
          id: testRestaurantId,
          owner_id: mockOwner.id,
          name: 'Original Restaurant',
          cuisine_type: 'Italian',
          address: '123 Original St',
          city: 'Madrid',
          country: 'Spain',
          zip_code: '28001',
          phone: '+34912345678',
          email: 'original@restaurant.com',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería actualizar nombre del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Updated Restaurant',
          })
          .expect(200);

        expect(response.body.data.name).toBe('Updated Restaurant');
        expect(response.body.data.cuisine_type).toBe('Italian');
      });

      it('debería actualizar descripción del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            description: 'New description',
          })
          .expect(200);

        expect(response.body.data.description).toBe('New description');
      });

      it('debería actualizar múltiples campos', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Completely Updated',
            description: 'All new',
            website: 'https://updated.com',
            phone: '+34999999999',
          })
          .expect(200);

        expect(response.body.data.name).toBe('Completely Updated');
        expect(response.body.data.description).toBe('All new');
        expect(response.body.data.website).toBe('https://updated.com');
        expect(response.body.data.phone).toBe('+34999999999');
      });

      it('debería permitir al admin actualizar cualquier restaurante', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Admin Updated',
          })
          .expect(200);

        expect(response.body.data.name).toBe('Admin Updated');
      });

      it('debería permitir al admin desactivar restaurante', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${adminToken}`)
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
          .patch(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Unauthorized Update',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 403 si owner intenta actualizar restaurante de otro owner', async () => {
        const otherOwner = await prisma.user.create({
          data: {
            id: '030e8400-e29b-41d4-a716-44665544000d',
            email: 'otherowner@example.com',
            full_name: 'Other Owner',
            role: 'RESTAURANT_OWNER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherRestaurant = await prisma.restaurant.create({
          data: {
            id: '040e8400-e29b-41d4-a716-44665544000e',
            owner_id: otherOwner.id,
            name: 'Other Restaurant',
            cuisine_type: 'Spanish',
            address: '123 Other St',
            city: 'Barcelona',
            country: 'Spain',
            phone: '+34923456789',
            email: 'other@restaurant.com',
          },
        });

        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${otherRestaurant.id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Attempted Update',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}`)
          .send({
            name: 'No Auth',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .patch('/restaurants/invalid-id')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Test',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .patch('/restaurants/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Non-existent',
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 400 si name excede 100 caracteres', async () => {
        const longName = 'A'.repeat(101);
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: longName,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('DELETE /restaurants/:id', () => {
    let testRestaurantId: string;

    beforeEach(async () => {
      testRestaurantId = '050e8400-e29b-41d4-a716-44665544000f';
      await prisma.restaurant.create({
        data: {
          id: testRestaurantId,
          owner_id: mockOwner.id,
          name: 'Deletable Restaurant',
          cuisine_type: 'Italian',
          address: '123 Delete St',
          city: 'Madrid',
          country: 'Spain',
          phone: '+34912345678',
          email: 'deletable@restaurant.com',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería eliminar restaurante como owner', async () => {
        await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(204);

        const deleted = await prisma.restaurant.findUnique({
          where: { id: testRestaurantId },
        });
        expect(deleted).toBeNull();
      });

      it('debería eliminar restaurante como admin', async () => {
        await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);

        const deleted = await prisma.restaurant.findUnique({
          where: { id: testRestaurantId },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta eliminar', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 403 si owner intenta eliminar restaurante de otro', async () => {
        const otherOwner = await prisma.user.create({
          data: {
            id: '060e8400-e29b-41d4-a716-446655440010',
            email: 'otherowner2@example.com',
            full_name: 'Other Owner 2',
            role: 'RESTAURANT_OWNER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherRestaurant = await prisma.restaurant.create({
          data: {
            id: '070e8400-e29b-41d4-a716-446655440011',
            owner_id: otherOwner.id,
            name: 'Other Restaurant 2',
            cuisine_type: 'Spanish',
            address: '123 Other St 2',
            city: 'Barcelona',
            country: 'Spain',
            phone: '+34923456789',
            email: 'other2@restaurant.com',
          },
        });

        const response = await request(app.getHttpServer())
          .delete(`/restaurants/${otherRestaurant.id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/restaurants/${testRestaurantId}`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .delete('/restaurants/invalid-id')
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .delete('/restaurants/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('GET /restaurants/:id/statistics', () => {
    let testRestaurantId: string;

    beforeEach(async () => {
      testRestaurantId = '080e8400-e29b-41d4-a716-446655440012';
      await prisma.restaurant.create({
        data: {
          id: testRestaurantId,
          owner_id: mockOwner.id,
          name: 'Stats Restaurant',
          cuisine_type: 'Italian',
          address: '123 Stats St',
          city: 'Madrid',
          country: 'Spain',
          phone: '+34912345678',
          email: 'stats@restaurant.com',
          average_rating: 4.5,
          total_reviews: 50,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería obtener estadísticas del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/statistics`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
        expect(body.data.average_rating).toBe(4.5);
        expect(body.data.total_reviews).toBe(50);
        expect(body.data.total_reservations).toBeDefined();
        expect(body.data.total_orders).toBeDefined();
        expect(body.data.total_revenue).toBeDefined();
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta ver estadísticas', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/statistics`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 403 si owner intenta ver estadísticas de otro', async () => {
        const otherOwner = await prisma.user.create({
          data: {
            id: '090e8400-e29b-41d4-a716-446655440013',
            email: 'otherowner3@example.com',
            full_name: 'Other Owner 3',
            role: 'RESTAURANT_OWNER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherRestaurant = await prisma.restaurant.create({
          data: {
            id: '0a0e8400-e29b-41d4-a716-446655440014',
            owner_id: otherOwner.id,
            name: 'Other Restaurant 3',
            cuisine_type: 'Spanish',
            address: '123 Other St 3',
            city: 'Barcelona',
            country: 'Spain',
            phone: '+34923456789',
            email: 'other3@restaurant.com',
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/restaurants/${otherRestaurant.id}/statistics`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });
  });
});
