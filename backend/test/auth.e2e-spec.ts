import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'e2e-test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  const newUser = {
    name: 'Alice Admin',
    email: 'alice@example.com',
    password: 'supersecret1',
  };

  it('POST /api/auth/register creates a user and returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(newUser)
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body.user.email).toBe(newUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('POST /api/auth/register rejects a duplicate email', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(newUser).expect(409);
  });

  it('POST /api/auth/register rejects a short password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...newUser, email: 'short@example.com', password: '123' })
      .expect(400);
  });

  it('POST /api/auth/login rejects invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: newUser.email, password: 'wrong-password' })
      .expect(401);
  });

  it('POST /api/auth/login returns a token for valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: newUser.email, password: newUser.password })
      .expect(200);

    expect(res.body).toHaveProperty('access_token');
  });
});
