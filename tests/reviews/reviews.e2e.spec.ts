import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ReviewsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockCustomer = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'customer@example.com',
    full_name: 'Customer User',
    role: 'CUSTOMER',
    is_active: true,
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockOwner = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    email: 'owner@example.com',
    full_name: 'Restaurant Owner',
    role: 'RESTAURANT_OWNER',
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

  let customerToken: string;
  let ownerToken: string;
  let adminToken: string;
  let testRestaurantId: string;
  let testOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = {
      imports: [AppModule],
      providers: [PrismaService],
    };

    app = await Test.createTestingModule(moduleFixture).compile();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.cleanDatabase();

    // Create test users
    await prisma.user.create({ data: mockCustomer });
    await prisma.user.create({ data: mockOwner });
    await prisma.user.create({ data: mockAdmin });

    // Get tokens
    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });

    const ownerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@example.com', password: 'password123' });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    customerToken = customerLogin.body.data.tokens.access_token;
    ownerToken = ownerLogin.body.data.tokens.access_token;
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
        average_rating: 4.0,
        total_reviews: 10,
      },
    });

    // Create test order (linked to restaurant)
    testOrderId = '990e8400-e29b-41d4-a716-446655440004';
    await prisma.order.create({
      data: {
        id: testOrderId,
        restaurant_id: testRestaurantId,
        user_id: mockCustomer.id,
        order_number: '1234567890',
        order_type: 'DINE_IN',
        subtotal: 50.00,
        tax_amount: 5.00,
        total_amount: 55.00,
        status: 'SERVED',
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean reviews after each test
    await prisma.review.deleteMany();
  });

  describe('GET /restaurants/:id/reviews', () => {
    beforeEach(async () => {
      // Create test reviews
      await prisma.review.create({
        data: {
          id: 'aa0e8400-e29b-41d4-a716-446655440005',
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          order_id: testOrderId,
          rating: 5,
          comment: 'Amazing food and service!',
        },
      });

      const otherCustomer = await prisma.user.create({
        data: {
          id: 'bb0e8400-e29b-41d4-a716-446655440006',
          email: 'othercustomer@example.com',
          full_name: 'Other Customer',
          role: 'CUSTOMER',
          is_active: true,
          password_hash: 'hashed',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      await prisma.review.create({
        data: {
          id: 'cc0e8400-e29b-41d4-a716-446655440007',
          restaurant_id: testRestaurantId,
          user_id: otherCustomer.id,
          rating: 4,
          comment: 'Great atmosphere',
        },
      });

      await prisma.review.create({
        data: {
          id: 'dd0e8400-e29b-41d4-a716-446655440008',
          restaurant_id: testRestaurantId,
          user_id: otherCustomer.id,
          rating: 3,
          comment: 'Average experience',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería listar reseñas con paginación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews?page=1&per_page=2`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(2);
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.per_page).toBe(2);
        expect(body.pagination.total).toBe(3);
      });

      it('debería incluir información del usuario', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews`)
          .expect(200);

        expect(body.data[0].user).toBeDefined();
        expect(body.data[0].user.full_name).toBe('Customer User');
      });

      it('debería ordenar por fecha descendente por defecto', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews`)
          .expect(200);

        const dates = body.data.map((review: any) => new Date(review.created_at));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
        }
      });

      it('debería filtrar por rating mínimo', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews?min_rating=4`)
          .expect(200);

        expect(body.data).toHaveLength(2);
        body.data.forEach((review: any) => {
          expect(review.rating).toBeGreaterThanOrEqual(4);
        });
      });

      it('debería filtrar por rating máximo', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews?max_rating=3`)
          .expect(200);

        expect(body.data).toHaveLength(1);
        expect(body.data[0].rating).toBeLessThanOrEqual(3);
      });

      it('debería calcular promedio de ratings', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews`)
          .expect(200);

        expect(body.average_rating).toBeDefined();
        expect(body.average_rating).toBe(4);
      });

      it('debería calcular distribución de ratings', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews`)
          .expect(200);

        expect(body.rating_distribution).toBeDefined();
        expect(body.rating_distribution['5']).toBe(1);
        expect(body.rating_distribution['4']).toBe(1);
        expect(body.rating_distribution['3']).toBe(1);
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/invalid-id/reviews')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/00000000-0000-0000-0000-000000000000/reviews')
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 400 si min_rating no está entre 1 y 5', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews?min_rating=0`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si max_rating no está entre 1 y 5', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${testRestaurantId}/reviews?max_rating=6`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('POST /restaurants/:id/reviews', () => {
    describe('Casos exitosos', () => {
      it('debería crear una reseña exitosamente', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            order_id: testOrderId,
            rating: 5,
            comment: 'Excellent experience!',
          })
          .expect(201);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBeDefined();
        expect(body.data.restaurant_id).toBe(testRestaurantId);
        expect(body.data.user_id).toBe(mockCustomer.id);
        expect(body.data.order_id).toBe(testOrderId);
        expect(body.data.rating).toBe(5);
        expect(body.data.comment).toBe('Excellent experience!');
      });

      it('debería crear reseña sin orden asociada', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 4,
            comment: 'Great place!',
          })
          .expect(201);

        expect(body.success).toBe(true);
        expect(body.data.order_id).toBeNull();
      });

      it('debería crear reseña sin comentario', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 3,
          })
          .expect(201);

        expect(body.data.rating).toBe(3);
        expect(body.data.comment).toBeNull();
      });

      it('debería actualizar rating promedio del restaurante', async () => {
        const restaurantBefore = await prisma.restaurant.findUnique({
          where: { id: testRestaurantId },
        });

        await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 5,
            comment: 'Amazing!',
          })
          .expect(201);

        const restaurantAfter = await prisma.restaurant.findUnique({
          where: { id: testRestaurantId },
        });

        expect(restaurantAfter?.average_rating).not.toEqual(restaurantBefore?.average_rating);
        expect(restaurantAfter?.total_reviews).toBe(restaurantBefore?.total_reviews + 1);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .send({
            rating: 5,
            comment: 'No auth',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si rating no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            comment: 'No rating',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si rating es menor que 1', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 0,
            comment: 'Too low',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si rating es mayor que 5', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 6,
            comment: 'Too high',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si comment excede 1000 caracteres', async () => {
        const longComment = 'A'.repeat(1001);
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 5,
            comment: longComment,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants/00000000-0000-0000-0000-000000000000/reviews')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 5,
            comment: 'Not found',
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 404 si order_id no existe', async () => {
        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            order_id: '00000000-0000-0000-0000-000000000000',
            rating: 5,
            comment: 'Order not found',
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });

    describe('Casos de error - Reglas de negocio', () => {
      it('debería retornar 409 si usuario ya tiene reseña para esta orden', async () => {
        await prisma.review.create({
          data: {
            id: 'ee0e8400-e29b-41d4-a716-446655440009',
            restaurant_id: testRestaurantId,
            user_id: mockCustomer.id,
            order_id: testOrderId,
            rating: 4,
            comment: 'First review',
          },
        });

        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            order_id: testOrderId,
            rating: 5,
            comment: 'Second review',
          })
          .expect(409);

        expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
      });

      it('debería retornar 422 si orden no pertenece al usuario', async () => {
        const otherCustomer = await prisma.user.create({
          data: {
            id: 'ff0e8400-e29b-41d4-a716-44665544000a',
            email: 'othercustomer2@example.com',
            full_name: 'Other Customer 2',
            role: 'CUSTOMER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherOrder = await prisma.order.create({
          data: {
            id: '010e8400-e29b-41d4-a716-44665544000b',
            restaurant_id: testRestaurantId,
            user_id: otherCustomer.id,
            order_number: '0987654321',
            order_type: 'DINE_IN',
            subtotal: 30.00,
            tax_amount: 3.00,
            total_amount: 33.00,
            status: 'SERVED',
          },
        });

        const response = await request(app.getHttpServer())
          .post(`/restaurants/${testRestaurantId}/reviews`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            order_id: otherOrder.id,
            rating: 5,
            comment: 'Not my order',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /reviews/:id', () => {
    let testReviewId: string;

    beforeEach(async () => {
      testReviewId = '020e8400-e29b-41d4-a716-44665544000c';
      await prisma.review.create({
        data: {
          id: testReviewId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          order_id: testOrderId,
          rating: 5,
          comment: 'Detailed review with great food and excellent service!',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería obtener reseña por ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reviews/${testReviewId}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(testReviewId);
        expect(body.data.rating).toBe(5);
        expect(body.data.comment).toBe('Detailed review with great food and excellent service!');
      });

      it('debería incluir información del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reviews/${testReviewId}`)
          .expect(200);

        expect(body.data.restaurant).toBeDefined();
        expect(body.data.restaurant.name).toBe('Test Restaurant');
      });

      it('debería incluir información del usuario', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reviews/${testReviewId}`)
          .expect(200);

        expect(body.data.user).toBeDefined();
        expect(body.data.user.full_name).toBe('Customer User');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/reviews/invalid-id')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si reseña no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/reviews/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('PATCH /reviews/:id', () => {
    let testReviewId: string;

    beforeEach(async () => {
      testReviewId = '030e8400-e29b-41d4-a716-44665544000d';
      await prisma.review.create({
        data: {
          id: testReviewId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          rating: 4,
          comment: 'Original comment',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería actualizar rating de la reseña', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 5,
          })
          .expect(200);

        expect(response.body.data.rating).toBe(5);
        expect(response.body.data.comment).toBe('Original comment');
      });

      it('debería actualizar comentario de la reseña', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            comment: 'Updated comment',
          })
          .expect(200);

        expect(response.body.data.comment).toBe('Updated comment');
        expect(response.body.data.rating).toBe(4);
      });

      it('debería actualizar ambos campos', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 3,
            comment: 'Completely updated',
          })
          .expect(200);

        expect(response.body.data.rating).toBe(3);
        expect(response.body.data.comment).toBe('Completely updated');
      });

      it('debería permitir al admin actualizar cualquier reseña', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            comment: 'Admin updated',
          })
          .expect(200);

        expect(response.body.data.comment).toBe('Admin updated');
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si usuario intenta actualizar reseña de otro', async () => {
        const otherCustomer = await prisma.user.create({
          data: {
            id: '040e8400-e29b-41d4-a716-44665544000e',
            email: 'othercustomer3@example.com',
            full_name: 'Other Customer 3',
            role: 'CUSTOMER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherLogin = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'othercustomer3@example.com', password: 'password123' });

        const otherToken = otherLogin.body.data.tokens.access_token;

        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({
            comment: 'Attempted update',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .send({
            comment: 'No auth',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .patch('/reviews/invalid-id')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 5,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si reseña no existe', async () => {
        const response = await request(app.getHttpServer())
          .patch('/reviews/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 5,
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 400 si rating no está entre 1 y 5', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            rating: 6,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si comment excede 1000 caracteres', async () => {
        const longComment = 'A'.repeat(1001);
        const response = await request(app.getHttpServer())
          .patch(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            comment: longComment,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('DELETE /reviews/:id', () => {
    let testReviewId: string;

    beforeEach(async () => {
      testReviewId = '050e8400-e29b-41d4-a716-44665544000f';
      await prisma.review.create({
        data: {
          id: testReviewId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          rating: 4,
          comment: 'Deletable review',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería eliminar reseña como propietario', async () => {
        await request(app.getHttpServer())
          .delete(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(204);

        const deleted = await prisma.review.findUnique({
          where: { id: testReviewId },
        });
        expect(deleted).toBeNull();
      });

      it('debería eliminar reseña como admin', async () => {
        await prisma.review.create({
          data: {
            id: '060e8400-e29b-41d4-a716-446655440010',
            restaurant_id: testRestaurantId,
            user_id: mockCustomer.id,
            rating: 3,
            comment: 'Admin deletable',
          },
        });

        await request(app.getHttpServer())
          .delete('/reviews/060e8400-e29b-41d4-a716-446655440010')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);

        const deleted = await prisma.review.findUnique({
          where: { id: '060e8400-e29b-41d4-a716-446655440010' },
        });
        expect(deleted).toBeNull();
      });

      it('debería actualizar rating promedio del restaurante', async () => {
        const restaurantBefore = await prisma.restaurant.findUnique({
          where: { id: testRestaurantId },
        });

        await request(app.getHttpServer())
          .delete(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(204);

        const restaurantAfter = await prisma.restaurant.findUnique({
          where: { id: testRestaurantId },
        });

        expect(restaurantAfter?.total_reviews).toBe(restaurantBefore?.total_reviews - 1);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si usuario intenta eliminar reseña de otro', async () => {
        const otherCustomer = await prisma.user.create({
          data: {
            id: '070e8400-e29b-41d4-a716-446655440011',
            email: 'othercustomer4@example.com',
            full_name: 'Other Customer 4',
            role: 'CUSTOMER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherLogin = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'othercustomer4@example.com', password: 'password123' });

        const otherToken = otherLogin.body.data.tokens.access_token;

        const response = await request(app.getHttpServer())
          .delete(`/reviews/${testReviewId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/reviews/${testReviewId}`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .delete('/reviews/invalid-id')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si reseña no existe', async () => {
        const response = await request(app.getHttpServer())
          .delete('/reviews/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });
});
