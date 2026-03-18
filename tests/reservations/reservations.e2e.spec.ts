import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ReservationsController (e2e)', () => {
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

    // Create test tables
    testTableId = '990e8400-e29b-41d4-a716-446655440004';
    await prisma.table.create({
      data: {
        id: testTableId,
        restaurant_id: testRestaurantId,
        table_number: 1,
        capacity: 4,
        location: 'Main Hall',
      },
    });

    await prisma.table.create({
      data: {
        id: 'aa0e8400-e29b-41d4-a716-446655440005',
        restaurant_id: testRestaurantId,
        table_number: 2,
        capacity: 6,
        location: 'Terrace',
      },
    });

    await prisma.table.create({
      data: {
        id: 'bb0e8400-e29b-41d4-a716-446655440006',
        restaurant_id: testRestaurantId,
        table_number: 3,
        capacity: 2,
        location: 'Main Hall',
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean reservations after each test
    await prisma.reservation.deleteMany();
  });

  describe('POST /reservations', () => {
    describe('Casos exitosos', () => {
      it('debería crear una reserva exitosamente', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
            special_requests: 'Birthday dinner',
          })
          .expect(201);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBeDefined();
        expect(body.data.restaurant_id).toBe(testRestaurantId);
        expect(body.data.user_id).toBe(mockCustomer.id);
        expect(body.data.party_size).toBe(4);
        expect(body.data.reservation_date).toBe('2024-12-25');
        expect(body.data.reservation_time).toBe('19:30');
        expect(body.data.special_requests).toBe('Birthday dinner');
        expect(body.data.status).toBe('PENDING');
      });

      it('debería asignar mesa automáticamente según capacidad', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_date: '2024-12-26',
            reservation_time: '20:00',
          })
          .expect(201);

        expect(response.body.data.table_id).toBeDefined();
        expect(response.body.data.table_id).toBe(testTableId);
      });

      it('debería crear reserva sin peticiones especiales', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 2,
            reservation_date: '2024-12-27',
            reservation_time: '18:00',
          })
          .expect(201);

        expect(response.body.data.special_requests).toBeNull();
      });

      it('debería asignar mesa más pequeña para grupo de 2', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 2,
            reservation_date: '2024-12-28',
            reservation_time: '19:00',
          })
          .expect(201);

        // Should assign table with capacity 2 (id: bb0e8400-e29b-41d4-a716-446655440006)
        expect(response.body.data.table_id).toBeDefined();
        const table = await prisma.table.findUnique({
          where: { id: response.body.data.table_id },
        });
        expect(table?.capacity).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si restaurant_id no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            party_size: 4,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si reservation_date no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_time: '19:30',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si reservation_time no está presente', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_date: '2024-12-25',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si reservation_date tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_date: 'invalid-date',
            reservation_time: '19:30',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si reservation_time tiene formato inválido', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_date: '2024-12-25',
            reservation_time: 'invalid-time',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size es menor que 1', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 0,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 400 si party_size excede máximo permitido', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 21,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si restaurante no existe', async () => {
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: '00000000-0000-0000-0000-000000000000',
            party_size: 4,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 404 si restaurante está inactivo', async () => {
        const inactiveRestaurant = await prisma.restaurant.create({
          data: {
            id: 'cc0e8400-e29b-41d4-a716-446655440007',
            owner_id: mockOwner.id,
            name: 'Inactive Restaurant',
            cuisine_type: 'Italian',
            address: '123 Inactive St',
            city: 'Madrid',
            country: 'Spain',
            phone: '+34912345678',
            email: 'inactive@restaurant.com',
            is_active: false,
          },
        });

        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: inactiveRestaurant.id,
            party_size: 4,
            reservation_date: '2024-12-25',
            reservation_time: '19:30',
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 422 si no hay mesa disponible', async () => {
        // Create existing reservation for the table
        await prisma.reservation.create({
          data: {
            id: 'dd0e8400-e29b-41d4-a716-446655440008',
            restaurant_id: testRestaurantId,
            user_id: mockCustomer.id,
            table_id: testTableId,
            reservation_date: new Date('2024-12-25'),
            reservation_time: '19:30',
            party_size: 4,
            status: 'CONFIRMED',
          },
        });

        // Try to create overlapping reservation
        const response = await request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurant_id: testRestaurantId,
            party_size: 4,
            reservation_date: '2024-12-25',
            reservation_time: '19:45',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /reservations/:id', () => {
    let testReservationId: string;

    beforeEach(async () => {
      testReservationId = 'ee0e8400-e29b-41d4-a716-446655440009';
      await prisma.reservation.create({
        data: {
          id: testReservationId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          table_id: testTableId,
          reservation_date: new Date('2024-12-25'),
          reservation_time: '19:30',
          party_size: 4,
          status: 'CONFIRMED',
          special_requests: 'Birthday dinner',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería obtener reserva del usuario actual', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        const body = response.body;
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(testReservationId);
        expect(body.data.restaurant_id).toBe(testRestaurantId);
        expect(body.data.party_size).toBe(4);
        expect(body.data.status).toBe('CONFIRMED');
        expect(body.data.special_requests).toBe('Birthday dinner');
      });

      it('debería incluir información del restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body.data.restaurant).toBeDefined();
        expect(response.body.data.restaurant.name).toBe('Test Restaurant');
      });

      it('debería permitir al admin ver cualquier reserva', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.data.id).toBe(testReservationId);
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si usuario intenta ver reserva de otro', async () => {
        const otherCustomer = await prisma.user.create({
          data: {
            id: 'ff0e8400-e29b-41d4-a716-44665544000a',
            email: 'othercustomer@example.com',
            full_name: 'Other Customer',
            role: 'CUSTOMER',
            is_active: true,
            password_hash: 'hashed',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        const otherLogin = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'othercustomer@example.com', password: 'password123' });

        const otherToken = otherLogin.body.data.tokens.access_token;

        const response = await request(app.getHttpServer())
          .get(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reservations/${testReservationId}`)
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .get('/reservations/invalid-id')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si reserva no existe', async () => {
        const response = await request(app.getHttpServer())
          .get('/reservations/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  describe('PATCH /reservations/:id', () => {
    let testReservationId: string;

    beforeEach(async () => {
      testReservationId = '010e8400-e29b-41d4-a716-44665544000b';
      await prisma.reservation.create({
        data: {
          id: testReservationId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          table_id: testTableId,
          reservation_date: new Date('2024-12-25'),
          reservation_time: '19:30',
          party_size: 4,
          status: 'PENDING',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería actualizar tamaño del grupo', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            party_size: 6,
          })
          .expect(200);

        expect(response.body.data.party_size).toBe(6);
      });

      it('debería actualizar fecha y hora', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            reservation_date: '2024-12-26',
            reservation_time: '20:00',
          })
          .expect(200);

        expect(response.body.data.reservation_date).toBe('2024-12-26');
        expect(response.body.data.reservation_time).toBe('20:00');
      });

      it('debería actualizar peticiones especiales', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            special_requests: 'Vegetarian menu needed',
          })
          .expect(200);

        expect(response.body.data.special_requests).toBe('Vegetarian menu needed');
      });

      it('debería permitir al owner confirmar reserva', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(200);

        expect(response.body.data.status).toBe('CONFIRMED');
      });

      it('debería permitir al owner marcar como sentado', async () => {
        await prisma.reservation.update({
          where: { id: testReservationId },
          data: { status: 'CONFIRMED' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'SEATED',
          })
          .expect(200);

        expect(response.body.data.status).toBe('SEATED');
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 403 si usuario intenta cambiar estado', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            status: 'CONFIRMED',
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 403 si usuario intenta modificar reserva de otro', async () => {
        const otherCustomer = await prisma.user.create({
          data: {
            id: '020e8400-e29b-41d4-a716-44665544000c',
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
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({
            party_size: 3,
          })
          .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
      });

      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .send({
            party_size: 3,
          })
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('Casos de error - Validación', () => {
      it('debería retornar 400 si ID no es un UUID válido', async () => {
        const response = await request(app.getHttpServer())
          .patch('/reservations/invalid-id')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            party_size: 3,
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 404 si reserva no existe', async () => {
        const response = await request(app.getHttpServer())
          .patch('/reservations/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            party_size: 3,
          })
          .expect(404);

        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('debería retornar 400 si reservation_date es pasada', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            reservation_date: '2020-01-01',
          })
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('debería retornar 422 si transición de estado inválida', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            status: 'CANCELLED',
          })
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('PATCH /reservations/:id/cancel', () => {
    let testReservationId: string;

    beforeEach(async () => {
      testReservationId = '030e8400-e29b-41d4-a716-44665544000d';
      await prisma.reservation.create({
        data: {
          id: testReservationId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          table_id: testTableId,
          reservation_date: new Date('2024-12-25'),
          reservation_time: '19:30',
          party_size: 4,
          status: 'CONFIRMED',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería cancelar reserva como usuario', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}/cancel`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({})
          .expect(200);

        expect(response.body.data.status).toBe('CANCELLED');
      });

      it('debería cancelar reserva como owner', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}/cancel`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({})
          .expect(200);

        expect(response.body.data.status).toBe('CANCELLED');
      });
    });

    describe('Casos de error - Reglas de negocio', () => {
      it('debería retornar 422 si reserva ya está cancelada', async () => {
        await prisma.reservation.update({
          where: { id: testReservationId },
          data: { status: 'CANCELLED' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}/cancel`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({})
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });

      it('debería retornar 422 si reserva ya está completada', async () => {
        await prisma.reservation.update({
          where: { id: testReservationId },
          data: { status: 'NO_SHOW' },
        });

        const response = await request(app.getHttpServer())
          .patch(`/reservations/${testReservationId}/cancel`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({})
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('DELETE /reservations/:id', () => {
    let testReservationId: string;

    beforeEach(async () => {
      testReservationId = '040e8400-e29b-41d4-a716-44665544000e';
      await prisma.reservation.create({
        data: {
          id: testReservationId,
          restaurant_id: testRestaurantId,
          user_id: mockCustomer.id,
          table_id: testTableId,
          reservation_date: new Date('2024-12-25'),
          reservation_time: '19:30',
          party_size: 4,
          status: 'CANCELLED',
        },
      });
    });

    describe('Casos exitosos', () => {
      it('debería eliminar reserva como usuario', async () => {
        await request(app.getHttpServer())
          .delete(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(204);

        const deleted = await prisma.reservation.findUnique({
          where: { id: testReservationId },
        });
        expect(deleted).toBeNull();
      });

      it('debería eliminar reserva como admin', async () => {
        await request(app.getHttpServer())
          .delete(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);

        const deleted = await prisma.reservation.findUnique({
          where: { id: testReservationId },
        });
        expect(deleted).toBeNull();
      });
    });

    describe('Casos de error - Reglas de negocio', () => {
      it('debería retornar 422 si reserva está activa (no cancelada)', async () => {
        await prisma.reservation.update({
          where: { id: testReservationId },
          data: { status: 'CONFIRMED' },
        });

        const response = await request(app.getHttpServer())
          .delete(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });

      it('debería retornar 422 si reserva está sentada', async () => {
        await prisma.reservation.update({
          where: { id: testReservationId },
          data: { status: 'SEATED' },
        });

        const response = await request(app.getHttpServer())
          .delete(`/reservations/${testReservationId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(422);

        expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      });
    });
  });

  describe('GET /reservations', () => {
    beforeEach(async () => {
      // Create multiple reservations
      for (let i = 0; i < 3; i++) {
        await prisma.reservation.create({
          data: {
            id: `050e8400-e29b-41d4-a716-44665544000${i + f}`,
            restaurant_id: testRestaurantId,
            user_id: mockCustomer.id,
            table_id: testTableId,
            reservation_date: new Date(`2024-12-${25 + i}`),
            reservation_time: '19:30',
            party_size: 4,
            status: i === 0 ? 'CONFIRMED' : i === 1 ? 'PENDING' : 'CANCELLED',
          },
        });
      }
    });

    describe('Casos exitosos', () => {
      it('debería listar reservas con paginación', async () => {
        const response = await request(app.getHttpServer())
          .get('/reservations?page=1&per_page=2')
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
          .get('/reservations?status=CONFIRMED')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].status).toBe('CONFIRMED');
      });

      it('debería filtrar por restaurante', async () => {
        const response = await request(app.getHttpServer())
          .get(`/reservations?restaurant_id=${testRestaurantId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        response.body.data.forEach((reservation: any) => {
          expect(reservation.restaurant_id).toBe(testRestaurantId);
        });
      });
    });

    describe('Casos de error - Autorización', () => {
      it('debería retornar 401 sin token de autenticación', async () => {
        const response = await request(app.getHttpServer())
          .get('/reservations')
          .expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });
  });
});
