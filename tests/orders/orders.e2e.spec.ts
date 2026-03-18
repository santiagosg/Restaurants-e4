import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('OrdersController (e2e)', () => {
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
  let testTableId: string;
  let testReservationId: string;

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
      },
    });

    // Create test table
    testTableId = '990e8400-e29b-41d4-a716-446655440004';
    await prisma.table.create({
      data: {
        id: testTableId,
        restaurant_id: testRestaurantId,
        table_number: 1,
        capacity: 4,
      },
    });

    // Create test reservation
    testReservationId = 'aa0e8400-e29b-41d4-a716-446655440005';
    await prisma.reservation.create({
      data: {
        id: testReservationId,
        restaurant_id: testRestaurantId,
        user_id: mockCustomer.id,
        table_id: testTableId,
        reservation_date: new Date('2024-12-25'),
        reservation_time: '19:30',
        party_size: 4,
        status: 'SEATED',
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean orders and order items after each test
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  describe('POST /orders', () => {
    describe('Casos exitosos', () => {
      it('debería crear un pedido DINE_IN exitosamente', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            reservation_id: testReservationId,
            order_type: 'DINE_IN',
            items: [
              {
                name: 'Pizza Margherita',
                quantity: 2,
                unit_price: 12.50,
              },
              {
                name: 'Pasta Carbonara',
                quantity: 1,
                unit_price: 14.00,
              },
            ],
            notes: 'Extra cheese please',
          })
          .expect(201);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBeDefined();
        expect(body.data.restaurant_id).toBe(testRestaurantId);
        expect(body.data.user_id).toBe(mockCustomer.id);
        expect(body.data.reservation_id).toBe(testReservationId);
        expect(body.data.order_type).toBe('DINE_IN');
        expect(body.data.status).toBe('PENDING');
        expect(body.data.subtotal).toBe(39.00);
        expect(body.data.items).toHaveLength(2);
      });

      it('debería crear un pedido TAKEOUT exitosamente', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Hamburger',
                quantity: 2,
                unit_price: 10.00,
              },
            ],
          })
          .expect(201);

        expect(response.body.data.order_type).toBe('TAKEOUT');
        expect(response.body.data.reservation_id).toBeNull();
      });

      it('debería crear un pedido DELIVERY exitosamente', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'DELIVERY',
            items: [
              {
                name: 'Sushi Roll',
                quantity: 1,
                unit_price: 18.00,
              },
            ],
            notes: 'Ring the doorbell',
          })
          .expect(201);

        expect(response.body.data.order_type).toBe('DELIVERY');
      });

      it('debería calcular subtotal correctamente', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item 1',
                quantity: 3,
                unit_price: 10.00,
              },
              {
                name: 'Item 2',
                quantity: 2,
                unit_price: 5.50,
              },
            ],
          })
          .expect(201);

        // (3 * 10.00) + (2 * 5.50) = 30.00 + 11.00 = 41.00
        expect(response.body.data.subtotal).toBe(41.00);
      });

      it('debería calcular tax_amount correctamente (10%)', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 100.00,
              },
            ],
          })
          .expect(201);

        expect(response.body.data.subtotal).toBe(100.00);
        expect(response.body.data.tax_amount).toBe(10.00);
        expect(response.body.data.total_amount).toBe(110.00);
      });

      it('debería asignar order_number único', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(201);

        expect(response.body.data.order_number).toBeDefined();
        expect(response.body.data.order_number).toMatch(/^\d{10}$/);
      });

      it('debería incluir instrucciones especiales por item', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Pizza',
                quantity: 1,
                unit_price: 15.00,
                special_instructions: 'No onions',
              },
            ],
          })
          .expect(201);

        expect(response.body.data.items[0].special_instructions).toBe('No onions');
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si restaurant_id no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si order_type no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si items está vacío', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [],
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si order_type no es válido', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'INVALID_TYPE',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si item name no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si item quantity es menor que 1', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item',
                quantity: 0,
                unit_price: 10.00,
              },
            ],
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si item unit_price es menor que 0', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: -5.00,
              },
            ],
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: '00000000-0000-0000-0000-000000000000',
            order_type: 'TAKEOUT',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 404 si reserva no existe', async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            reservation_id: '00000000-0000-0000-0000-000000000000',
            order_type: 'DINE_IN',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 422 si reserva no pertenece al usuario', async () => {
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

        const otherReservation = await prisma.reservation.create({
          data: {
            id: 'cc0e8400-e29b-41d4-a716-446655440007',
            restaurant_id: testRestaurantId,
            user_id: otherCustomer.id,
            table_id: testTableId,
            reservation_date: new Date('2024-12-26'),
            reservation_time: '19:30',
            party_size: 4,
            status: 'SEATED',
          },
        });

        const response = await request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            reservation_id: otherReservation.id,
            order_type: 'DINE_IN',
            items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /orders/:id', () => {
    let testOrderId: string;

    beforeEach(async () => {
      testOrderId = 'dd0e8400-e29b-41d4-a716-446655440008';
      const order = await prisma.order.create({
        data: {
          id: testOrderId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          order_number: '1234567890',
          order_type: 'DINE_IN',
          subtotal: 39.00,
          tax_amount: 3.90,
          total_amount: 42.90,
          status: 'PREPARING',
        },
      });

      await prisma.orderItem.createMany({
        data: [
          {
            id: 'ee0e8400-e29b-41d4-a716-446655440009',
            order_id: order.id,
            name: 'Pizza Margherita',
            quantity: 2,
            unit_price: 12.50,
            subtotal: 25.00,
          },
          {
            id: 'ff0e8400-e29b-41d4-a716-44665544000a',
            order_id: order.id,
            name: 'Pasta Carbonara',
            quantity: 1,
            unit_price: 14.00,
            subtotal: 14.00,
          },
        ],
      });
    });

    describe('Casos exitosos', () => {
      it('debería obtener pedido del usuario', async () => {
        const response = await request(app.getHttpServer())
          .get(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(testOrderId);
        expect(body.data.order_number).toBe('1234567890');
        expect(body.data.status).toBe('PREPARING');
        expect(body.data.items).toHaveLength(2);
        expect(body.data.items[0].name).toBe('Pizza Margherita');
      });

      it('debería incluir información del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body.data.restaurant).toBeDefined();
        expect(response.body.data.restaurant.name).toBe('Test Restaurant');
      });

      it('debería permitir al admin ver cualquier pedido', async () => {
        const response = await request(app.getHttpServer())
          .get(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.data.id).toBe(testOrderId);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si usuario intenta ver pedido de otro', async () => {
        const otherCustomer = await prisma.user.create({
          data: {
            id: '010e8400-e29b-41d4-a716-44665544000b',
            email: 'othercustomer2@example.com',
            full_name: 'Other Customer 2',
            role: 'CUSTOMER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherLogin = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'othercustomer2@example.com', password: 'password123' });

        const otherToken = otherLogin.body.data.tokens.access_token;

        const response = await request(app.getHttpServer())
          .get(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/orders/${testOrderId}`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders/invalid-id')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si pedido no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('PATCH /orders/:id/status', () => {
    let testOrderId: string;

    beforeEach(async () => {
      testOrderId = '020e8400-e29b-41d4-a716-44665544000c';
      await prisma.order.create({
        data: {
          id: testOrderId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          order_number: '0987654321',
          order_type: 'DINE_IN',
          subtotal: 25.00,
          tax_amount: 2.50,
          total_amount: 27.50,
          status: 'PENDING',
        },
      });
    });

    describe('Casos exitosos - Transiciones válidas', () => {
      it('debería cambiar de PENDING a CONFIRMED', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(200);

        expect(response.body.data.status).toBe('CONFIRMED');
      });

      it('debería cambiar de CONFIRMED a PREPARING', async () => {
        await prisma.order.update({
          where: { id: testOrderId },
          data: { status: 'CONFIRMED' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'PREPARING',
          })
          .expect(200);

        expect(response.body.data.status).toBe('PREPARING');
      });

      it('debería cambiar de PREPARING a READY', async () => {
        await prisma.order.update({
          where: { id: testOrderId },
          data: { status: 'PREPARING' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'READY',
          })
          .expect(200);

        expect(response.body.data.status).toBe('READY');
      });

      it('debería cambiar de READY a SERVED', async () => {
        await prisma.order.update({
          where: { id: testOrderId },
          data: { status: 'READY' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'SERVED',
          })
          .expect(200);

        expect(response.body.data.status).toBe('SERVED');
      });

      it('debería cambiar de cualquier estado a CANCELLED', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'CANCELLED',
          })
          .expect(200);

        expect(response.body.data.status).toBe('CANCELLED');
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si customer intenta cambiar estado', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .patch('/orders/invalid-id/status')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si pedido no existe', async () => {
        const response = await request(app.getHttpServer())
          .patch('/orders/00000000-0000-0000-0000-000000000000/status')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 422 si status no es válido', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'INVALID_STATUS',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });

      it('debería retornar 422 si transición de estado inválida', async () => {
        await prisma.order.update({
          where: { id: testOrderId },
          data: { status: 'SERVED' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'PREPARING',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });

      it('debería retornar 422 si intenta cambiar de CANCELLED', async () => {
        await prisma.order.update({
          where: { id: testOrderId },
          data: { status: 'CANCELLED' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('PATCH /orders/:id', () => {
    let testOrderId: string;

    beforeEach(async () => {
      testOrderId = '030e8400-e29b-41d4-a716-44665544000d';
      const order = await prisma.order.create({
        data: {
          id: testOrderId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          order_number: '1111111111',
          order_type: 'DINE_IN',
          subtotal: 25.00,
          tax_amount: 2.50,
          total_amount: 27.50,
          status: 'PENDING',
        },
      });

      await prisma.orderItem.create({
        data: {
          id: '040e8400-e29b-41d4-a716-44665544000e',
          order_id: order.id,
          name: 'Pizza',
          quantity: 2,
          unit_price: 12.50,
          subtotal: 25.00,
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería actualizar notas del pedido', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            notes: 'Extra spicy please',
          })
          .expect(200);

        expect(response.body.data.notes).toBe('Extra spicy please');
      });

      it('debería agregar items al pedido', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            add_items: [
              {
                name: 'Salad',
                quantity: 1,
                unit_price: 8.00,
              },
            ],
          })
          .expect(200);

        expect(response.body.data.items).toHaveLength(2);
        expect(response.body.data.items[1].name).toBe('Salad');
        expect(response.body.data.subtotal).toBe(33.00);
      });

      it('debería permitir al owner agregar items', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            add_items: [
              {
                name: 'Beverage',
                quantity: 2,
                unit_price: 3.50,
              },
            ],
          })
          .expect(200);

        expect(response.body.data.items).toHaveLength(2);
      });
    });

    describe('Casos de error - Reglas de negocio', () => {
      it('debería retornar 422 si pedido ya está SERVED', async () => {
        await prisma.order.update({
          where: { id: testOrderId },
          data: { status: 'SERVED' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            notes: 'Too late',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });

      it('debería retornar 422 si pedido está CANCELLED', async () => {
        await prisma.order.update({
          where: { id: testOrderId },
          data: { status: 'CANCELLED' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            add_items: [
              {
                name: 'Item',
                quantity: 1,
                unit_price: 10.00,
              },
            ],
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /orders', () => {
    beforeEach(async () => {
      // Create multiple orders
      const statuses = ['PENDING', 'CONFIRMED', 'PREPARING'];
      for (let i = 0; i < 3; i++) {
        const order = await prisma.order.create({
          data: {
            id: `050e8400-e29b-41d4-a716-44665544000${i + f}`,
            restaurant_id: testRestaurantId,
            user_id: mockCustomer.id,
            order_number: `${Date.now()}${i}`,
            order_type: 'DINE_IN',
            subtotal: 25.00,
            tax_amount: 2.50,
            total_amount: 27.50,
            status: statuses[i],
          },
        });

        await prisma.orderItem.create({
          data: {
            id: `060e8400-e29b-41d4-a716-44665544000${i + h}`,
            order_id: order.id,
            name: `Item ${i + 1}`,
            quantity: 1,
            unit_price: 25.00,
            subtotal: 25.00,
          },
        });
      }
    });

    describe('Casos exitosos', () => {
      it('debería listar pedidos con paginación', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders?page=1&per_page=2')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(2);
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.per_page).toBe(2);
        expect(body.pagination.total).toBe(3);
      });

      it('debería filtrar por estado', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders?status=PENDING')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].status).toBe('PENDING');
      });

      it('debería filtrar por restaurante (solo owner/admin)', async () => {
        const response = await request(app.getHttpServer())
          .get(`/orders?restaurant_id=${testRestaurantId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(200);

        response.body.data.forEach((order: any) => {
          expect(order.restaurant_id).toBe(testRestaurantId);
        });
      });

      it('debería ordenar por fecha descendente', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders?sort_by=created_at&sort_order=desc')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const dates = response.body.data.map((order: any) => new Date(order.created_at));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
        }
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get('/orders')
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });
  });
});
